import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';
import {
  CAMPANA_CERRADA,
  CAMPANA_EN_CURSO,
} from 'src/common/resultados/campana';
import { ActualizarCampanaDto, CrearCampanaDto } from './dto/campana.dto';

type Tx = Prisma.TransactionClient;

/** Campos de configuración que una campaña copia de la anterior / la empresa. */
const CAMPOS_CONFIG = [
  'modeloEmpresa',
  'porcentajeCompetecias',
  'porcentajeObjetivos',
  'porcentajeEvaluacionJefeCompetencia',
  'porcentajeEvaluacionSubordinadoCompetencia',
  'tipoCalificacionCompetencia',
  'competenciaResultadoEsperado',
] as const;

const aFecha = (v?: string | null) => (v ? new Date(v) : null);

/**
 * `PurgeResponseInterceptor` borra de toda respuesta las claves `estado` y
 * `fechaCreacion`: el estado de la campaña y su fecha de apertura viajan con
 * otro nombre.
 */
export const paraRespuesta = <T extends { estado: string; fechaCreacion: Date }>(
  c: T,
) => ({ ...c, estadoCampana: c.estado, fechaApertura: c.fechaCreacion });
const fechaCorta = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Campañas (ciclos) de evaluación. Reglas:
 * - Una sola campaña EN_CURSO por empresa: con varias, cada pantalla de
 *   evaluación tendría que preguntar a cuál corresponde.
 * - Los periodos evaluados de una empresa no se superponen.
 * - Las vigencias no empiezan antes del periodo evaluado.
 * - Cerrar pasa sus evaluaciones a CERRADA (solo lectura). Reabrir lo
 *   revierte y queda registrado quién y cuándo.
 *
 * Mientras el formulario de empresa siga mostrando vigencias y pesos, abrir o
 * editar la campaña en curso los refleja también en la empresa (y al revés,
 * ver EmpresaEmpleadoraService.update): las pantallas de evaluación todavía
 * leen las fechas de la empresa.
 */
@Injectable()
export class CampanaService {
  private readonly logger = new Logger(CampanaService.name);

  constructor(private prisma: PrismaService) {}

  // ─────────────────────────── lectura ───────────────────────────

  async listar(idEmpresaEmpleadora: number) {
    const campanas = await this.prisma.campanaEvaluacion.findMany({
      where: { idEmpresaEmpleadora: Number(idEmpresaEmpleadora) },
      orderBy: { periodoDesde: 'desc' },
      include: {
        _count: { select: { evaluaciones: true, objetivos: true } },
      },
    });
    // La en curso primero.
    return campanas
      .sort(
        (a, b) =>
          Number(b.estado === CAMPANA_EN_CURSO) -
          Number(a.estado === CAMPANA_EN_CURSO),
      )
      .map(paraRespuesta);
  }

  async obtener(id: number) {
    const campana = await this.prisma.campanaEvaluacion.findUnique({
      where: { idCampanaEvaluacion: id },
      include: {
        empresaEmpleadora: {
          select: { idEmpresaEmpleadora: true, nombreEmpresa: true },
        },
        _count: { select: { evaluaciones: true, objetivos: true } },
      },
    });
    if (!campana) throw new NotFoundException('Campaña no encontrada.');
    return campana;
  }

