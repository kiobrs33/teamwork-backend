import { normalizarPeriodo } from 'src/common/resultados/resultados-evaluacion';
import { construirLibroExcel } from 'src/common/excel/libro-excel';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpresaEmpleadoraDto } from './dto/create-empresa-empleadora.dto';
import { UpdateEmpresaEmpleadoraDto } from './dto/update-empresa-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import {
  EMPRESA_SORT_FIELDS,
  EmpresaQueryDto,
  EmpresaSortField,
} from './dto/empresa-query.dto';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';
import { v2 as cloudinary } from 'cloudinary';

// El ValidationPipe global corre con `transform` desactivado, así que la query
// llega con strings aunque el DTO declare números. Se normaliza acá.
const aEntero = (valor: unknown): number | undefined => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const n = Number(valor);
  return Number.isInteger(n) ? n : undefined;
};

const aTexto = (valor: unknown): string | undefined => {
  const texto = String(valor ?? '').trim();
  return texto === '' ? undefined : texto;
};

@Injectable()
export class EmpresaEmpleadoraService {
  private readonly logger = new Logger(EmpresaEmpleadoraService.name);
  constructor(private prisma: PrismaService) {}

  /**
   * Reglas que no se pueden expresar en el DTO porque cruzan varios campos.
   * En el PATCH el dto es parcial, así que se valida contra el estado
   * resultante (lo actual + lo que se está cambiando).
   */
  private validarReglasNegocio(
    dto: UpdateEmpresaEmpleadoraDto,
    actual?: {
      fechaVigenciaInicio: Date;
      fechaVigenciaFin: Date;
      fechaVigenciaInicioObjetivo: Date | null;
      fechaVigenciaFinObjetivo: Date | null;
      porcentajeCompetecias: number | null;
      porcentajeObjetivos: number | null;
      porcentajeEvaluacionJefeCompetencia: number | null;
      porcentajeEvaluacionSubordinadoCompetencia: number | null;
      modeloEmpresa: string;
    },
  ) {
    const errores: string[] = [];

    // `undefined` = el PATCH no toca el campo; `null` = lo está limpiando.
    const resolver = <T, U>(
      enviado: T | undefined,
      previo: U | null | undefined,
    ): T | U | null => (enviado === undefined ? (previo ?? null) : enviado);

    const fecha = (valor: string | Date | null) =>
      valor === null ? null : new Date(valor);

    const inicio = fecha(
      resolver(dto.fechaVigenciaInicio, actual?.fechaVigenciaInicio),
    );
    const fin = fecha(resolver(dto.fechaVigenciaFin, actual?.fechaVigenciaFin));

    if (inicio && fin && fin.getTime() < inicio.getTime()) {
      errores.push(
        'La fecha de fin de vigencia no puede ser anterior a la de inicio.',
      );
    }

    const inicioObjetivo = fecha(
      resolver(
        dto.fechaVigenciaInicioObjetivo,
        actual?.fechaVigenciaInicioObjetivo,
      ),
    );
    const finObjetivo = fecha(
      resolver(dto.fechaVigenciaFinObjetivo, actual?.fechaVigenciaFinObjetivo),
    );

    if (
      inicioObjetivo &&
      finObjetivo &&
      finObjetivo.getTime() < inicioObjetivo.getTime()
    ) {
      errores.push(
        'La fecha de fin de vigencia de objetivos no puede ser anterior a la de inicio.',
      );
    }

    const competencias = resolver(
      dto.porcentajeCompetecias,
      actual?.porcentajeCompetecias,
    );
    const objetivos = resolver(
      dto.porcentajeObjetivos,
      actual?.porcentajeObjetivos,
    );

    if (
      competencias !== null &&
      objetivos !== null &&
      competencias + objetivos !== 100
    ) {
      errores.push(
        'Los porcentajes de competencias y objetivos deben sumar 100.',
      );
    }

    const jefe = resolver(
      dto.porcentajeEvaluacionJefeCompetencia,
      actual?.porcentajeEvaluacionJefeCompetencia,
    );
    const subordinado = resolver(
      dto.porcentajeEvaluacionSubordinadoCompetencia,
      actual?.porcentajeEvaluacionSubordinadoCompetencia,
    );

    // El reparto jefe/subordinado solo se aplica en 180°: en 90° evalúa solo
    // el jefe y el cálculo usa su nota tal cual, al 100 %. Exigir la suma
    // también en 90° obligaba a configurar un reparto que nunca se usa.
    const modelo = resolver(dto.modeloEmpresa, actual?.modeloEmpresa);

    if (
      modelo === '180' &&
      jefe !== null &&
      subordinado !== null &&
      jefe + subordinado !== 100
    ) {
      errores.push(
        'Los porcentajes de evaluación del jefe y del subordinado deben sumar 100.',
      );
    }

    if (errores.length) {
      throw new BadRequestException({
        message: 'Errores de validación',
        errors: errores,
      });
    }
  }

