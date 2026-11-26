import { CompetenciaService } from 'src/competencia/competencia.service';
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
import { OPCIONES_LIKERT } from 'src/common/resultados/resultados-evaluacion';
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
export const paraRespuesta = <
  T extends { estado: string; fechaCreacion: Date },
>(
  c: T,
) => ({ ...c, estadoCampana: c.estado, fechaApertura: c.fechaCreacion });
const fechaCorta = (d: Date) => d.toISOString().slice(0, 10);
/** "31/12/2026": para los mensajes que lee el usuario. */
const fechaLegible = (d: Date) => fechaCorta(d).split('-').reverse().join('/');

/**
 * Campañas (ciclos) de evaluación. Reglas:
 * - Una sola campaña EN_CURSO por empresa: con varias, cada pantalla de
 *   evaluación tendría que preguntar a cuál corresponde.
 * - Los periodos evaluados de una empresa no se superponen.
 * - Las vigencias no empiezan antes del periodo evaluado.
 * - Cerrar pasa sus evaluaciones a CERRADA (solo lectura). Reabrir lo
 *   revierte y queda registrado quién y cuándo.
 *
 * Las pantallas de evaluación leen fechas, modelo y escala "de la empresa":
 * la API de empresas se los devuelve ya combinados con los de la campaña en
 * curso (EmpresaEmpleadoraService.conCampanaEnCurso).
 */
@Injectable()
export class CampanaService {
  private readonly logger = new Logger(CampanaService.name);