  /**
   * Lo que queda pendiente si se cierra hoy: el administrador lo ve antes de
   * confirmar. Lo que no se calificó queda "sin evaluar" para siempre.
   */
  async impactoCierre(id: number) {
    const campana = await this.obtener(id);

    const [evaluacionesAbiertas, itemsSinCalificar, detallesSinCalificar] =
      await Promise.all([
        this.prisma.evaluacionCompetencia.count({
          where: {
            idCampanaEvaluacion: id,
            estado: true,
            estadoEvaluacion: 'PROCESO',
          },
        }),
        this.prisma.evaluacionCompetenciaItem.count({
          where: {
            estado: true,
            calificacion: null,
            evaluacion: {
              idCampanaEvaluacion: id,
              estado: true,
              estadoEvaluacion: 'PROCESO',
            },
          },
        }),
        this.prisma.objetivoDetalle.count({
          where: {
            estado: true,
            porcentajeLogrado: null,
            objetivo: { idCampanaEvaluacion: id, estado: true },
          },
        }),
      ]);

    return {
      idCampanaEvaluacion: id,
      nombre: campana.nombre,
      estado: campana.estado,
      evaluacionesAbiertas,
      itemsSinCalificar,
      detallesObjetivoSinCalificar: detallesSinCalificar,
    };
  }

  // ─────────────────────────── escritura ───────────────────────────

