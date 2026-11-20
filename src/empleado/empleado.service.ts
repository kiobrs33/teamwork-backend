import { construirLibroExcel } from 'src/common/excel/libro-excel';
import {
  CAMPANA_EN_CURSO,
  campanaEnCurso,
  filtroEvaluacionesDeCampana,
} from 'src/common/resultados/campana';
import {
  AvanceQueryDto,
  ESTADOS_AVANCE,
  EstadoAvance,
} from './dto/avance-query.dto';
import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { hash } from 'bcryptjs';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import {
  EmployeeQueryDto,
  EmpleadoSortField,
} from './dto/employee-query.dto';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

import {
  origenDeEvaluacion,
} from 'src/common/resultados/resultados-evaluacion';

/** Lo que `conAgregados` añade a cada fila del listado. */
type Avance = { total: number; hechas: number };

type AvanceCompetencias = {
  /** Ítems que le asigna su unidad ocupacional. */
  total: number;
  hechasJefe: number;
  hechasAuto: number;
};

type ConAgregados<T> = T & {
  jefe: { codigoEmpleado: string; nombres: string; apellidos: string } | null;
  avanceCompetencias: AvanceCompetencias;
  avanceObjetivos: Avance;
};

@Injectable()
export class EmpleadoService {
  private readonly logger = new Logger(EmpleadoService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================
  // UTILITY: VALIDAR UNICIDAD
  // ============================================================
  private async validateUniqueFields(body: CreateEmpleadoDto) {
    // ============================================================
    // VALIDAR CÓDIGO DE USUARIO
    // ============================================================
    const existsUser = await this.prisma.usuario.findUnique({
      where: { codigoUsuario: body.codigoUsuario },
      select: { idUsuario: true },
    });
    if (existsUser) {
      throw new BadRequestException(
        `El código de usuario "${body.codigoUsuario}" ya está registrado.`,
      );
    }

    // ============================================================
    // VALIDAR CÓDIGO DE EMPLEADO
    // ============================================================
    const existsEmpleado = await this.prisma.empleado.findUnique({
      where: { codigoEmpleado: body.codigoEmpleado },
      select: { idEmpleado: true },
    });

    if (existsEmpleado) {
      throw new BadRequestException(
        `El código de empleado "${body.codigoEmpleado}" ya está registrado.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA LA EMPRESA EMPLEADORA
    // ============================================================
    const empresa = await this.prisma.empresaEmpleadora.findUnique({
      where: { idEmpresaEmpleadora: body.idEmpresaEmpleadora },
      select: { idEmpresaEmpleadora: true },
    });

    if (!empresa) {
      throw new BadRequestException(
        `La empresa empleadora con ID "${body.idEmpresaEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA EL ÁREA EMPLEADORA
    // ============================================================
    const area = await this.prisma.areaEmpleadora.findUnique({
      where: { idAreaEmpleadora: body.idAreaEmpleadora },
      select: { idAreaEmpleadora: true },
    });

    if (!area) {
      throw new BadRequestException(
        `El área empleadora con ID "${body.idAreaEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA EL PUESTO EMPLEADORA
    // ============================================================
    const puesto = await this.prisma.puestoEmpleadora.findUnique({
      where: { idPuestoEmpleadora: body.idPuestoEmpleadora },
      select: { idPuestoEmpleadora: true },
    });

    if (!puesto) {
      throw new BadRequestException(
        `El puesto empleadora con ID "${body.idPuestoEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA LA GERENCIA EMPLEADORA
    // ============================================================
    const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
      where: { idGerenciaEmpleadora: body.idGerenciaEmpleadora },
      select: { idGerenciaEmpleadora: true },
    });

    if (!gerencia) {
      throw new BadRequestException(
        `La gerencia empleadora con ID "${body.idGerenciaEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA LA UNIDAD OCUPACIONAL EMPLEADORA
    // ============================================================
    const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
      where: {
        idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
      },
      select: { idUnidadOcupacionalEmpleadora: true },
    });

    if (!unidad) {
      throw new BadRequestException(
        `La unidad ocupacional empleadora con ID "${body.idUnidadOcupacionalEmpleadora}" no existe.`,
      );
    }
  }

  // ============================================================
  // CREATE
  // ============================================================
  async create(user: AuthUser, body: CreateEmpleadoDto) {
    try {
      await this.validateUniqueFields(body);

      return await this.prisma.$transaction(async (tx) => {
        const hashedPassword = await hash(body.contrasena, 10);

        const usuario = await tx.usuario.create({
          data: {
            codigoUsuario: body.codigoUsuario,
            contrasena: hashedPassword,
            rol: body.rol,
            creadoPorId: user.idUsuario,
          },
        });

        const empleado = await tx.empleado.create({
          data: {
            codigoEmpleado: body.codigoEmpleado, // obligatorio
            nombres: body.nombres,
            apellidos: body.apellidos,
            documento: body.documento,
            sede: body.sede,
            tiempoEmpresaValor: body.tiempoEmpresaValor,
            tiempoEmpresaUnidad: body.tiempoEmpresaUnidad, // string
            idEmpresaEmpleadora: body.idEmpresaEmpleadora,
            idAreaEmpleadora: body.idAreaEmpleadora,
            idPuestoEmpleadora: body.idPuestoEmpleadora,
            idGerenciaEmpleadora: body.idGerenciaEmpleadora,
            idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
            codigoEmpleadoJefe: body.codigoEmpleadoJefe?.trim() || null,
            idUsuario: usuario.idUsuario,
            creadoPorId: user.idUsuario,
          },
          include: {
            usuario: {
              // NUNCA el include completo: arrastra `contrasena`, y el
              // PurgeResponseInterceptor no la borra porque busca la clave
              // `password`. El hash bcrypt de cada trabajador viajaba en la
              // respuesta de todos estos endpoints.
              select: { idUsuario: true, codigoUsuario: true, rol: true },
            },
            empresaEmpleadora: true,
          },
        });

        return empleado;
      });
    } catch (error) {
      this.logger.error('Error al crear empleado:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  /**
   * Datos derivados de cada trabajador de la página.
   *
   * - `jefe`: `codigoEmpleadoJefe` es un texto suelto, no una relación de
   *   Prisma, así que el nombre del jefe hay que resolverlo aparte. Una sola
   *   consulta para toda la página.
   * - `avanceCompetencias` / `avanceObjetivos`: se agregan en la base, no en
   *   Node; traerse todos los ítems de todas las evaluaciones para contar dos
   *   barras no escala. Mismos criterios que en el listado de empresas, para
   *   que las cifras coincidan entre pantallas.
   *
   * Son tres consultas por página, no por trabajador.
   */
  private async conAgregados<
    T extends { idEmpleado: number; codigoEmpleadoJefe: string | null },
  >(empleados: T[]): Promise<ConAgregados<T>[]> {
    // El atajo se queda, pero devolviendo ya la forma final: sin anotar el
    // tipo, el retorno era una unión y `jefe` no existía en una de las ramas,
    // así que quien consumiera el resultado no podía leerlo.
    if (empleados.length === 0) return [];

    const ids = empleados.map((e) => e.idEmpleado);
    const codigosJefe = [
      ...new Set(
        empleados
          .map((e) => e.codigoEmpleadoJefe)
          .filter((c): c is string => !!c),
      ),
    ];

    type FilaAvance = { empleado: number; total: number; hechas: number };
    type FilaCompetencias = {
      empleado: number;
      total: number;
      hechasJefe: number;
      hechasAuto: number;
    };

    // Las dos consultas crudas repiten en SQL el mismo criterio que
    // `filtroEvaluacionesDeCampana` (src/common/resultados): solo la campaña de
    // la empresa y nada anulado. No pueden importarlo porque agregan en la
    // base; si allí cambia la regla, hay que tocarlas a mano.
    const [competencias, objetivos, jefes] = await Promise.all([
      // Se cuentan COMPETENCIAS, no ítems, y una solo cuenta cuando **todos**
      // sus ítems están calificados: es la cifra que se corresponde con lo que
      // se configuró en la unidad. "3/9" eran ítems y se leía como
      // competencias, que es otra cosa —Liderazgo tiene 1 ítem y las demás 2—.
      //
      // El denominador son las competencias que la UNIDAD le asigna, no las
      // que tienen evaluación abierta: contando evaluaciones, añadir una
      // competencia a la unidad no movía la barra y el trabajador seguía
      // marcando "completo". Y el numerador va partido en jefe y
      // autoevaluación porque juntos, quien se autoevaluaba inflaba su propio
      // avance.
      //
      // El `LEFT JOIN` de los ítems es a propósito: una competencia cuyo nivel
      // se quedó sin ítems activos sigue asignada y sigue contando en el
      // total, pero nunca puede completarse.
      this.prisma.$queryRaw<FilaCompetencias[]>`
        WITH asignados AS (
          SELECT e.id_empleado, ucn.id_competencia,
                 i.id_competencia_nivel_item AS item
          FROM empleado e
          JOIN unidad_ocupacional_competencia_nivel ucn
            ON ucn.id_unidad_ocupacional_empleadora
               = e.id_unidad_ocupacional_empleadora
          JOIN competencia c
            ON c.id_competencia = ucn.id_competencia AND c.estado
          JOIN competencia_nivel n
            ON n.id_competencia_nivel = ucn.id_competencia_nivel AND n.estado
          LEFT JOIN competencia_nivel_item i
            ON i.id_competencia_nivel = ucn.id_competencia_nivel AND i.estado
          WHERE e.id_empleado = ANY(${ids})
        ),
        calificados AS (
          SELECT ec.id_evaluado AS empleado,
                 it.id_competencia_nivel_item AS item,
                 -- La foto guardada al iniciar manda (ver origenDeEvaluacion);
                 -- la comparación con el jefe actual solo para filas sin foto.
                 COALESCE(ec.tipo_evaluador = 'AUTO',
                          ec.id_evaluador = ec.id_evaluado) AS es_auto,
                 COALESCE(ec.tipo_evaluador = 'JEFE',
                          ev.codigo_empleado IS NOT NULL
                          AND ev.codigo_empleado = e.codigo_empleado_jefe) AS es_jefe
          FROM evaluacion_competencia_item it
          JOIN evaluacion_competencia ec
            ON ec."idEvaluacionCompetencia" = it.id_evaluacion_competencia
          JOIN empleado e ON e.id_empleado = ec.id_evaluado
          -- Solo la campaña en curso (ver filtroEvaluacionesDeCampana).
          JOIN campana_evaluacion c
            ON c.id_campana_evaluacion = ec.id_campana_evaluacion
           AND c.estado = 'EN_CURSO'
          LEFT JOIN empleado ev ON ev.id_empleado = ec.id_evaluador
          WHERE it.estado AND ec.estado AND it.calificacion IS NOT NULL
            AND ec."estadoEvaluacion" <> 'ANULADA'
            AND ec.id_evaluado = ANY(${ids})
        ),
        por_competencia AS (
          SELECT a.id_empleado, a.id_competencia,
                 bool_and(EXISTS (
                   SELECT 1 FROM calificados c
                   WHERE c.empleado = a.id_empleado AND c.item = a.item
                     AND c.es_jefe
                 )) AS completa_jefe,
                 bool_and(EXISTS (
                   SELECT 1 FROM calificados c
                   WHERE c.empleado = a.id_empleado AND c.item = a.item
                     AND c.es_auto
                 )) AS completa_auto
          FROM asignados a
          GROUP BY 1, 2
        )
        SELECT id_empleado::int AS empleado,
               count(*)::int AS total,
               count(*) FILTER (WHERE completa_jefe)::int AS "hechasJefe",
               count(*) FILTER (WHERE completa_auto)::int AS "hechasAuto"
        FROM por_competencia
        GROUP BY 1`,
      this.prisma.$queryRaw<FilaAvance[]>`
        SELECT o."idEmpleado"::int AS empleado,
               count(*)::int AS total,
               count(*) FILTER (
                 WHERE d.meta_alcanzada IS NOT NULL
                    OR d.porcentaje_logrado IS NOT NULL
               )::int AS hechas
        FROM objetivo_detalle d
        JOIN objetivo o ON o.id_objetivo = d.id_objetivo
        -- Solo los de la campaña en curso, como las competencias.
        JOIN campana_evaluacion c
          ON c.id_campana_evaluacion = o.id_campana_evaluacion
         AND c.estado = 'EN_CURSO'
        WHERE d.estado AND o.estado
          AND o."idEmpleado" = ANY(${ids})
        GROUP BY 1`,
      codigosJefe.length
        ? this.prisma.empleado.findMany({
            where: { codigoEmpleado: { in: codigosJefe } },
            select: {
              codigoEmpleado: true,
              nombres: true,
              apellidos: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const porEmpleado = (filas: FilaAvance[]) =>
      new Map(
        filas.map((f) => [f.empleado, { total: f.total, hechas: f.hechas }]),
      );

    const mapaCompetencias = new Map(
      competencias.map((f) => [
        f.empleado,
        { total: f.total, hechasJefe: f.hechasJefe, hechasAuto: f.hechasAuto },
      ]),
    );
    const mapaObjetivos = porEmpleado(objetivos);
    const mapaJefes = new Map(jefes.map((j) => [j.codigoEmpleado, j] as const));
    const vacio = { total: 0, hechas: 0 };
    const vacioCompetencias = { total: 0, hechasJefe: 0, hechasAuto: 0 };

    return empleados.map((empleado) => ({
      ...empleado,
      jefe: empleado.codigoEmpleadoJefe
        ? (mapaJefes.get(empleado.codigoEmpleadoJefe) ?? null)
        : null,
      avanceCompetencias:
        mapaCompetencias.get(empleado.idEmpleado) ?? vacioCompetencias,
      avanceObjetivos: mapaObjetivos.get(empleado.idEmpleado) ?? vacio,
    }));
  }

  // ============================================================
  // ESTADO DE EVALUACIÓN (DETALLE POR TRABAJADOR)
  // ============================================================
  /**
   * El desglose de por qué un trabajador va por donde va.
   *
   * La columna del listado resume en "Jefe: 2/5", que dice cuánto falta pero
   * no QUÉ falta. Acá se devuelve competencia por competencia, con los ítems
   * concretos que nadie ha calificado, y aparte las anuladas —las que se
   * cayeron al cambiar el nivel de la unidad o al retirar la competencia—,
   * que son justo las que explican un salto raro en el avance.
   *
   * Mismo criterio de "qué cuenta" que el resto: solo la campaña de la empresa
   * y nada anulado (`filtroEvaluacionesVigentes`), y una competencia está
   * completa cuando TODOS sus ítems tienen nota.
   */
  async estadoEvaluacion(idEmpleado: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { idEmpleado },
      select: {
        idEmpleado: true,
        nombres: true,
        apellidos: true,
        codigoEmpleado: true,
        codigoEmpleadoJefe: true,
        documento: true,
        sede: true,
        idUnidadOcupacionalEmpleadora: true,
        idEmpresaEmpleadora: true,
        usuario: { select: { codigoUsuario: true, rol: true } },
        unidadOcupacionalEmpleadora: { select: { descripcion: true } },
        areaEmpleadora: { select: { descripcion: true } },
        gerenciaEmpleadora: { select: { descripcion: true } },
        puestoEmpleadora: { select: { descripcion: true } },
        empresaEmpleadora: {
          select: {
            nombreEmpresa: true,
            modeloEmpresa: true,
          },
        },
      },
    });

    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const campana = await campanaEnCurso(
      this.prisma,
      empleado.idEmpresaEmpleadora,
    );
    const idCampana = campana?.idCampanaEvaluacion ?? -1;

    const [asignadas, evaluaciones, anuladas, objetivos] = await Promise.all([
      this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
        where: {
          idUnidadOcupacionalEmpleadora:
            empleado.idUnidadOcupacionalEmpleadora,
          competencia: { estado: true },
          competenciaNivel: { estado: true },
        },
        include: {
          competencia: { select: { titulo: true } },
          competenciaNivel: {
            select: {
              nivel: true,
              items: {
                where: { estado: true },
                select: { idCompetenciaNivelItem: true, enunciado: true },
                orderBy: { secuencial: 'asc' },
              },
            },
          },
        },
        orderBy: { idCompetencia: 'asc' },
      }),

      this.prisma.evaluacionCompetencia.findMany({
        where: {
          ...filtroEvaluacionesDeCampana(campana?.idCampanaEvaluacion),
          idEvaluado: idEmpleado,
        },
        select: {
          idCompetencia: true,
          idEvaluado: true,
          idEvaluador: true,
          tipoEvaluador: true,
          evaluador: {
            select: { codigoEmpleado: true, codigoEmpleadoJefe: true },
          },
          itemsEvaluados: {
            where: { estado: true },
            select: { idCompetenciaNivelItem: true, calificacion: true },
          },
        },
      }),

      // Las anuladas van aparte: no cuentan para nada, pero son la explicación
      // de por qué una competencia volvió a cero.
      this.prisma.evaluacionCompetencia.findMany({
        where: {
          estado: true,
          estadoEvaluacion: 'ANULADA',
          idEvaluado: idEmpleado,
          idCampanaEvaluacion: idCampana,
        },
        select: {
          idEvaluacionCompetencia: true,
          idCompetencia: true,
          idEvaluado: true,
          idEvaluador: true,
          tipoEvaluador: true,
          evaluador: {
            select: { codigoEmpleado: true, codigoEmpleadoJefe: true },
          },
          competencia: { select: { titulo: true } },
          nivel: { select: { nivel: true } },
          fechaModificacion: true,
          // `textoItemEvaluado` es la copia del enunciado que se guardó al
          // evaluar: el nivel pudo cambiar después, así que es el texto que
          // de verdad vio quien calificó.
          itemsEvaluados: {
            where: { estado: true },
            select: {
              idEvaluacionCompetenciaItem: true,
              textoItemEvaluado: true,
              calificacion: true,
            },
          },
        },
      }),

      this.prisma.objetivo.findMany({
        where: {
          estado: true,
          idEmpleado,
          idCampanaEvaluacion: idCampana,
        },
        select: {
          idObjetivo: true,
          objetivoDetalles: {
            where: { estado: true },
            select: {
              idObjetivoDetalle: true,
              descripcion: true,
              metaObjetivo: true,
              metaAlcanzada: true,
              porcentajeLogrado: true,
            },
          },
        },
      }),
    ]);

    // La nota de cada ítem, separada por quién la puso. Un `Map` y no un
    // `Set`: el modal no solo enseña qué falta, también con cuánto se calificó
    // lo que ya está.
    const califJefe = new Map<number, number>();
    const califAuto = new Map<number, number>();

    for (const ev of evaluaciones) {
      const origen = origenDeEvaluacion({
        tipoEvaluador: ev.tipoEvaluador,
        idEvaluado: ev.idEvaluado,
        idEvaluador: ev.idEvaluador,
        codigoEvaluado: empleado.codigoEmpleado,
        codigoEvaluador: ev.evaluador?.codigoEmpleado,
        codigoEmpleadoJefe: empleado.codigoEmpleadoJefe,
        codigoJefeDelEvaluador: ev.evaluador?.codigoEmpleadoJefe,
      });

      if (origen !== 'jefe' && origen !== 'auto') continue;

      const destino = origen === 'jefe' ? califJefe : califAuto;

      for (const item of ev.itemsEvaluados) {
        if (item.calificacion !== null) {
          destino.set(item.idCompetenciaNivelItem, item.calificacion);
        }
      }
    }

    const competencias = asignadas.map((a) => {
      const items = a.competenciaNivel.items.map((i) => ({
        idCompetenciaNivelItem: i.idCompetenciaNivelItem,
        enunciado: i.enunciado,
        // `null` = ese evaluador todavía no le puso nota.
        notaJefe: califJefe.get(i.idCompetenciaNivelItem) ?? null,
        notaAuto: califAuto.get(i.idCompetenciaNivelItem) ?? null,
      }));

      const calificadosJefe = items.filter((i) => i.notaJefe !== null).length;
      const calificadosAuto = items.filter((i) => i.notaAuto !== null).length;

      return {
        idCompetencia: a.idCompetencia,
        titulo: a.competencia.titulo,
        nivel: a.competenciaNivel.nivel,
        totalItems: items.length,
        calificadosJefe,
        calificadosAuto,
        completaJefe: items.length > 0 && calificadosJefe === items.length,
        completaAuto: items.length > 0 && calificadosAuto === items.length,
        items,
      };
    });

    const detallesObjetivo = objetivos.flatMap((o) => o.objetivoDetalles);

    return {
      empleado: {
        idEmpleado: empleado.idEmpleado,
        nombres: empleado.nombres,
        apellidos: empleado.apellidos,
        codigoEmpleado: empleado.codigoEmpleado,
        documento: empleado.documento ?? null,
        usuario: empleado.usuario?.codigoUsuario ?? null,
        rol: empleado.usuario?.rol ?? null,
        sede: empleado.sede ?? null,
        empresa: empleado.empresaEmpleadora?.nombreEmpresa ?? null,
        gerencia: empleado.gerenciaEmpleadora?.descripcion ?? null,
        area: empleado.areaEmpleadora?.descripcion ?? null,
        unidad: empleado.unidadOcupacionalEmpleadora?.descripcion ?? null,
        puesto: empleado.puestoEmpleadora?.descripcion ?? null,
        codigoEmpleadoJefe: empleado.codigoEmpleadoJefe ?? null,
      },
      // Nombre de la campaña en curso (antes, el "YYYY-MM").
      periodo: campana?.nombre ?? null,
      modelo: campana?.modeloEmpresa ?? empleado.empresaEmpleadora?.modeloEmpresa ?? null,

      competencias: {
        asignadas: competencias.length,
        completasJefe: competencias.filter((c) => c.completaJefe).length,
        completasAuto: competencias.filter((c) => c.completaAuto).length,
        itemsTotales: competencias.reduce((t, c) => t + c.totalItems, 0),
        itemsPendientesJefe: competencias.reduce(
          (t, c) => t + (c.totalItems - c.calificadosJefe),
          0,
        ),
        detalle: competencias,
      },

      anuladas: anuladas.map((a) => ({
        idEvaluacion: a.idEvaluacionCompetencia,
        idCompetencia: a.idCompetencia,
        titulo: a.competencia?.titulo ?? '—',
        nivel: a.nivel?.nivel ?? null,
        // De quién era la evaluación que se anuló: sin esto no se sabe si lo
        // que se perdió eran notas del jefe (las que puntúan) o una
        // autoevaluación.
        origen: origenDeEvaluacion({
          tipoEvaluador: a.tipoEvaluador,
          idEvaluado: a.idEvaluado,
          idEvaluador: a.idEvaluador,
          codigoEvaluado: empleado.codigoEmpleado,
          codigoEvaluador: a.evaluador?.codigoEmpleado,
          codigoEmpleadoJefe: empleado.codigoEmpleadoJefe,
          codigoJefeDelEvaluador: a.evaluador?.codigoEmpleadoJefe,
        }),
        notasPerdidas: a.itemsEvaluados.filter((i) => i.calificacion !== null)
          .length,
        fecha: a.fechaModificacion,
        items: a.itemsEvaluados.map((i) => ({
          idEvaluacionCompetenciaItem: i.idEvaluacionCompetenciaItem,
          enunciado: i.textoItemEvaluado ?? '—',
          calificacion: i.calificacion,
        })),
      })),

      objetivos: {
        total: detallesObjetivo.length,
        evaluados: detallesObjetivo.filter((d) => d.porcentajeLogrado !== null)
          .length,
        detalle: detallesObjetivo.map((d) => ({
          idObjetivoDetalle: d.idObjetivoDetalle,
          descripcion: d.descripcion,
          metaObjetivo: d.metaObjetivo,
          metaAlcanzada: d.metaAlcanzada,
          porcentajeLogrado: d.porcentajeLogrado,
        })),
      },
    };
  }

  /**
   * El `where` del listado, que la exportación reutiliza tal cual.
   *
   * Estaban escritos dos veces, y el de la exportación además spreadeaba
   * `...(query && {...})`: se colaba siempre con `contains: undefined` y solo
   * funcionaba porque Prisma ignora los `undefined`. Con una sola fuente, el
   * Excel no puede volver a traer un recorte distinto del que se ve en
   * pantalla.
   */
  private async construirWhereListado({
    search,
    idEmpleado,
    nombreCompleto,
    documento,
    codigoEmpleado,
    jefe,
    nombreEmpresaEmpleadora,
    codigoUsuario,
    idEmpresaEmpleadora,
    idGerenciaEmpleadora,
    idAreaEmpleadora,
    idUnidadOcupacionalEmpleadora,
    idPuestoEmpleadora,
    rol,
  }: EmployeeQueryDto): Promise<Prisma.EmpleadoWhereInput> {
    // Cada condición compuesta va dentro de `AND` en vez de en la raíz: hay
    // tres que necesitan su propio `OR` y, puestas como claves sueltas del
    // objeto, la última pisaba a las anteriores.
    const condiciones: Prisma.EmpleadoWhereInput[] = [];

    const palabras = (texto: string) => texto.trim().split(/\s+/).filter(Boolean);

    if (nombreCompleto?.trim()) {
      // Cada palabra tiene que estar en el nombre o en el apellido, así que
      // "Perez Juan" encuentra lo mismo que "Juan Perez".
      condiciones.push(
        ...palabras(nombreCompleto).map((palabra) => ({
          OR: [
            { nombres: { contains: palabra, mode: 'insensitive' as const } },
            { apellidos: { contains: palabra, mode: 'insensitive' as const } },
          ],
        })),
      );
    }

    if (jefe?.trim()) {
      // Hay que traducir el nombre a códigos antes de filtrar: el vínculo con
      // el jefe es el texto `codigoEmpleadoJefe`, no una relación que Prisma
      // pueda recorrer.
      const jefes = await this.prisma.empleado.findMany({
        where: {
          AND: palabras(jefe).map((palabra) => ({
            OR: [
              { nombres: { contains: palabra, mode: 'insensitive' as const } },
              { apellidos: { contains: palabra, mode: 'insensitive' as const } },
            ],
          })),
        },
        select: { codigoEmpleado: true },
      });

      condiciones.push({
        OR: [
          // La caja acepta también el código escrito directo.
          { codigoEmpleadoJefe: { contains: jefe.trim(), mode: 'insensitive' } },
          { codigoEmpleadoJefe: { in: jefes.map((j) => j.codigoEmpleado) } },
        ],
      });
    }

    // En `condiciones` y no como clave suelta: `codigoUsuario` también filtra
    // por la relación `usuario` y los dos se pisarían.
    if (rol) condiciones.push({ usuario: { rol } });

    if (search?.trim()) {
      condiciones.push({
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { documento: { contains: search } },
          { codigoEmpleado: { contains: search, mode: 'insensitive' } },
          {
            usuario: {
              codigoUsuario: { contains: search, mode: 'insensitive' },
            },
          },
          {
            empresaEmpleadora: {
              nombreEmpresa: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      });
    }

    return {
      estado: true,

      ...(idEmpleado && { idEmpleado: Number(idEmpleado) }),

      // Estructura organizacional (con `transform` apagado llegan como texto).
      ...(idEmpresaEmpleadora && {
        idEmpresaEmpleadora: Number(idEmpresaEmpleadora),
      }),
      ...(idGerenciaEmpleadora && {
        idGerenciaEmpleadora: Number(idGerenciaEmpleadora),
      }),
      ...(idAreaEmpleadora && { idAreaEmpleadora: Number(idAreaEmpleadora) }),
      ...(idUnidadOcupacionalEmpleadora && {
        idUnidadOcupacionalEmpleadora: Number(idUnidadOcupacionalEmpleadora),
      }),
      ...(idPuestoEmpleadora && {
        idPuestoEmpleadora: Number(idPuestoEmpleadora),
      }),

      ...(documento && { documento: { contains: documento } }),

      ...(codigoEmpleado && {
        codigoEmpleado: { contains: codigoEmpleado, mode: 'insensitive' },
      }),

      ...(nombreEmpresaEmpleadora && {
        empresaEmpleadora: {
          nombreEmpresa: {
            contains: nombreEmpresaEmpleadora,
            mode: 'insensitive',
          },
        },
      }),

      ...(codigoUsuario && {
        usuario: {
          codigoUsuario: { contains: codigoUsuario, mode: 'insensitive' },
        },
      }),

      ...(condiciones.length > 0 && { AND: condiciones }),
    };
  }

  /**
   * El orden del listado, que la exportación también reutiliza.
   *
   * `sortBy` ya viene validado contra EMPLEADO_SORT_FIELDS por el DTO, así que
   * no hay forma de colar un campo arbitrario; los dos casos especiales
   * ordenan por una relación.
   */
  private construirOrdenListado(
    sortBy?: EmpleadoSortField,
    sortOrder?: 'asc' | 'desc',
  ): Prisma.EmpleadoOrderByWithRelationInput {
    const direccion = sortOrder === 'asc' ? 'asc' : 'desc';

    if (sortBy === 'codigoUsuario') return { usuario: { codigoUsuario: direccion } };
    if (sortBy === 'nombreEmpresaEmpleadora')
      return { empresaEmpleadora: { nombreEmpresa: direccion } };

    return sortBy ? { [sortBy]: direccion } : { fechaCreacion: 'desc' };
  }

  // ============================================================
  // AVANCE DE LA EVALUACIÓN (reporte consolidado)
  // ============================================================
  /**
   * Indicadores del proceso para el seguimiento del administrador. Sale de
   * `conAgregados`, el mismo cálculo que la columna de avance del listado,
   * para que las dos pantallas den la misma cifra.
   *
   * El estado de cada trabajador mira lo que PUNTÚA: la evaluación del jefe
   * y los objetivos. La autoevaluación se informa aparte porque no puntúa
   * (ver resultados-evaluacion.ts), pero sí "inicia" el proceso.
   */
  async avance(query: AvanceQueryDto) {
    try {
      const where = await this.construirWhereListado(query);
      const empleados = await this.prisma.empleado.findMany({
        // El administrador no se evalúa: contarlo bajaría el cumplimiento.
        where: { AND: [where, { usuario: { rol: { not: 'ADMIN' } } }] },
        orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
        include: {
          usuario: { select: { rol: true } },
          empresaEmpleadora: {
            select: { nombreEmpresa: true },
          },
          gerenciaEmpleadora: { select: { descripcion: true } },
          areaEmpleadora: { select: { descripcion: true } },
          unidadOcupacionalEmpleadora: { select: { descripcion: true } },
          puestoEmpleadora: { select: { descripcion: true } },
        },
      });

      // Nombre de la campaña en curso de cada empresa en juego.
      const campanasEnCurso = new Map(
        (
          await this.prisma.campanaEvaluacion.findMany({
            where: {
              estado: CAMPANA_EN_CURSO,
              idEmpresaEmpleadora: {
                in: [...new Set(empleados.map((e) => e.idEmpresaEmpleadora))],
              },
            },
            select: { idEmpresaEmpleadora: true, nombre: true },
          })
        ).map((c) => [c.idEmpresaEmpleadora, c.nombre]),
      );

      const filas = (await this.conAgregados(empleados)).map((e) => {
        const c = e.avanceCompetencias;
        const o = e.avanceObjetivos;
        const jefeListo = c.total === 0 || c.hechasJefe >= c.total;
        const objetivosListos = o.total === 0 || o.hechas >= o.total;

        let estado: EstadoAvance;
        if (c.total === 0 && o.total === 0) estado = 'SIN_ASIGNACION';
        else if (jefeListo && objetivosListos) estado = 'COMPLETO';
        else if (c.hechasJefe === 0 && c.hechasAuto === 0 && o.hechas === 0)
          estado = 'SIN_INICIAR';
        else estado = 'EN_CURSO';

        return {
          idEmpleado: e.idEmpleado,
          codigoEmpleado: e.codigoEmpleado,
          nombres: e.nombres,
          apellidos: e.apellidos,
          documento: e.documento,
          rol: e.usuario.rol,
          idEmpresaEmpleadora: e.idEmpresaEmpleadora,
          empresa: e.empresaEmpleadora.nombreEmpresa,
          periodo: campanasEnCurso.get(e.idEmpresaEmpleadora) ?? null,
          gerencia: e.gerenciaEmpleadora?.descripcion ?? null,
          area: e.areaEmpleadora?.descripcion ?? null,
          unidad: e.unidadOcupacionalEmpleadora?.descripcion ?? null,
          puesto: e.puestoEmpleadora?.descripcion ?? null,
          codigoEmpleadoJefe: e.codigoEmpleadoJefe,
          jefe: e.jefe ? `${e.jefe.nombres} ${e.jefe.apellidos}` : null,
          competencias: c,
          objetivos: o,
          // No `estado`: el PurgeResponseInterceptor borra esa clave.
          estadoAvance: estado,
        };
      });

      type Fila = (typeof filas)[number];

      const pct = (hechas: number, total: number) =>
        total === 0 ? null : Math.round((hechas / total) * 1000) / 10;

      /** Indicadores de un grupo de trabajadores. */
      const resumir = (grupo: Fila[]) => {
        const s = grupo.reduce(
          (a, f) => ({
            compTotal: a.compTotal + f.competencias.total,
            compJefe: a.compJefe + Math.min(f.competencias.hechasJefe, f.competencias.total),
            compAuto: a.compAuto + Math.min(f.competencias.hechasAuto, f.competencias.total),
            objTotal: a.objTotal + f.objetivos.total,
            objHechas: a.objHechas + Math.min(f.objetivos.hechas, f.objetivos.total),
          }),
          { compTotal: 0, compJefe: 0, compAuto: 0, objTotal: 0, objHechas: 0 },
        );
        const porEstado = Object.fromEntries(
          ESTADOS_AVANCE.map((e) => [e, grupo.filter((f) => f.estadoAvance === e).length]),
        ) as Record<EstadoAvance, number>;

        return {
          trabajadores: grupo.length,
          porEstado,
          // Cumplimiento = lo que puntúa (jefe + objetivos) sobre lo asignado.
          cumplimiento: pct(s.compJefe + s.objHechas, s.compTotal + s.objTotal),
          evaluacionJefe: pct(s.compJefe, s.compTotal),
          autoevaluacion: pct(s.compAuto, s.compTotal),
          objetivos: pct(s.objHechas, s.objTotal),
          items: s,
        };
      };

      const agrupar = (clave: (f: Fila) => string) => {
        const grupos = new Map<string, Fila[]>();
        filas.forEach((f) => {
          const k = clave(f);
          grupos.set(k, [...(grupos.get(k) ?? []), f]);
        });
        return [...grupos]
          .map(([nombre, grupo]) => ({ nombre, ...resumir(grupo) }))
          .sort((a, b) => (a.cumplimiento ?? 101) - (b.cumplimiento ?? 101));
      };

      const estadoFiltro = ESTADOS_AVANCE.includes(query.estadoAvance as EstadoAvance)
        ? query.estadoAvance
        : undefined;

      return {
        // Los indicadores van SIN el filtro de estado: filtrar por
        // "completos" y ver 100 % de cumplimiento no le dice nada a nadie.
        resumen: resumir(filas),
        porJefe: agrupar((f) => f.jefe ?? 'Sin jefe asignado'),
        porArea: agrupar((f) => f.area ?? 'Sin área'),
        porGerencia: agrupar((f) => f.gerencia ?? 'Sin gerencia'),
        trabajadores: estadoFiltro
          ? filas.filter((f) => f.estadoAvance === estadoFiltro)
          : filas,
      };
    } catch (error) {
      this.logger.error('Error al calcular el avance:', error);
      handlePrismaError(error, 'empleados');
    }
  }

  async findAll(query: EmployeeQueryDto) {
    const { page, limit, sortBy, sortOrder } = query;

    try {
      const where = await this.construirWhereListado(query);

      const orderBy = this.construirOrdenListado(sortBy, sortOrder);

      const include: Prisma.EmpleadoInclude = {
        usuario: {
          select: { idUsuario: true, codigoUsuario: true, rol: true },
        },
        empresaEmpleadora: true,
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.empleado.findMany({
          where,
          include,
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

      const safeLimit = Math.min(Number(limit) || 10, 100);
      const safePage = Math.max(Number(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;

      const [total, data] = await Promise.all([
        this.prisma.empleado.count({ where }),
        this.prisma.empleado.findMany({
          where,
          skip,
          take: safeLimit,
          include,
          orderBy,
        }),
      ]);

      return {
        data: await this.conAgregados(data),
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      this.logger.error('Error al obtener los empleados:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  // ============================================================
  // FIND ONE
  // ============================================================
  async findOne(id: number) {
    try {
      const empleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        include: {
          usuario: {
            select: { idUsuario: true, codigoUsuario: true, rol: true },
          },
          empresaEmpleadora: true,
        },
      });

      if (!empleado) throw new NotFoundException('Empleado no encontrado');

      return empleado;
    } catch (error) {
      this.logger.error('Error al obtener el empleado:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  // ============================================================
  // FIND EMPLEADO BY ID USUARIO
  // ============================================================
  async findOneByUsuario(id: number) {
    try {
      const empleado = await this.prisma.empleado.findFirst({
        where: { idUsuario: id, estado: true },
        include: {
          usuario: {
            select: { idUsuario: true, codigoUsuario: true, rol: true },
          },
          empresaEmpleadora: true,
        },
      });

      if (!empleado) throw new NotFoundException('Empleado no encontrado');

      return empleado;
    } catch (error) {
      this.logger.error('Error al obtener el empleado por usuario:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(user: AuthUser, id: number, body: UpdateEmpleadoDto) {
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        select: { idEmpleado: true, idUsuario: true, codigoEmpleado: true },
      });

      if (!existEmpleado) throw new NotFoundException('Empleado no encontrado');

      // Jefe: `undefined` = no se toca (PATCH parcial); "" o null = sin jefe.
      // Antes `?? null` dejaba sin jefe a cualquiera actualizado sin el campo.
      const codigoEmpleadoFinal = body.codigoEmpleado ?? existEmpleado.codigoEmpleado;
      let codigoEmpleadoJefe: string | null | undefined;
      if (body.codigoEmpleadoJefe !== undefined) {
        codigoEmpleadoJefe = body.codigoEmpleadoJefe?.trim() || null;
      }
      if (codigoEmpleadoJefe) {
        if (codigoEmpleadoJefe === codigoEmpleadoFinal) {
          throw new BadRequestException(
            'Un trabajador no puede ser su propio jefe.',
          );
        }
        const jefe = await this.prisma.empleado.findFirst({
          where: { codigoEmpleado: codigoEmpleadoJefe, estado: true },
          select: { idEmpleado: true },
        });
        if (!jefe) {
          throw new BadRequestException(
            `No existe un trabajador activo con el código de jefe "${codigoEmpleadoJefe}".`,
          );
        }
      }

      // Validación de unicidad: códigoUsuario
      if (body.codigoUsuario) {
        const existsUser = await this.prisma.usuario.findUnique({
          where: { codigoUsuario: body.codigoUsuario },
        });

        if (existsUser && existsUser.idUsuario !== existEmpleado.idUsuario) {
          throw new BadRequestException(
            `El código de usuario "${body.codigoUsuario}" ya está registrado.`,
          );
        }
      }

      // Validación de unicidad: códigoEmpleado
      if (body.codigoEmpleado) {
        const existsEmp = await this.prisma.empleado.findUnique({
          where: { codigoEmpleado: body.codigoEmpleado },
        });

        if (existsEmp && existsEmp.idEmpleado !== id) {
          throw new BadRequestException(
            `El código de empleado "${body.codigoEmpleado}" ya está registrado.`,
          );
        }
      }

      // --------- Actualizar Usuario ----------
      const usuarioUpdateData: any = {
        codigoUsuario: body.codigoUsuario,
        rol: body.rol,
        fechaModificacion: new Date(),
        actualizadoPorId: user.idUsuario,
      };

      if (body.contrasena) {
        usuarioUpdateData.contrasena = await hash(body.contrasena, 10);
      }

      // --------- Actualizar Empleado ----------
      const empleadoUpdateData = {
        codigoEmpleado: body.codigoEmpleado,
        nombres: body.nombres,
        apellidos: body.apellidos,
        documento: body.documento,
        sede: body.sede,
        tiempoEmpresaValor: body.tiempoEmpresaValor,
        tiempoEmpresaUnidad: body.tiempoEmpresaUnidad,
        idEmpresaEmpleadora: body.idEmpresaEmpleadora,
        idAreaEmpleadora: body.idAreaEmpleadora,
        idPuestoEmpleadora: body.idPuestoEmpleadora,
        idGerenciaEmpleadora: body.idGerenciaEmpleadora,
        idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
        codigoEmpleadoJefe,
        fechaModificacion: new Date(),
        actualizadoPorId: user.idUsuario,
      };

      const cambiaCodigo = codigoEmpleadoFinal !== existEmpleado.codigoEmpleado;

      return await this.prisma.$transaction(async (tx) => {
        await tx.usuario.update({
          where: { idUsuario: existEmpleado.idUsuario },
          data: usuarioUpdateData,
        });

        // El vínculo jefe→subordinado es el texto `codigoEmpleadoJefe`: si
        // cambia el código del jefe, sus subordinados se quedarían sin jefe y
        // sus evaluaciones dejarían de contar como "del jefe".
        if (cambiaCodigo) {
          await tx.empleado.updateMany({
            where: { codigoEmpleadoJefe: existEmpleado.codigoEmpleado },
            data: {
              codigoEmpleadoJefe: codigoEmpleadoFinal,
              fechaModificacion: new Date(),
              actualizadoPorId: user.idUsuario,
            },
          });
        }

        return tx.empleado.update({
          where: { idEmpleado: id },
          data: empleadoUpdateData,
          include: {
            usuario: {
              select: { idUsuario: true, codigoUsuario: true, rol: true },
            },
            empresaEmpleadora: true,
          },
        });
      });
    } catch (error) {
      this.logger.error('Error al actualizar al empleado:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  // ============================================================
  // REMOVE (INACTIVAR)
  // ============================================================
  async remove(user: AuthUser, id: number) {
    try {
      const empleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id },
        select: {
          idEmpleado: true,
          estado: true,
          idUsuario: true,
          codigoEmpleado: true,
        },
      });

      if (!empleado || !empleado.estado)
        throw new NotFoundException('Empleado no encontrado');

      // Quien tiene gente a cargo no se puede dar de baja sin más: sus
      // subordinados quedarían apuntando a un jefe inexistente y nadie podría
      // evaluarlos, porque la lista de subordinados se arma por
      // `codigoEmpleadoJefe`. Mismo criterio que al eliminar una empresa.
      const subordinados = await this.prisma.empleado.count({
        where: { codigoEmpleadoJefe: empleado.codigoEmpleado, estado: true },
      });

      if (subordinados > 0) {
        throw new ConflictException(
          `No se puede eliminar: todavía es jefe de ${subordinados} trabajador(es). Reasígnalos a otro jefe primero.`,
        );
      }

      // El usuario se desactiva junto con el empleado. El login solo mira
      // `usuario.estado`, así que dando de baja únicamente al empleado la
      // persona seguía entrando al sistema como si nada.
      return await this.prisma.$transaction(async (tx) => {
        const fechaModificacion = new Date();

        await tx.usuario.update({
          where: { idUsuario: empleado.idUsuario },
          data: {
            estado: false,
            fechaModificacion,
            actualizadoPorId: user.idUsuario,
          },
        });

        return await tx.empleado.update({
          where: { idEmpleado: id },
          data: {
            estado: false,
            fechaModificacion,
            actualizadoPorId: user.idUsuario,
          },
        });
      });
    } catch (error) {
      this.logger.error('Error al eliminar (inactivar) al empleado:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  /**
   * Baja de varios empleados a la vez, todo o nada.
   *
   * La regla de `remove` (no se da de baja a quien todavía es jefe de alguien)
   * se evalúa **contra el conjunto seleccionado**: si un jefe y todos sus
   * subordinados entran en la misma tanda, la baja es válida, porque al
   * terminar no queda nadie apuntando a un jefe inexistente. Borrando de uno
   * en uno eso solo funcionaba si se acertaba el orden.
   */
  async removeMany(user: AuthUser, ids: number[]) {
    try {
      const unicos = [...new Set(ids)];

      const empleados = await this.prisma.empleado.findMany({
        where: { idEmpleado: { in: unicos }, estado: true },
        select: {
          idEmpleado: true,
          idUsuario: true,
          codigoEmpleado: true,
          nombres: true,
          apellidos: true,
        },
      });

      if (empleados.length !== unicos.length) {
        const encontrados = new Set(empleados.map((e) => e.idEmpleado));
        const faltantes = unicos.filter((id) => !encontrados.has(id));

        throw new NotFoundException(
          `No se encontraron los empleados con ID ${faltantes.join(', ')}.`,
        );
      }

      // Subordinados que se quedarían huérfanos: los que siguen activos, tienen
      // como jefe a alguien de la tanda y no están ellos mismos en la tanda.
      const huerfanos = await this.prisma.empleado.findMany({
        where: {
          estado: true,
          idEmpleado: { notIn: unicos },
          codigoEmpleadoJefe: { in: empleados.map((e) => e.codigoEmpleado) },
        },
        select: { codigoEmpleadoJefe: true },
      });

      if (huerfanos.length > 0) {
        const cuantos = new Map<string, number>();
        for (const h of huerfanos) {
          const codigo = h.codigoEmpleadoJefe ?? '';
          cuantos.set(codigo, (cuantos.get(codigo) ?? 0) + 1);
        }

        const detalle = empleados
          .filter((e) => cuantos.has(e.codigoEmpleado))
          .map(
            (e) =>
              `${e.nombres} ${e.apellidos} (${cuantos.get(e.codigoEmpleado)})`,
          )
          .join(', ');

        // Con una sola fila seleccionada, hablar de "la selección" no dice
        // nada: es el mismo caso que `remove` y se explica igual.
        throw new ConflictException(
          unicos.length === 1
            ? `No se puede eliminar: ${detalle} todavía tiene gente a cargo. Reasígnala a otro jefe primero.`
            : `No se eliminó a nadie: ${detalle} todavía tiene gente a cargo fuera de la selección. Reasígnala a otro jefe o inclúyela en la selección.`,
        );
      }

      const fechaModificacion = new Date();

      await this.prisma.$transaction([
        this.prisma.usuario.updateMany({
          where: { idUsuario: { in: empleados.map((e) => e.idUsuario) } },
          data: {
            estado: false,
            fechaModificacion,
            actualizadoPorId: user.idUsuario,
          },
        }),
        this.prisma.empleado.updateMany({
          where: { idEmpleado: { in: unicos } },
          data: {
            estado: false,
            fechaModificacion,
            actualizadoPorId: user.idUsuario,
          },
        }),
      ]);

      return { eliminados: unicos };
    } catch (error) {
      this.logger.error('Error al eliminar (inactivar) empleados:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  async createMany(user: AuthUser, data: CreateEmpleadoDto[]) {
    const BATCH_SIZE = 10;

    try {
      /* =====================================================
       * 1. Validaciones en memoria (archivo)
       * ===================================================== */
      const codesUser = new Set<string>();
      const codesEmpleado = new Set<string>();

      for (const body of data) {
        if (codesUser.has(body.codigoUsuario)) {
          throw new BadRequestException(
            `Código de usuario duplicado en el archivo: ${body.codigoUsuario}`,
          );
        }
        codesUser.add(body.codigoUsuario);

        if (codesEmpleado.has(body.codigoEmpleado)) {
          throw new BadRequestException(
            `Código de empleado duplicado en el archivo: ${body.codigoEmpleado}`,
          );
        }
        codesEmpleado.add(body.codigoEmpleado);
      }

      /* =====================================================
       * 2. Validar duplicados en BD (UNA sola vez)
       * ===================================================== */
      const codigosUsuario = [...codesUser];
      const codigosEmpleado = [...codesEmpleado];

      const [usuariosExistentes, empleadosExistentes] = await Promise.all([
        this.prisma.usuario.findMany({
          where: { codigoUsuario: { in: codigosUsuario } },
          select: { codigoUsuario: true },
        }),
        this.prisma.empleado.findMany({
          where: { codigoEmpleado: { in: codigosEmpleado } },
          select: { codigoEmpleado: true },
        }),
      ]);

      if (usuariosExistentes.length > 0) {
        throw new BadRequestException(
          `El código de usuario ya existe: ${usuariosExistentes[0].codigoUsuario}`,
        );
      }

      if (empleadosExistentes.length > 0) {
        throw new BadRequestException(
          `El código de empleado ya existe: ${empleadosExistentes[0].codigoEmpleado}`,
        );
      }

      /* =====================================================
       * 3. Preparar data (hash fuera de la transacción)
       * ===================================================== */
      const preparedData = await Promise.all(
        data.map(async (body) => ({
          ...body,
          hashedPassword: await hash(body.contrasena, 10),
        })),
      );

      /* =====================================================
       * 4. Procesar en lotes con transacciones pequeñas
       * ===================================================== */
      const createdEmployees: any[] = [];

      for (let i = 0; i < preparedData.length; i += BATCH_SIZE) {
        const batch = preparedData.slice(i, i + BATCH_SIZE);

        await this.prisma.$transaction(async (tx) => {
          for (const body of batch) {
            const usuario = await tx.usuario.create({
              data: {
                codigoUsuario: body.codigoUsuario,
                contrasena: body.hashedPassword,
                rol: body.rol,
                creadoPorId: user.idUsuario,
              },
            });

            const empleado = await tx.empleado.create({
              data: {
                codigoEmpleado: body.codigoEmpleado,
                nombres: body.nombres,
                apellidos: body.apellidos,
                // documento: body.documento,
                documento: body.documento ? String(body.documento) : null,
                sede: body.sede,
                tiempoEmpresaValor: body.tiempoEmpresaValor,
                tiempoEmpresaUnidad: body.tiempoEmpresaUnidad,
                idEmpresaEmpleadora: body.idEmpresaEmpleadora,
                idAreaEmpleadora: body.idAreaEmpleadora,
                idPuestoEmpleadora: body.idPuestoEmpleadora,
                idGerenciaEmpleadora: body.idGerenciaEmpleadora,
                idUnidadOcupacionalEmpleadora:
                  body.idUnidadOcupacionalEmpleadora,
                // codigoEmpleadoJefe: body.codigoEmpleadoJefe ?? null,
                codigoEmpleadoJefe:
                  body.codigoEmpleadoJefe !== undefined &&
                  body.codigoEmpleadoJefe !== null
                    ? String(body.codigoEmpleadoJefe)
                    : null,
                idUsuario: usuario.idUsuario,
                creadoPorId: user.idUsuario,
              },
              include: {
                usuario: {
                  select: { idUsuario: true, codigoUsuario: true, rol: true },
                },
              },
            });

            createdEmployees.push(empleado);
          }
        });
      }

      return {
        totalInsertados: createdEmployees.length,
        empleados: createdEmployees,
      };
    } catch (error) {
      this.logger.error('Error en creación masiva de empleados', error);
      handlePrismaError(error, 'empleado');
    }
  }

  // Solo subordinados de cada JEFE empleado
  // OBTENER SUBORDINADOS POR USUARIO LOGUEADO
  // ============================================================
  async findSubordinadosByUsuario(id: number) {
    try {
      // 1. Obtener el empleado asociado al usuario
      const empleado = await this.prisma.empleado.findFirst({
        where: {
          idUsuario: id,
          estado: true,
        },
        select: {
          codigoEmpleado: true,
        },
      });

      if (!empleado) {
        throw new NotFoundException(
          'El usuario no tiene un empleado asociado o no existe.',
        );
      }

      // 2. Buscar todos los empleados cuyo jefe sea el código del empleado logueado
      const subordinados = await this.prisma.empleado.findMany({
        where: {
          codigoEmpleadoJefe: empleado.codigoEmpleado,
          estado: true,
        },
        include: {
          usuario: {
            select: { idUsuario: true, codigoUsuario: true, rol: true },
          },
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      return subordinados;
    } catch (error) {
      this.logger.error('Error al obtener subordinados por usuario:', error);
      handlePrismaError(error, 'empleado');
    }
  }

  // Obtener al JEDE inmediato con sus compentecias para evaluacion 180
  async findJefeWithCompetenciasByUsuario(idUsuario: number) {
    try {
      // 1. Obtener el empleado asociado al usuario
      const empleado = await this.prisma.empleado.findFirst({
        where: {
          idUsuario,
          estado: true,
        },
        select: {
          idEmpleado: true,
          codigoEmpleadoJefe: true,
        },
      });

      if (!empleado) {
        throw new NotFoundException(
          'El usuario no tiene un empleado asociado o no existe.',
        );
      }

      if (!empleado.codigoEmpleadoJefe) {
        throw new NotFoundException('El empleado no tiene un jefe asignado.');
      }

      // 2. Obtener datos del jefe
      const jefe = await this.prisma.empleado.findFirst({
        where: {
          codigoEmpleado: empleado.codigoEmpleadoJefe,
          estado: true,
        },
        include: {
          unidadOcupacionalEmpleadora: true,
        },
      });

      if (!jefe) {
        throw new NotFoundException('No se encontró el jefe del empleado.');
      }

      // 3. Obtener competencias del jefe según su unidad ocupacional
      const competencias =
        await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
          where: {
            idUnidadOcupacionalEmpleadora: jefe.idUnidadOcupacionalEmpleadora,
            // El filtro va acá y no dentro del `include`: en una relación
            // a-uno Prisma no acepta `where`, que es por lo que estaba
            // comentado. Sin él, una competencia eliminada seguía pidiéndose
            // como pendiente de evaluar a todo el que ocupe la unidad.
            competencia: { estado: true },
            competenciaNivel: { estado: true },
          },
          include: {
            competencia: true,
            competenciaNivel: {
              include: {
                items: {
                  where: {
                    estado: true,
                  },
                  orderBy: {
                    secuencial: 'asc',
                  },
                },
              },
            },
          },
        });

      // Evaluación al jefe: el subordinado evalúa, el jefe es el evaluado.
      const progreso = await this.calcularProgresoCompetencias(
        jefe.idEmpleado,
        empleado.idEmpleado,
        competencias,
      );

      return {
        jefe,
        competenciasAsignadas: progreso.competenciasAsignadas,
        progresoEvaluacion: progreso.progresoEvaluacion,
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener jefe con competencias (idUsuario=${idUsuario}):`,
        error,
      );
      handlePrismaError(error, 'empleado');
    }
  }

  // ============================================================
  // OBTENER EMPLEADOS POR EMPRESA EMPLEADORA
  // ============================================================
  async findByEmpresa(idEmpresaEmpleadora: number) {
    try {
      // 1. Validar existencia de la empresa empleadora
      const empresa = await this.prisma.empresaEmpleadora.findUnique({
        where: { idEmpresaEmpleadora },
        select: { idEmpresaEmpleadora: true },
      });

      if (!empresa) {
        throw new NotFoundException(
          `La empresa empleadora con ID ${idEmpresaEmpleadora} no existe.`,
        );
      }

      // 2. Obtener empleados asociados a dicha empresa
      const empleados = await this.prisma.empleado.findMany({
        where: {
          estado: true,
          idEmpresaEmpleadora,
        },
        include: {
          usuario: {
            select: { idUsuario: true, codigoUsuario: true, rol: true },
          },
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      return empleados;
    } catch (error) {
      this.logger.error(
        'Error al obtener empleados por empresa empleadora:',
        error,
      );
      handlePrismaError(error, 'empleado');
    }
  }

  //Subordinado con sus competencias
  // SUBORDINADOS (POR ID DEL JEFE) + COMPETENCIAS DE LA UO
  // ============================================================
  async findSubordinadosWithCompetenciasByJefe(idEmpleadoJefe: number) {
    try {
      // 1. Obtener datos del jefe (para sacar su códigoEmpleado)
      const jefe = await this.prisma.empleado.findFirst({
        where: {
          idEmpleado: idEmpleadoJefe,
          estado: true,
        },
        select: {
          codigoEmpleado: true,
        },
      });

      if (!jefe) {
        throw new NotFoundException(
          `El empleado jefe con ID ${idEmpleadoJefe} no existe.`,
        );
      }

      // 2. Obtener subordinados directos
      const subordinados = await this.prisma.empleado.findMany({
        where: {
          codigoEmpleadoJefe: jefe.codigoEmpleado,
          estado: true,
        },
        include: {
          unidadOcupacionalEmpleadora: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      // 3. Para cada subordinado obtener competencias de su unidad ocupacional
      const results: any[] = [];

      for (const sub of subordinados) {
        const competencias =
          await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
            where: {
              idUnidadOcupacionalEmpleadora: sub.idUnidadOcupacionalEmpleadora,
              // El filtro va acá y no dentro del `include`: en una relación
              // a-uno Prisma no acepta `where`, que es por lo que estaba
              // comentado. Sin él, una competencia eliminada seguía pidiéndose
              // como pendiente de evaluar a todo el que ocupe la unidad.
              competencia: { estado: true },
              competenciaNivel: { estado: true },
            },
            include: {
              competencia: true,
              competenciaNivel: {
                include: {
                  items: {
                    where: {
                      estado: true,
                    },
                    orderBy: {
                      secuencial: 'asc',
                    },
                  },
                },
              },
            },
          });

        // El jefe es el evaluador de cada uno de sus subordinados.
        const progreso = await this.calcularProgresoCompetencias(
          sub.idEmpleado,
          idEmpleadoJefe,
          competencias,
        );

        results.push({
          subordinado: sub,
          competenciasAsignadas: progreso.competenciasAsignadas,
          progresoEvaluacion: progreso.progresoEvaluacion,
        });
      }

      return results;
    } catch (error) {
      this.logger.error(
        'Error al obtener subordinados con competencias:',
        error,
      );
      handlePrismaError(error, 'empleado');
    }
  }

  // ============================================================
  // COMPETENCIAS ASIGNADAS DE UN EMPLEADO (POR ID EMPLEADO)
  // ============================================================
  // ============================================================
  // PROGRESO DE EVALUACIÓN DE COMPETENCIAS
  // ------------------------------------------------------------
  // Devuelve las competencias recibidas con su progreso individual, más el
  // acumulado. Un ítem cuenta como evaluado cuando su calificación NO es null;
  // 0 es una calificación válida (0% existe en LIKERT y en MANUAL).
  // ============================================================
  private async calcularProgresoCompetencias<
    T extends {
      idCompetencia: number;
      competenciaNivel: { items: { idCompetenciaNivelItem: number }[] };
    },
  >(idEvaluado: number, idEvaluador: number, competencias: T[]) {
    // La campaña del evaluado. Sin esto el progreso contaba también los ítems
    // calificados en periodos anteriores, así que la barra de las pantallas de
    // evaluación no coincidía con la columna del listado, que sí acota por
    // periodo. Las dos cifras describen lo mismo y tienen que salir iguales.
    const datos = await this.prisma.empleado.findUnique({
      where: { idEmpleado: idEvaluado },
      select: { idEmpresaEmpleadora: true },
    });
    const campana = datos
      ? await campanaEnCurso(this.prisma, datos.idEmpresaEmpleadora)
      : null;

    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        ...filtroEvaluacionesDeCampana(campana?.idCampanaEvaluacion),
        idEvaluado,
        idEvaluador,
        idCompetencia: { in: competencias.map((c) => c.idCompetencia) },
      },
      select: {
        idCompetencia: true,
        itemsEvaluados: {
          where: { estado: true },
          select: { idCompetenciaNivelItem: true, calificacion: true },
        },
      },
    });

    const calificadosPorCompetencia = new Map<number, Set<number>>();

    for (const ev of evaluaciones) {
      const calificados =
        calificadosPorCompetencia.get(ev.idCompetencia) ?? new Set<number>();

      for (const item of ev.itemsEvaluados) {
        if (item.calificacion !== null) {
          calificados.add(item.idCompetenciaNivelItem);
        }
      }

      calificadosPorCompetencia.set(ev.idCompetencia, calificados);
    }

    let totalItems = 0;
    let itemsEvaluados = 0;

    const competenciasAsignadas = competencias.map((c) => {
      // Solo cuentan los ítems del nivel asignado hoy: si la unidad
      // ocupacional cambió de nivel, los del nivel viejo no deben inflar
      // ni bloquear el progreso.
      const asignados = new Set(
        c.competenciaNivel.items.map((i) => i.idCompetenciaNivelItem),
      );
      const calificados =
        calificadosPorCompetencia.get(c.idCompetencia) ?? new Set<number>();

      const evaluados = [...calificados].filter((id) =>
        asignados.has(id),
      ).length;

      totalItems += asignados.size;
      itemsEvaluados += evaluados;

      return {
        ...c,
        progresoEvaluacion: {
          totalItems: asignados.size,
          itemsEvaluados: evaluados,
          completo: asignados.size > 0 && evaluados === asignados.size,
        },
      };
    });

    return {
      competenciasAsignadas,
      progresoEvaluacion: {
        totalItems,
        itemsEvaluados,
        completo: totalItems > 0 && itemsEvaluados === totalItems,
      },
    };
  }

  async findCompetenciasByEmpleado(idEmpleado: number) {
    try {
      // 1. Buscar empleado
      const empleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado, estado: true },
        select: {
          idEmpleado: true,
          idUnidadOcupacionalEmpleadora: true,
          nombres: true,
          apellidos: true,
        },
      });

      if (!empleado) {
        throw new NotFoundException(
          `Empleado con ID ${idEmpleado} no encontrado.`,
        );
      }

      // 2. Buscar competencias según su unidad ocupacional
      const competencias =
        await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
          where: {
            idUnidadOcupacionalEmpleadora:
              empleado.idUnidadOcupacionalEmpleadora,
            competencia: { estado: true },
            competenciaNivel: { estado: true },
          },
          include: {
            competencia: true,
            competenciaNivel: {
              include: {
                // Sin este filtro los ítems dados de baja seguían contando en
                // el denominador y la autoevaluación no llegaba nunca al 100 %.
                items: {
                  where: { estado: true },
                  orderBy: { secuencial: 'asc' },
                },
              },
            },
          },
        });

      // Autoevaluación: el empleado es a la vez evaluado y evaluador.
      const progreso = await this.calcularProgresoCompetencias(
        idEmpleado,
        idEmpleado,
        competencias,
      );

      return {
        empleado,
        competenciasAsignadas: progreso.competenciasAsignadas,
        progresoEvaluacion: progreso.progresoEvaluacion,
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener competencias del empleado ${idEmpleado}:`,
        error,
      );
      handlePrismaError(error, 'empleado');
    }
  }

  async exportExcel(query: EmployeeQueryDto) {
    try {
      // El mismo recorte y el mismo orden que el listado: lo que se exporta es
      // lo que se ve. El orden llegaba en la query y se descartaba, así que
      // ordenar la tabla y exportar daba un archivo en otro orden.
      const where = await this.construirWhereListado(query);
      const orderBy = this.construirOrdenListado(query.sortBy, query.sortOrder);

      const empleados = await this.prisma.empleado.findMany({
        where,
        orderBy,
        include: {
          empresaEmpleadora: true,
          gerenciaEmpleadora: { select: { descripcion: true } },
          areaEmpleadora: { select: { descripcion: true } },
          unidadOcupacionalEmpleadora: { select: { descripcion: true } },
          puestoEmpleadora: { select: { descripcion: true } },
          usuario: {
            select: { idUsuario: true, codigoUsuario: true, rol: true },
          },
        },
      });

      // Mismos agregados que el listado: el nombre del jefe (la columna traía
      // solo el código, y "YLRZUE" no le dice nada a quien abre el archivo) y
      // el avance de evaluaciones, que es la columna con más peso en pantalla
      // y no estaba.
      const filas = await this.conAgregados(empleados);

      // Trae TODOS los campos de la carga masiva, con nombre e ID: el archivo
      // sirve para leerlo y también como base para volver a importar.
      return await construirLibroExcel([
        {
          nombre: 'Trabajadores',
          columnas: [
            { header: 'ID', key: 'idEmpleado', width: 8 },
            { header: 'Código de empleado', key: 'codigoEmpleado', tipo: 'texto' },
            { header: 'Nombres', key: 'nombres', width: 24 },
            { header: 'Apellidos', key: 'apellidos', width: 24 },
            { header: 'Documento', key: 'documento', tipo: 'texto' },
            { header: 'Usuario', key: 'codigoUsuario', tipo: 'texto' },
            { header: 'Rol', key: 'rol' },
            { header: 'Empresa', key: 'empresa', width: 28 },
            { header: 'ID empresa', key: 'idEmpresaEmpleadora' },
            { header: 'Gerencia', key: 'gerencia', width: 24 },
            { header: 'ID gerencia', key: 'idGerenciaEmpleadora' },
            { header: 'Área', key: 'area', width: 24 },
            { header: 'ID área', key: 'idAreaEmpleadora' },
            { header: 'Unidad ocupacional', key: 'unidad', width: 26 },
            { header: 'ID unidad', key: 'idUnidadOcupacionalEmpleadora' },
            { header: 'Puesto', key: 'puesto', width: 24 },
            { header: 'ID puesto', key: 'idPuestoEmpleadora' },
            { header: 'Jefe', key: 'jefe', width: 28 },
            { header: 'Código del jefe', key: 'codigoEmpleadoJefe', tipo: 'texto' },
            { header: 'Sede', key: 'sede', width: 18 },
            { header: 'Tiempo en la empresa', key: 'tiempoEmpresaValor' },
            { header: 'Unidad de tiempo', key: 'tiempoEmpresaUnidad' },
            // Cuatro números en vez de un "1/2" de texto: así se pueden sumar
            // y cruzar en una tabla dinámica, que es para lo que se exporta.
            { header: 'Competencias evaluadas por el jefe', key: 'competenciasJefe' },
            { header: 'Competencias autoevaluadas', key: 'competenciasAuto' },
            { header: 'Competencias totales', key: 'competenciasTotal' },
            { header: 'Objetivos evaluados', key: 'objetivosHechas' },
            { header: 'Objetivos totales', key: 'objetivosTotal' },
          ],
          filas: filas.map((item) => ({
            idEmpleado: item.idEmpleado,
            codigoEmpleado: item.codigoEmpleado,
            nombres: item.nombres,
            apellidos: item.apellidos,
            documento: item.documento,
            codigoUsuario: item.usuario.codigoUsuario,
            rol: item.usuario.rol,
            empresa: item.empresaEmpleadora.nombreEmpresa,
            idEmpresaEmpleadora: item.idEmpresaEmpleadora,
            gerencia: item.gerenciaEmpleadora?.descripcion,
            idGerenciaEmpleadora: item.idGerenciaEmpleadora,
            area: item.areaEmpleadora?.descripcion,
            idAreaEmpleadora: item.idAreaEmpleadora,
            unidad: item.unidadOcupacionalEmpleadora?.descripcion,
            idUnidadOcupacionalEmpleadora: item.idUnidadOcupacionalEmpleadora,
            puesto: item.puestoEmpleadora?.descripcion,
            idPuestoEmpleadora: item.idPuestoEmpleadora,
            jefe: item.jefe ? `${item.jefe.nombres} ${item.jefe.apellidos}` : '',
            codigoEmpleadoJefe: item.codigoEmpleadoJefe,
            sede: item.sede,
            tiempoEmpresaValor: item.tiempoEmpresaValor,
            tiempoEmpresaUnidad: item.tiempoEmpresaUnidad,
            competenciasJefe: item.avanceCompetencias.hechasJefe,
            competenciasAuto: item.avanceCompetencias.hechasAuto,
            competenciasTotal: item.avanceCompetencias.total,
            objetivosHechas: item.avanceObjetivos.hechas,
            objetivosTotal: item.avanceObjetivos.total,
          })),
        },
      ]);
    } catch (error) {
      handlePrismaError(error, 'empleados');
    }
  }
}