  constructor(
    private prisma: PrismaService,
    private competencias: CompetenciaService,
  ) {}

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
            // Solo de quien sigue activo: los objetivos de un cesado o
            // suspendido ya no se van a calificar y no deben alarmar.
            objetivo: {
              idCampanaEvaluacion: id,
              estado: true,
              empleado: { estado: true },
            },
          },
        }),
      ]);

    // 180°: competencias que ya tienen nota de subordinados pero ninguna del
    // jefe. Al cerrar, la parte del jefe (70 %) cuenta como 0 y la nota queda
    // muy baja (subordinados 90 → 27). Se listan para avisar antes.
    const sinNotaDelJefe =
      campana.modeloEmpresa === '180'
        ? await this.competenciasSinNotaDelJefe(id)
        : [];
    // Retroalimentación: evaluados sin sesión y los que no están conformes.
    // Lo ideal es resolverlo antes de cerrar (calibración y sesión).
    let sinRetroalimentacion = 0;
    let noConformes = 0;
    if (campana.estado === 'EN_CURSO') {
      const [{ filas }, sesiones] = await Promise.all([
        this.competencias.resultadosDeEmpresa(campana.idEmpresaEmpleadora, id),
        this.prisma.sesionRetroalimentacion.findMany({
          where: { idCampanaEvaluacion: id },
          select: { idEmpleado: true, conformidad: true },
        }),
      ]);
      const conSesion = new Set(sesiones.map((s) => s.idEmpleado));
      sinRetroalimentacion = filas.filter(
        (f) => !f.resultado.sinEvaluar && !conSesion.has(f.idEmpleado),
      ).length;
      noConformes = sesiones.filter(
        (s) => s.conformidad === 'NO_CONFORME',
      ).length;
    }
    return {
      idCampanaEvaluacion: id,
      nombre: campana.nombre,
      estado: campana.estado,
      evaluacionesAbiertas,
      itemsSinCalificar,
      detallesObjetivoSinCalificar: detallesSinCalificar,
      sinNotaDelJefe,
      sinRetroalimentacion,
      noConformes,
    };
  }

  /**
   * Lo que se mueve al editar una campaña en curso: sus resultados no se
   * guardan, se calculan con la configuración vigente, así que cambiar pesos
   * recalcula a todos (también a los ya calificados). El administrador lo ve
   * antes de guardar.
   */
  async impactoEdicion(id: number) {
    const campana = await this.obtener(id);
    const calificada = { estado: true, calificacion: { not: null } };
    const [
      trabajadores,
      evaluadosCompetencias,
      evaluadosObjetivos,
      items,
      detalles,
    ] = await Promise.all([
      this.prisma.empleado.count({
        where: {
          idEmpresaEmpleadora: campana.idEmpresaEmpleadora,
          estado: true,
          situacion: 'ACTIVO',
        },
      }),
      this.prisma.evaluacionCompetencia.findMany({
        where: {
          idCampanaEvaluacion: id,
          estado: true,
          estadoEvaluacion: { not: 'ANULADA' },
          itemsEvaluados: { some: calificada },
        },
        select: { idEvaluado: true },
        distinct: ['idEvaluado'],
      }),
      this.prisma.objetivo.findMany({
        where: {
          idCampanaEvaluacion: id,
          estado: true,
          objetivoDetalles: {
            some: { estado: true, porcentajeLogrado: { not: null } },
          },
        },
        select: { idEmpleado: true },
        distinct: ['idEmpleado'],
      }),
      this.prisma.evaluacionCompetenciaItem.count({
        where: {
          ...calificada,
          evaluacion: {
            idCampanaEvaluacion: id,
            estado: true,
            estadoEvaluacion: { not: 'ANULADA' },
          },
        },
      }),
      this.prisma.objetivoDetalle.count({
        where: {
          estado: true,
          porcentajeLogrado: { not: null },
          objetivo: { idCampanaEvaluacion: id, estado: true },
        },
      }),
    ]);

    // Lo que movería un cambio excepcional: notas que la escala Likert no
    // admite (se vacían si se pasa a Likert) y notas de subordinados (dejan
    // de contar si se pasa a 90°).
    const enLaCampana = {
      idCampanaEvaluacion: id,
      estado: true,
      estadoEvaluacion: { not: 'ANULADA' },
    };
    const [notasFueraDeLikert, notasDeSubordinados] = await Promise.all([
      this.prisma.evaluacionCompetenciaItem.count({
        where: {
          estado: true,
          calificacion: { not: null, notIn: OPCIONES_LIKERT },
          evaluacion: enLaCampana,
        },
      }),
      this.prisma.evaluacionCompetenciaItem.count({
        where: {
          ...calificada,
          evaluacion: { ...enLaCampana, tipoEvaluador: 'SUBORDINADO' },
        },
      }),
    ]);

    const conCalificaciones = new Set([
      ...evaluadosCompetencias.map((e) => e.idEvaluado),
      ...evaluadosObjetivos.map((o) => o.idEmpleado),
    ]).size;

    return {
      idCampanaEvaluacion: id,
      estado: campana.estado,
      trabajadores,
      conCalificaciones,
      competenciasCalificadas: items,
      objetivosCalificados: detalles,
      notasFueraDeLikert,
      notasDeSubordinados,
      // Con notas puestas, modelo y escala solo se cambian como cambio
      // excepcional (ver `actualizar`).
      configuracionBloqueada: items + detalles > 0,
    };
  }

  private async competenciasSinNotaDelJefe(id: number) {
    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        idCampanaEvaluacion: id,
        estado: true,
        estadoEvaluacion: { not: 'ANULADA' },
        tipoEvaluador: { in: ['JEFE', 'SUBORDINADO'] },
        itemsEvaluados: { some: { estado: true, calificacion: { not: null } } },
      },
      select: {
        idEvaluado: true,
        idCompetencia: true,
        tipoEvaluador: true,
        evaluado: {
          select: {
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
            codigoEmpleadoJefe: true,
          },
        },
        competencia: { select: { titulo: true } },
      },
    });
    // Quien ya tiene sus competencias calibradas no necesita aviso: el
    // comité fijó su nota.
    const calibrados = new Set(
      (
        await this.prisma.ajusteCalibracion.findMany({
          where: { idCampanaEvaluacion: id, competencias: { not: null } },
          select: { idEmpleado: true },
        })
      ).map((a) => a.idEmpleado),
    );
    const porPar = new Map<
      string,
      {
        trabajador: string;
        codigo: string;
        competencia: string;
        jefe: boolean;
        sinJefe: boolean;
      }
    >();
    for (const ev of evaluaciones) {
      if (ev.idEvaluado && calibrados.has(ev.idEvaluado)) continue;
      const clave = `${ev.idEvaluado}-${ev.idCompetencia}`;
      const actual = porPar.get(clave) ?? {
        trabajador:
          `${ev.evaluado?.nombres ?? ''} ${ev.evaluado?.apellidos ?? ''}`.trim(),
        codigo: ev.evaluado?.codigoEmpleado ?? '',
        competencia: ev.competencia.titulo,
        jefe: false,
        sinJefe: !ev.evaluado?.codigoEmpleadoJefe,
      };
      if (ev.tipoEvaluador === 'JEFE') actual.jefe = true;
      porPar.set(clave, actual);
    }
    // Sin jefe (la cabeza de la empresa) no se avisa: en 180° lo califican
    // sus subordinados al 100 % (`evaluadoSinJefe`) y no pierde nada.
    return [...porPar.values()]
      .filter((p) => !p.jefe && !p.sinJefe)
      .map(({ trabajador, codigo, competencia, sinJefe }) => ({
        trabajador,
        codigo,
        competencia,
        sinJefe,
      }))
      .sort((a, b) => a.trabajador.localeCompare(b.trabajador));
  }

  // ─────────────────────────── escritura ───────────────────────────

  async abrir(user: AuthUser, dto: CrearCampanaDto) {
    const idEmpresa = Number(dto.idEmpresaEmpleadora);
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: { idEmpresaEmpleadora: idEmpresa, estado: true },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada.');

    this.validarFechas(dto);
    this.validarFijacion(
      dto.fechaVigenciaInicioObjetivo,
      dto.fechaVigenciaFinObjetivo,
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        const actual = await tx.campanaEvaluacion.findFirst({
          where: { idEmpresaEmpleadora: idEmpresa, estado: CAMPANA_EN_CURSO },
        });

        if (actual && !dto.cerrarActual) {
          throw new ConflictException(
            `La empresa ya tiene la campaña "${actual.nombre}" en curso. Ciérrela primero o ábrala con "cerrar la actual".`,
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
          CAMPOS_CONFIG.map((c) => [
            c,
            dto[c] !== undefined ? dto[c] : base[c],
          ]),
        ) as Pick<
          Prisma.CampanaEvaluacionUncheckedCreateInput,
          (typeof CAMPOS_CONFIG)[number]
        >;
        this.validarPesos(config);

        const nueva = await tx.campanaEvaluacion.create({
          data: {
            idEmpresaEmpleadora: idEmpresa,
            nombre: dto.nombre.trim(),
            periodoDesde: new Date(dto.periodoDesde),
            periodoHasta: new Date(dto.periodoHasta),
            fechaVigenciaInicio: new Date(dto.fechaVigenciaInicio),
            fechaVigenciaFin: new Date(dto.fechaVigenciaFin),
            fechaVigenciaInicioObjetivo: aFecha(
              dto.fechaVigenciaInicioObjetivo,
            ),
            fechaVigenciaFinObjetivo: aFecha(dto.fechaVigenciaFinObjetivo),
            ...config,
            modeloEmpresa: config.modeloEmpresa ?? '90',
            estado: CAMPANA_EN_CURSO,
            creadoPorId: user.idUsuario,
          },
        });

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

        return {
          campana: nueva,
          campanaCerrada: actual?.nombre ?? null,
          objetivosCopiados,
        };
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

    // Modelo y escala no se cambian con notas ya puestas: el modelo decide
    // qué evaluaciones cuentan (de 180° a 90° las de subordinados dejan de
    // sumar) y la escala cuáles son válidas (de Manual a Likert un 80 queda
    // fuera). Los pesos sí, porque solo recalculan. La salida para un error
    // de configuración es el cambio excepcional: solo el dueño, con motivo.
    let pasaALikert = false;
    if (campana.estado !== CAMPANA_CERRADA) {
      const cambiaModelo =
        dto.modeloEmpresa !== undefined &&
        dto.modeloEmpresa !== campana.modeloEmpresa;
      const cambiaEscala =
        dto.tipoCalificacionCompetencia !== undefined &&
        dto.tipoCalificacionCompetencia !== campana.tipoCalificacionCompetencia;
      if (cambiaModelo || cambiaEscala) {
        const { configuracionBloqueada } = await this.impactoEdicion(id);
        if (configuracionBloqueada) {
          const excepcional =
            user.rol === 'ADMIN' && !!dto.motivoCambioExcepcional?.trim();
          if (!excepcional) {
            throw new BadRequestException(
              `La campaña ya tiene calificaciones: no se puede cambiar ${
                cambiaModelo && cambiaEscala
                  ? 'el modelo ni la escala'
                  : cambiaModelo
                    ? 'el modelo de evaluación'
                    : 'la escala de calificación'
              }. Solo el dueño de TeamWork puede hacerlo como cambio excepcional, indicando el motivo.`,
            );
          }
          pasaALikert =
            cambiaEscala && dto.tipoCalificacionCompetencia === 'LIKERT';
        }
      }
    }

    const resultante = {
      periodoDesde: dto.periodoDesde ?? fechaCorta(campana.periodoDesde),
      periodoHasta: dto.periodoHasta ?? fechaCorta(campana.periodoHasta),
      fechaVigenciaInicio:
        dto.fechaVigenciaInicio ?? fechaCorta(campana.fechaVigenciaInicio),
      fechaVigenciaFin:
        dto.fechaVigenciaFin ?? fechaCorta(campana.fechaVigenciaFin),
    };
    // En una cerrada las vigencias no se validan contra el periodo: son
    // historia (las migradas no las cumplen y no se pueden cambiar).
    this.validarFechas(resultante, campana.estado !== CAMPANA_CERRADA);
    // El plazo de fijación resultante: lo que llega, o lo que ya tenía.
    this.validarFijacion(
      dto.fechaVigenciaInicioObjetivo !== undefined
        ? dto.fechaVigenciaInicioObjetivo
        : campana.fechaVigenciaInicioObjetivo &&
            fechaCorta(campana.fechaVigenciaInicioObjetivo),
      dto.fechaVigenciaFinObjetivo !== undefined
        ? dto.fechaVigenciaFinObjetivo
        : campana.fechaVigenciaFinObjetivo &&
            fechaCorta(campana.fechaVigenciaFinObjetivo),
    );

    this.validarPesos({
      ...Object.fromEntries(CAMPOS_CONFIG.map((c) => [c, campana[c]])),
      ...Object.fromEntries(
        CAMPOS_CONFIG.filter((c) => dto[c] !== undefined).map((c) => [
          c,
          dto[c],
        ]),
      ),
    });

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
            ...(dto.periodoDesde && {
              periodoDesde: new Date(dto.periodoDesde),
            }),
            ...(dto.periodoHasta && {
              periodoHasta: new Date(dto.periodoHasta),
            }),
            ...(dto.fechaVigenciaInicio && {
              fechaVigenciaInicio: new Date(dto.fechaVigenciaInicio),
            }),
            ...(dto.fechaVigenciaFin && {
              fechaVigenciaFin: new Date(dto.fechaVigenciaFin),
            }),
            ...(dto.fechaVigenciaInicioObjetivo !== undefined && {
              fechaVigenciaInicioObjetivo: aFecha(
                dto.fechaVigenciaInicioObjetivo,
              ),
            }),
            ...(dto.fechaVigenciaFinObjetivo !== undefined && {
              fechaVigenciaFinObjetivo: aFecha(dto.fechaVigenciaFinObjetivo),
            }),
            ...Object.fromEntries(
              CAMPOS_CONFIG.filter((c) => dto[c] !== undefined).map((c) => [
                c,
                dto[c],
              ]),
            ),
          },
        });

        // De Manual a Likert: las notas que Likert no admite se vacían para
        // volver a calificarlas, y sus evaluaciones se reabren. El resto se
        // queda. Lo vaciado (ítem, evaluación y nota anterior) se devuelve y
        // el interceptor lo guarda en la bitácora.
        let notasVaciadas: {
          idEvaluacionCompetenciaItem: number;
          idEvaluacionCompetencia: number;
          calificacion: number | null;
        }[] = [];
        if (pasaALikert) {
          const fuera = await tx.evaluacionCompetenciaItem.findMany({
            where: {
              estado: true,
              calificacion: { not: null, notIn: OPCIONES_LIKERT },
              evaluacion: {
                idCampanaEvaluacion: id,
                estado: true,
                estadoEvaluacion: { not: 'ANULADA' },
              },
            },
            select: {
              idEvaluacionCompetenciaItem: true,
              idEvaluacionCompetencia: true,
              calificacion: true,
            },
          });
          if (fuera.length) {
            await tx.evaluacionCompetenciaItem.updateMany({
              where: {
                idEvaluacionCompetenciaItem: {
                  in: fuera.map((f) => f.idEvaluacionCompetenciaItem),
                },
              },
              data: { calificacion: null },
            });
            await tx.evaluacionCompetencia.updateMany({
              where: {
                idEvaluacionCompetencia: {
                  in: [...new Set(fuera.map((f) => f.idEvaluacionCompetencia))],
                },
                estadoEvaluacion: 'CERRADA',
              },
              data: {
                estadoEvaluacion: 'PROCESO',
                actualizadoPorId: user.idUsuario,
                fechaModificacion: new Date(),
              },
            });
          }
          notasVaciadas = fuera;
        }

        return Object.assign(actualizada, { notasVaciadas });
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
      throw new BadRequestException(
        'Solo se puede reabrir una campaña cerrada.',
      );
    }
    const enCurso = await this.prisma.campanaEvaluacion.findFirst({
      where: {
        idEmpresaEmpleadora: campana.idEmpresaEmpleadora,
        estado: CAMPANA_EN_CURSO,
      },
    });
    if (enCurso) {
      throw new ConflictException(
        `No se puede reabrir: "${enCurso.nombre}" está en curso. Ciérrela primero.`,
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
    const { idEmpresaEmpleadora } =
      await tx.campanaEvaluacion.findUniqueOrThrow({
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

  /** Cada par de pesos suma 100; el de jefe/subordinado solo en 180°. */
  private validarPesos(c: {
    modeloEmpresa?: string | null;
    porcentajeCompetecias?: number | null;
    porcentajeObjetivos?: number | null;
    porcentajeEvaluacionJefeCompetencia?: number | null;
    porcentajeEvaluacionSubordinadoCompetencia?: number | null;
  }) {
    const suma = (a?: number | null, b?: number | null) =>
      a == null || b == null || a + b === 100;
    if (!suma(c.porcentajeCompetecias, c.porcentajeObjetivos)) {
      throw new BadRequestException(
        'Los porcentajes de competencias y objetivos deben sumar 100.',
      );
    }
    if (
      c.modeloEmpresa === '180' &&
      !suma(
        c.porcentajeEvaluacionJefeCompetencia,
        c.porcentajeEvaluacionSubordinadoCompetencia,
      )
    ) {
      throw new BadRequestException(
        'Los porcentajes del jefe y de los subordinados deben sumar 100.',
      );
    }
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

  /**
   * Plazo de fijación de objetivos (opcional): las dos fechas o ninguna, y
   * el fin no antes del inicio. Con una sola, el front lo tomaba como "sin
   * límite" y el dato quedaba a medias.
   */
  private validarFijacion(inicio?: string | null, fin?: string | null) {
    if (!inicio && !fin) return;
    if (!inicio || !fin) {
      throw new BadRequestException(
        'Indique el inicio y el fin de la fijación de objetivos, o deje ambos vacíos.',
      );
    }
    if (new Date(fin).getTime() < new Date(inicio).getTime()) {
      throw new BadRequestException(
        'El fin de la fijación de objetivos no puede ser anterior a su inicio.',
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
        `El periodo se superpone con el de "${choque.nombre}" (${fechaLegible(choque.periodoDesde)} – ${fechaLegible(choque.periodoHasta)}).`,
      );
    }
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
      include: {
        objetivoDetalles: {
          where: { estado: true },
          // Siempre en su orden: sin esto, tras un guardado la base los
          // devolvía en otro y el formulario quitaba el objetivo equivocado.
          orderBy: { secuencial: 'asc' },
        },
      },
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