  /**
   * El RUC es `@unique` en toda la tabla, incluidas las empresas dadas de baja.
   * Sin este chequeo el choque cae como P2002 y el usuario recibe un mensaje
   * genérico que no le dice qué campo repitió.
   */
  private async validarRucDisponible(ruc: string, idAExcluir?: number) {
    const existente = await this.prisma.empresaEmpleadora.findUnique({
      where: { ruc },
      select: { idEmpresaEmpleadora: true, estado: true, nombreEmpresa: true },
    });

    if (!existente || existente.idEmpresaEmpleadora === idAExcluir) return;

    throw new ConflictException(
      existente.estado
        ? `Ya existe una empresa registrada con el RUC ${ruc} (${existente.nombreEmpresa}).`
        : `El RUC ${ruc} pertenece a una empresa eliminada (${existente.nombreEmpresa}).`,
    );
  }

  // CREATE
  async create(user: AuthUser, dto: CreateEmpresaEmpleadoraDto) {
    try {
      if (dto.ruc) {
        await this.validarRucDisponible(dto.ruc);
      }

      this.validarReglasNegocio(dto);

      return await this.prisma.empresaEmpleadora.create({
        data: {
          ...dto,
          // El logo se sube en un segundo paso (POST /:id/logo), porque
          // Cloudinary necesita el id de la empresa ya creada.
          urlLogo: dto.urlLogo ?? '',
          creadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      this.logger.error('Error al crear empresa', error as Error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }

  // FIND ALL
  /**
   * Avance de evaluación de cada empresa de la página.
   *
   * Se agrega en la base y no en Node: contar en memoria obligaría a traerse
   * todos los ítems de todas las evaluaciones, que en una empresa grande son
   * decenas de miles de filas para mostrar dos barras.
   *
   * Los criterios son los mismos que usan las pantallas de detalle, para que
   * el listado no diga una cosa y el detalle otra:
   * - Competencias: ítems vigentes de evaluaciones NO anuladas **de la campaña
   *   vigente de la empresa**; hecho = `calificacion` no nula (0 es una nota).
   * - Objetivos: detalles vigentes; hecho = tiene `meta_alcanzada` o
   *   `porcentaje_logrado`, igual que `detallesEvaluados`.
   *
   * El total de trabajadores va en la misma tanda, con un `groupBy` normal.
   *
   * Son tres consultas por página, no por empresa.
   */
  private async conAvances<T extends { idEmpresaEmpleadora: number }>(
    empresas: T[],
  ) {
    if (empresas.length === 0) return empresas;

    const ids = empresas.map((e) => e.idEmpresaEmpleadora);

    type FilaAvance = { empresa: number; total: number; hechas: number };

    const [competencias, objetivos, empleados] = await Promise.all([
      this.prisma.$queryRaw<FilaAvance[]>`
        SELECT e.id_empresa_empleadora::int AS empresa,
               count(*)::int AS total,
               count(*) FILTER (WHERE i.calificacion IS NOT NULL)::int AS hechas
        FROM evaluacion_competencia_item i
        JOIN evaluacion_competencia ec
          ON ec."idEvaluacionCompetencia" = i.id_evaluacion_competencia
        JOIN empleado e ON e.id_empleado = ec.id_evaluado
        JOIN empresa_empleadora emp
          ON emp.id_empresa_empleadora = e.id_empresa_empleadora
        WHERE i.estado AND ec.estado AND e.estado
          AND ec."estadoEvaluacion" <> 'ANULADA'
          AND ec.periodo_evaluacion
              IS NOT DISTINCT FROM substring(emp.periodo_evaluacion FROM 1 FOR 7)
          AND e.id_empresa_empleadora = ANY(${ids})
        GROUP BY 1`,
      this.prisma.$queryRaw<FilaAvance[]>`
        SELECT e.id_empresa_empleadora::int AS empresa,
               count(*)::int AS total,
               count(*) FILTER (
                 WHERE d.meta_alcanzada IS NOT NULL
                    OR d.porcentaje_logrado IS NOT NULL
               )::int AS hechas
        FROM objetivo_detalle d
        JOIN objetivo o ON o.id_objetivo = d.id_objetivo
        JOIN empleado e ON e.id_empleado = o."idEmpleado"
        WHERE d.estado AND o.estado AND e.estado
          AND e.id_empresa_empleadora = ANY(${ids})
        GROUP BY 1`,
      this.prisma.empleado.groupBy({
        by: ['idEmpresaEmpleadora'],
        where: { estado: true, idEmpresaEmpleadora: { in: ids } },
        _count: { _all: true },
      }),
    ]);

    const porEmpresa = (filas: FilaAvance[]) =>
      new Map(
        filas.map((f) => [f.empresa, { total: f.total, hechas: f.hechas }]),
      );

    const mapaCompetencias = porEmpresa(competencias);
    const mapaObjetivos = porEmpresa(objetivos);
    const mapaEmpleados = new Map(
      empleados.map((e) => [e.idEmpresaEmpleadora, e._count._all]),
    );
    const vacio = { total: 0, hechas: 0 };

    return empresas.map((empresa) => ({
      ...empresa,
      totalEmpleados: mapaEmpleados.get(empresa.idEmpresaEmpleadora) ?? 0,
      avanceCompetencias:
        mapaCompetencias.get(empresa.idEmpresaEmpleadora) ?? vacio,
      avanceObjetivos: mapaObjetivos.get(empresa.idEmpresaEmpleadora) ?? vacio,
    }));
  }

  async exportExcel(query: EmpresaQueryDto) {
    try {
      const { where, orderBy } = this.construirListado(query);
      const empresas = await this.prisma.empresaEmpleadora.findMany({
        where,
        orderBy,
        include: {
          _count: {
            select: { empleados: { where: { estado: true } } },
          },
        },
      });

      return await construirLibroExcel([
        {
          nombre: 'Empresas',
          columnas: [
            { header: 'ID', key: 'idEmpresaEmpleadora', width: 8 },
            { header: 'Empresa', key: 'nombreEmpresa', width: 32 },
            { header: 'RUC', key: 'ruc', tipo: 'texto', width: 16 },
            { header: 'Dirección', key: 'direccionEmpresa', width: 32 },
            { header: 'Modelo', key: 'modeloEmpresa' },
            { header: 'Periodo de evaluación', key: 'periodoEvaluacion' },
            { header: 'Tipo de calificación', key: 'tipoCalificacionCompetencia' },
            { header: '% Competencias', key: 'porcentajeCompetecias' },
            { header: '% Objetivos', key: 'porcentajeObjetivos' },
            { header: '% Jefe', key: 'porcentajeEvaluacionJefeCompetencia' },
            { header: '% Subordinados', key: 'porcentajeEvaluacionSubordinadoCompetencia' },
            { header: 'Resultado esperado', key: 'competenciaResultadoEsperado' },
            { header: 'Inicio evaluación', key: 'fechaVigenciaInicio', tipo: 'fecha' },
            { header: 'Fin evaluación', key: 'fechaVigenciaFin', tipo: 'fecha' },
            { header: 'Inicio objetivos', key: 'fechaVigenciaInicioObjetivo', tipo: 'fecha' },
            { header: 'Fin objetivos', key: 'fechaVigenciaFinObjetivo', tipo: 'fecha' },
            { header: 'Trabajadores activos', key: 'trabajadores' },
          ],
          filas: empresas.map((e) => ({
            ...e,
            // En 90° el reparto jefe/subordinado no aplica: el jefe pesa 100.
            porcentajeEvaluacionJefeCompetencia:
              e.modeloEmpresa === '90' ? 100 : e.porcentajeEvaluacionJefeCompetencia,
            porcentajeEvaluacionSubordinadoCompetencia:
              e.modeloEmpresa === '90' ? null : e.porcentajeEvaluacionSubordinadoCompetencia,
            trabajadores: e._count.empleados,
          })),
        },
      ]);
    } catch (error) {
      handlePrismaError(error, 'empresa');
    }
  }

  /** Filtro y orden del listado; los comparte la exportación a Excel. */
  private construirListado(query: EmpresaQueryDto) {
    const idEmpresaEmpleadora = aEntero(query.idEmpresaEmpleadora);
    const nombreEmpresa = aTexto(query.nombreEmpresa);
    const ruc = aTexto(query.ruc);
    const modeloEmpresa = aTexto(query.modeloEmpresa);
    const direccionEmpresa = aTexto(query.direccionEmpresa);
    const periodoEvaluacion = aTexto(query.periodoEvaluacion);
    const search = aTexto(query.search);

    const where: Prisma.EmpresaEmpleadoraWhereInput = {
      estado: true,

      // ============ FILTROS POR COLUMNA (se combinan con AND) ============
      ...(idEmpresaEmpleadora !== undefined && { idEmpresaEmpleadora }),

      ...(nombreEmpresa && {
        nombreEmpresa: { contains: nombreEmpresa, mode: 'insensitive' },
      }),

      ...(ruc && {
        ruc: { contains: ruc },
      }),

      ...(modeloEmpresa && {
        modeloEmpresa: { contains: modeloEmpresa, mode: 'insensitive' },
      }),

      ...(direccionEmpresa && {
        direccionEmpresa: { contains: direccionEmpresa, mode: 'insensitive' },
      }),

      // Parcial a propósito: "2026" debe traer todas las campañas del año.
      ...(periodoEvaluacion && {
        periodoEvaluacion: { contains: periodoEvaluacion },
      }),

      // ============ BÚSQUEDA GLOBAL ============
      ...(search && {
        OR: [
          { nombreEmpresa: { contains: search, mode: 'insensitive' } },
          { ruc: { contains: search } },
          { modeloEmpresa: { contains: search, mode: 'insensitive' } },
          { direccionEmpresa: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const sortBy = EMPRESA_SORT_FIELDS.includes(
      query.sortBy as EmpresaSortField,
    )
      ? (query.sortBy as EmpresaSortField)
      : 'fechaCreacion';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.EmpresaEmpleadoraOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return { where, orderBy };
  }

  async findAll(query: EmpresaQueryDto) {
    try {
      const { where, orderBy } = this.construirListado(query);

      const limit = aEntero(query.limit) ?? 0;

      if (limit === 0) {
        const data = await this.prisma.empresaEmpleadora.findMany({
          where,
          orderBy,
        });

        return {
          data,
          meta: {
            total: data.length,
            page: 1,
            limit: 0,
            totalPages: 1,
          },
        };
      }

      const safeLimit = Math.min(limit, 100);
      const safePage = Math.max(aEntero(query.page) ?? 1, 1);
      const skip = (safePage - 1) * safeLimit;

      const [total, data] = await Promise.all([
        this.prisma.empresaEmpleadora.count({ where }),
        this.prisma.empresaEmpleadora.findMany({
          where,
          skip,
          take: safeLimit,
          orderBy,
        }),
      ]);

      return {
        data: await this.conAvances(data),
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      this.logger.error('Error al listar empresas', error as Error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }

  // FIND ONE
  async findOne(id: number) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: {
        idEmpresaEmpleadora: id,
        estado: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  // UPDATE
  async update(user: AuthUser, id: number, dto: UpdateEmpresaEmpleadoraDto) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      if (dto.ruc && dto.ruc !== empresa.ruc) {
        await this.validarRucDisponible(dto.ruc, id);
      }

      this.validarReglasNegocio(dto, empresa);

      const periodoActual = normalizarPeriodo(empresa.periodoEvaluacion);
      const periodoNuevo =
        dto.periodoEvaluacion !== undefined
          ? normalizarPeriodo(dto.periodoEvaluacion)
          : periodoActual;
      const cambiaCampana = !!periodoActual && periodoNuevo !== periodoActual;

      if (cambiaCampana && periodoNuevo) {
        const yaCerrada = await this.prisma.campanaEvaluacion.findUnique({
          where: {
            idEmpresaEmpleadora_periodoEvaluacion: {
              idEmpresaEmpleadora: id,
              periodoEvaluacion: periodoNuevo,
            },
          },
        });
        if (yaCerrada) {
          throw new ConflictException(
            `La campaña ${periodoNuevo} ya se cerró y no se puede reabrir: sus resultados quedaron registrados con su configuración.`,
          );
        }
      }

      return await this.prisma.$transaction(async (tx) => {
        // Cambiar el periodo CIERRA la campaña anterior: se guarda la
        // configuración con la que se calificó (la de la empresa se
        // sobrescribe ahora mismo) y sus evaluaciones abiertas pasan a
        // CERRADA, que es lo que las vuelve de solo lectura en el historial.
        if (cambiaCampana) {
          await tx.campanaEvaluacion.create({
            data: {
              idEmpresaEmpleadora: id,
              periodoEvaluacion: periodoActual!,
              modeloEmpresa: empresa.modeloEmpresa,
              porcentajeCompetecias: empresa.porcentajeCompetecias,
              porcentajeObjetivos: empresa.porcentajeObjetivos,
              porcentajeEvaluacionJefeCompetencia:
                empresa.porcentajeEvaluacionJefeCompetencia,
              porcentajeEvaluacionSubordinadoCompetencia:
                empresa.porcentajeEvaluacionSubordinadoCompetencia,
              tipoCalificacionCompetencia: empresa.tipoCalificacionCompetencia,
              competenciaResultadoEsperado: empresa.competenciaResultadoEsperado,
              cerradoPorId: user.idUsuario,
            },
          });

          await tx.evaluacionCompetencia.updateMany({
            where: {
              periodoEvaluacion: periodoActual,
              estadoEvaluacion: 'PROCESO',
              evaluado: { idEmpresaEmpleadora: id },
            },
            data: {
              estadoEvaluacion: 'CERRADA',
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        }

        return tx.empresaEmpleadora.update({
          where: { idEmpresaEmpleadora: id },
          data: {
            ...dto,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
          },
        });
      });
    } catch (error) {
      this.logger.error('Error al actualizar empresa', error as Error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }

  // REMOVE (soft delete)
  async remove(user: AuthUser, id: number) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      // La baja es lógica y no arrastra a los hijos: si se permitiera, empleados,
      // unidades y competencias quedarían activos colgando de una empresa que ya
      // no aparece en ninguna consulta.
      const dependencias = await this.contarDependenciasActivas(id);

      if (dependencias.length) {
        throw new ConflictException(
          `No se puede eliminar la empresa porque todavía tiene ${dependencias.join(', ')}.`,
        );
      }

      return await this.prisma.empresaEmpleadora.update({
        where: { idEmpresaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      this.logger.error('Error al eliminar empresa', error as Error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }

  private async contarDependenciasActivas(idEmpresaEmpleadora: number) {
    const where = { idEmpresaEmpleadora, estado: true };

    const [empleados, areas, puestos, gerencias, unidades, competencias] =
      await Promise.all([
        this.prisma.empleado.count({ where }),
        this.prisma.areaEmpleadora.count({ where }),
        this.prisma.puestoEmpleadora.count({ where }),
        this.prisma.gerenciaEmpleadora.count({ where }),
        this.prisma.unidadOcupacionalEmpleadora.count({ where }),
        this.prisma.competencia.count({ where }),
      ]);

    return [
      [empleados, 'empleado(s)'],
      [areas, 'área(s)'],
      [puestos, 'puesto(s)'],
      [gerencias, 'gerencia(s)'],
      [unidades, 'unidad(es) ocupacional(es)'],
      [competencias, 'competencia(s)'],
    ]
      .filter(([total]) => (total as number) > 0)
      .map(([total, etiqueta]) => `${total} ${etiqueta}`);
  }

  async updateLogo(id: number, url: string, publicId: string) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      // Borrar el logo anterior de Cloudinary. Si falla no se aborta la
      // operación: lo importante es que la empresa quede con el logo nuevo.
      if (empresa.logoPublicId) {
        try {
          await cloudinary.uploader.destroy(empresa.logoPublicId);
        } catch (error) {
          this.logger.warn(
            `No se pudo borrar el logo anterior (${empresa.logoPublicId}) de Cloudinary`,
            error as Error,
          );
        }
      }

      return await this.prisma.empresaEmpleadora.update({
        where: {
          idEmpresaEmpleadora: id,
        },
        data: {
          urlLogo: url,
          logoPublicId: publicId,
          fechaModificacion: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error al actualizar el logo', error as Error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }
}