  async abrir(user: AuthUser, dto: CrearCampanaDto) {
    const idEmpresa = Number(dto.idEmpresaEmpleadora);
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: { idEmpresaEmpleadora: idEmpresa, estado: true },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada.');

    this.validarFechas(dto);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const actual = await tx.campanaEvaluacion.findFirst({
          where: { idEmpresaEmpleadora: idEmpresa, estado: CAMPANA_EN_CURSO },
        });

        if (actual && !dto.cerrarActual) {
          throw new ConflictException(
            `La empresa ya tiene la campaña "${actual.nombre}" en curso. Ciérrala primero o ábrela con "cerrar la actual".`,
          );
        }
        if (actual) await this.cerrarEn(tx, user, actual.idCampanaEvaluacion);

        await this.validarSinSuperposicion(
          tx,
          idEmpresa,
          new Date(dto.periodoDesde),
          new Date(dto.periodoHasta),
        );

        // La configuración no enviada se copia de la anterior (la recién
        // cerrada o la última), o de la empresa si es la primera.
        const anterior =
          actual ??
          (await tx.campanaEvaluacion.findFirst({
            where: { idEmpresaEmpleadora: idEmpresa },
            orderBy: { periodoDesde: 'desc' },
          }));
        const base = anterior ?? empresa;
        const config = Object.fromEntries(
          CAMPOS_CONFIG.map((c) => [c, dto[c] !== undefined ? dto[c] : base[c]]),
        ) as Pick<Prisma.CampanaEvaluacionUncheckedCreateInput, (typeof CAMPOS_CONFIG)[number]>;

        const nueva = await tx.campanaEvaluacion.create({
          data: {
            idEmpresaEmpleadora: idEmpresa,
            nombre: dto.nombre.trim(),
            periodoDesde: new Date(dto.periodoDesde),
            periodoHasta: new Date(dto.periodoHasta),
            fechaVigenciaInicio: new Date(dto.fechaVigenciaInicio),
            fechaVigenciaFin: new Date(dto.fechaVigenciaFin),
            fechaVigenciaInicioObjetivo: aFecha(dto.fechaVigenciaInicioObjetivo),
            fechaVigenciaFinObjetivo: aFecha(dto.fechaVigenciaFinObjetivo),
            ...config,
            modeloEmpresa: config.modeloEmpresa ?? '90',
            estado: CAMPANA_EN_CURSO,
            creadoPorId: user.idUsuario,
          },
        });

        await this.reflejarEnEmpresa(tx, user, nueva);

        let objetivosCopiados = 0;
        if (dto.copiarObjetivos && anterior) {
          objetivosCopiados = await this.copiarObjetivos(
            tx,
            user,
            anterior.idCampanaEvaluacion,
            nueva.idCampanaEvaluacion,
            idEmpresa,
          );
        }

        return { campana: nueva, campanaCerrada: actual?.nombre ?? null, objetivosCopiados };
      });
    } catch (error) {
      this.logger.error('Error al abrir la campaña', error as Error);
      handlePrismaError(error, 'campaña');
    }
  }

  async actualizar(user: AuthUser, id: number, dto: ActualizarCampanaDto) {
    const campana = await this.obtener(id);

    // Una cerrada conserva su configuración y sus vigencias: son con las que
    // se calificó. Solo se puede corregir cómo se llama y qué periodo evaluó
    // (las migradas nacieron con el mes como periodo).
    if (campana.estado === CAMPANA_CERRADA) {
      const permitidos = ['nombre', 'periodoDesde', 'periodoHasta'];
      const otros = Object.keys(dto).filter(
        (k) => dto[k] !== undefined && !permitidos.includes(k),
      );
      if (otros.length) {
        throw new BadRequestException(
          'En una campaña cerrada solo se pueden corregir el nombre y el periodo evaluado.',
        );
      }
    }

    const resultante = {
      periodoDesde: dto.periodoDesde ?? fechaCorta(campana.periodoDesde),
      periodoHasta: dto.periodoHasta ?? fechaCorta(campana.periodoHasta),
      fechaVigenciaInicio: dto.fechaVigenciaInicio ?? fechaCorta(campana.fechaVigenciaInicio),
      fechaVigenciaFin: dto.fechaVigenciaFin ?? fechaCorta(campana.fechaVigenciaFin),
    };
    // En una cerrada las vigencias no se validan contra el periodo: son
    // historia (las migradas no las cumplen y no se pueden cambiar).
    this.validarFechas(resultante, campana.estado !== CAMPANA_CERRADA);

    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.validarSinSuperposicion(
          tx,
          campana.idEmpresaEmpleadora,
          new Date(resultante.periodoDesde),
          new Date(resultante.periodoHasta),
          id,
        );

        const actualizada = await tx.campanaEvaluacion.update({
          where: { idCampanaEvaluacion: id },
          data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
            ...(dto.periodoDesde && { periodoDesde: new Date(dto.periodoDesde) }),
            ...(dto.periodoHasta && { periodoHasta: new Date(dto.periodoHasta) }),
            ...(dto.fechaVigenciaInicio && {
              fechaVigenciaInicio: new Date(dto.fechaVigenciaInicio),
            }),
            ...(dto.fechaVigenciaFin && {
              fechaVigenciaFin: new Date(dto.fechaVigenciaFin),
            }),
            ...(dto.fechaVigenciaInicioObjetivo !== undefined && {
              fechaVigenciaInicioObjetivo: aFecha(dto.fechaVigenciaInicioObjetivo),
            }),
            ...(dto.fechaVigenciaFinObjetivo !== undefined && {
              fechaVigenciaFinObjetivo: aFecha(dto.fechaVigenciaFinObjetivo),
            }),
            ...Object.fromEntries(
              CAMPOS_CONFIG.filter((c) => dto[c] !== undefined).map((c) => [c, dto[c]]),
            ),
          },
        });

        if (actualizada.estado === CAMPANA_EN_CURSO) {
          await this.reflejarEnEmpresa(tx, user, actualizada);
        }
        return actualizada;
      });
    } catch (error) {
      this.logger.error('Error al actualizar la campaña', error as Error);
      handlePrismaError(error, 'campaña');
    }
  }

  async cerrar(user: AuthUser, id: number) {
    const campana = await this.obtener(id);
    if (campana.estado === CAMPANA_CERRADA) {
      throw new BadRequestException('La campaña ya está cerrada.');
    }
    try {
      await this.prisma.$transaction((tx) => this.cerrarEn(tx, user, id));
      return this.obtener(id);
    } catch (error) {
      this.logger.error('Error al cerrar la campaña', error as Error);
      handlePrismaError(error, 'campaña');
    }
  }

  async reabrir(user: AuthUser, id: number) {
    const campana = await this.obtener(id);
    if (campana.estado !== CAMPANA_CERRADA) {
      throw new BadRequestException('Solo se puede reabrir una campaña cerrada.');
    }
    const enCurso = await this.prisma.campanaEvaluacion.findFirst({
      where: {
        idEmpresaEmpleadora: campana.idEmpresaEmpleadora,
        estado: CAMPANA_EN_CURSO,
      },
    });
    if (enCurso) {
      throw new ConflictException(
        `No se puede reabrir: "${enCurso.nombre}" está en curso. Ciérrala primero.`,
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // La foto de asignaciones era del cierre: al reabrir manda otra vez
        // la unidad de cada trabajador.
        await tx.campanaAsignacion.deleteMany({
          where: { idCampanaEvaluacion: id },
        });
        // Las evaluaciones que cerró la campaña vuelven a editarse.
        await tx.evaluacionCompetencia.updateMany({
          where: { idCampanaEvaluacion: id, estadoEvaluacion: 'CERRADA' },
          data: {
            estadoEvaluacion: 'PROCESO',
            actualizadoPorId: user.idUsuario,
            fechaModificacion: new Date(),
          },
        });
        const reabierta = await tx.campanaEvaluacion.update({
          where: { idCampanaEvaluacion: id },
          data: {
            estado: CAMPANA_EN_CURSO,
            fechaReapertura: new Date(),
            reabiertoPorId: user.idUsuario,
          },
        });
        await this.reflejarEnEmpresa(tx, user, reabierta);
        return reabierta;
      });
    } catch (error) {
      this.logger.error('Error al reabrir la campaña', error as Error);
      handlePrismaError(error, 'campaña');
    }
  }

  // ─────────────────────────── internos ───────────────────────────

  private async cerrarEn(tx: Tx, user: AuthUser, id: number) {
    const ahora = new Date();
    const { idEmpresaEmpleadora } = await tx.campanaEvaluacion.findUniqueOrThrow({
      where: { idCampanaEvaluacion: id },
      select: { idEmpresaEmpleadora: true },
    });

    // Foto de lo que le tocaba a cada uno (ver CampanaAsignacion): los
    // activos y también quien ya no está pero fue evaluado en la campaña.
    await tx.$executeRaw`
      INSERT INTO campana_asignacion
        (id_campana_evaluacion, id_empleado, id_competencia, id_competencia_nivel)
      SELECT ${id}, e.id_empleado, ucn.id_competencia, ucn.id_competencia_nivel
      FROM empleado e
      JOIN unidad_ocupacional_competencia_nivel ucn
        ON ucn.id_unidad_ocupacional_empleadora = e.id_unidad_ocupacional_empleadora
      JOIN competencia c ON c.id_competencia = ucn.id_competencia AND c.estado
      JOIN competencia_nivel n
        ON n.id_competencia_nivel = ucn.id_competencia_nivel AND n.estado
      WHERE e.id_empresa_empleadora = ${idEmpresaEmpleadora}
        AND (e.estado OR EXISTS (
          SELECT 1 FROM evaluacion_competencia ec
          WHERE ec.id_evaluado = e.id_empleado
            AND ec.id_campana_evaluacion = ${id}))
      ON CONFLICT DO NOTHING`;

    await tx.evaluacionCompetencia.updateMany({
      where: { idCampanaEvaluacion: id, estadoEvaluacion: 'PROCESO' },
      data: {
        estadoEvaluacion: 'CERRADA',
        actualizadoPorId: user.idUsuario,
        fechaModificacion: ahora,
      },
    });
    await tx.campanaEvaluacion.update({
      where: { idCampanaEvaluacion: id },
      data: {
        estado: CAMPANA_CERRADA,
        fechaCierre: ahora,
        cerradoPorId: user.idUsuario,
      },
    });
  }

  private validarFechas(
    f: {
      periodoDesde: string;
      periodoHasta: string;
      fechaVigenciaInicio: string;
      fechaVigenciaFin: string;
    },
    validarVigenciaContraPeriodo = true,
  ) {
    const [pd, ph, vi, vf] = [
      f.periodoDesde,
      f.periodoHasta,
      f.fechaVigenciaInicio,
      f.fechaVigenciaFin,
    ].map((x) => new Date(x).getTime());

    if (ph < pd) {
      throw new BadRequestException(
        'El fin del periodo evaluado no puede ser anterior a su inicio.',
      );
    }
    if (vf < vi) {
      throw new BadRequestException(
        'El fin de la vigencia no puede ser anterior a su inicio.',
      );
    }
    if (validarVigenciaContraPeriodo && vi < pd) {
      throw new BadRequestException(
        'La evaluación no puede empezar antes del periodo que evalúa.',
      );
    }
  }

  private async validarSinSuperposicion(
    tx: Tx,
    idEmpresa: number,
    desde: Date,
    hasta: Date,
    excluirId?: number,
  ) {
    const choque = await tx.campanaEvaluacion.findFirst({
      where: {
        idEmpresaEmpleadora: idEmpresa,
        ...(excluirId && { idCampanaEvaluacion: { not: excluirId } }),
        periodoDesde: { lte: hasta },
        periodoHasta: { gte: desde },
      },
    });
    if (choque) {
      throw new ConflictException(
        `El periodo se superpone con el de "${choque.nombre}" (${fechaCorta(choque.periodoDesde)} – ${fechaCorta(choque.periodoHasta)}).`,
      );
    }
  }

  /**
   * Transición: las pantallas de evaluación y el formulario de empresa aún
   * leen vigencias y configuración de la empresa. La campaña en curso manda y
   * se copia ahí.
   */
  private async reflejarEnEmpresa(
    tx: Tx,
    user: AuthUser,
    c: Prisma.CampanaEvaluacionGetPayload<object>,
  ) {
    await tx.empresaEmpleadora.update({
      where: { idEmpresaEmpleadora: c.idEmpresaEmpleadora },
      data: {
        fechaVigenciaInicio: c.fechaVigenciaInicio,
        fechaVigenciaFin: c.fechaVigenciaFin,
        fechaVigenciaInicioObjetivo: c.fechaVigenciaInicioObjetivo,
        fechaVigenciaFinObjetivo: c.fechaVigenciaFinObjetivo,
        ...Object.fromEntries(CAMPOS_CONFIG.map((k) => [k, c[k]])),
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
  }

  /**
   * Copia los objetivos de la campaña anterior a la nueva, SIN calificación
   * (meta alcanzada y % logrado en null), solo para trabajadores activos de
   * la empresa. La retroalimentación no se copia: es de la campaña anterior.
   */
  private async copiarObjetivos(
    tx: Tx,
    user: AuthUser,
    idOrigen: number,
    idDestino: number,
    idEmpresa: number,
  ) {
    const objetivos = await tx.objetivo.findMany({
      where: {
        idCampanaEvaluacion: idOrigen,
        estado: true,
        empleado: { estado: true, idEmpresaEmpleadora: idEmpresa },
      },
      include: { objetivoDetalles: { where: { estado: true } } },
    });

    for (const o of objetivos) {
      await tx.objetivo.create({
        data: {
          idEmpleado: o.idEmpleado,
          idCampanaEvaluacion: idDestino,
          creadoPorId: user.idUsuario,
          estado: true,
          objetivoDetalles: {
            create: o.objetivoDetalles.map((d) => ({
              secuencial: d.secuencial,
              tipoCalculo: d.tipoCalculo,
              descripcion: d.descripcion,
              descripcionIniciativa: d.descripcionIniciativa,
              unidadMedida: d.unidadMedida,
              pesoEspecifico: d.pesoEspecifico,
              metaObjetivo: d.metaObjetivo,
              metaAlcanzada: null,
              porcentajeLogrado: null,
              fechaCulminacion: d.fechaCulminacion,
              estado: true,
              creadoPorId: user.idUsuario,
            })),
          },
        },
      });
    }
    return objetivos.length;
  }
}
