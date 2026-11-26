import {
  FORMATO_DOCUMENTO,
  SITUACIONES,
  Situacion,
  TipoDocumento,
} from './types/situacion';
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
import { EmployeeQueryDto, EmpleadoSortField } from './dto/employee-query.dto';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

import { origenDeEvaluacion } from 'src/common/resultados/resultados-evaluacion';

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

import { construirPlantillaTrabajadores } from './plantilla-importacion';
import { generarContrasena } from 'src/common/acceso/generar-contrasena';
import { problemaContrasena } from 'src/common/acceso/politica-contrasena';

/**
 * Ámbito de la cuenta: la de un trabajador (JEFE / EMPLEADO) es de su empresa
 * y su usuario solo es único dentro de ella; la de un ADMIN es del sistema.
 */
const empresaDeCuenta = (rol: string | undefined, idEmpresa: unknown) =>
  rol === 'JEFE' || rol === 'EMPLEADO' ? Number(idEmpresa) : null;

/**
 * Usuario y contraseña los pone el sistema: el usuario es el documento (así
 * está en todas las empresas) y la contraseña se genera al azar. `acceso`
 * es lo que se entrega una sola vez (la contraseña se guarda cifrada).
 */
const conAcceso = <
  T extends { codigoUsuario?: string; contrasena?: string; documento: string },
>(
  b: T,
) => {
  const usuario = b.codigoUsuario || String(b.documento ?? '').trim();
  const generada = !b.contrasena;
  const contrasena = b.contrasena || generarContrasena();
  return {
    body: { ...b, codigoUsuario: usuario, contrasena } as T & {
      codigoUsuario: string;
      contrasena: string;
    },
    acceso: { usuario, contrasena, generada },
  };
};

/** "2023-03-15" → fecha (medianoche UTC; la columna es DATE). */
/** Cómo se nombra el dueño de una cuenta en los mensajes. */
const ROL_EN_MENSAJE: Record<string, string> = {
  ADMIN: 'superadministrador',
  EQUIPO: 'equipo de TeamWork',
  ADMIN_EMPRESA: 'administrador de la empresa',
  JEFE: 'jefe',
  EMPLEADO: 'trabajador',
};

/**
 * El usuario de un trabajador es su documento y no está en ningún formulario
 * ni en la plantilla: si ya lo usa otra cuenta, el mensaje habla del número
 * que la persona escribió (el documento) y de quién lo usa, nunca del
 * «código de usuario» (pedido explícito: hacía buscar una columna que no
 * existe).
 */
const mensajeUsuarioTomado = (
  numero: string,
  duenio?: {
    rol?: string | null;
    nombreCompleto?: string | null;
    empleado?: { nombres: string; apellidos: string } | null;
  } | null,
) => {
  const nombre = duenio?.empleado
    ? `${duenio.empleado.nombres} ${duenio.empleado.apellidos}`.trim()
    : duenio?.nombreCompleto;
  const rol = ROL_EN_MENSAJE[duenio?.rol ?? ''] ?? 'otra cuenta';
  return `El número ${numero} ya se usa para ingresar con otra cuenta de esta empresa${nombre ? ` (${nombre}, ${rol})` : ''}. Revise el documento o comuníquese con TeamWork.`;
};

const aFecha = (v?: string | null) =>
  v ? new Date(`${v}T00:00:00.000Z`) : null;

/** "3 años y 8 meses" desde la fecha de ingreso hasta hoy. */
const textoAntiguedad = (f?: Date | null) => {
  if (!f) return '';
  const hoy = new Date();
  let meses =
    (hoy.getUTCFullYear() - f.getUTCFullYear()) * 12 +
    (hoy.getUTCMonth() - f.getUTCMonth());
  if (hoy.getUTCDate() < f.getUTCDate()) meses -= 1;
  if (meses < 1) return 'Menos de un mes';
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  const anos = a ? `${a} ${a === 1 ? 'año' : 'años'}` : '';
  const mes = m ? `${m} ${m === 1 ? 'mes' : 'meses'}` : '';
  return [anos, mes].filter(Boolean).join(' y ');
};

/** Qué tiene de malo una fecha de ingreso, o `undefined` si está bien. */
const problemaFechaIngreso = (v?: string | null) => {
  if (!v) return undefined;
  const f = aFecha(v)!;
  if (Number.isNaN(f.getTime()) || f.toISOString().slice(0, 10) !== v)
    return `La fecha de ingreso "${v}" no existe.`;
  if (f.getTime() > Date.now())
    return 'La fecha de ingreso no puede ser futura.';
  if (f.getUTCFullYear() < 1950)
    return `La fecha de ingreso "${v}" no es válida.`;
  return undefined;
};

/**
 * Los textos del trabajador se guardan recortados: "  EMP-01  " no
 * coincidía con "EMP-01" al buscar al jefe (el vínculo es texto) y los
 * nombres salían con espacios dobles en los reportes.
 */
const normalizarTrabajador = <T extends object>(b: T): T => {
  const r: Record<string, unknown> = { ...(b as Record<string, unknown>) };
  for (const k of [
    'codigoUsuario',
    'codigoEmpleado',
    'documento',
    'codigoEmpleadoJefe',
  ])
    if (typeof r[k] === 'string') r[k] = (r[k] as string).trim();
  for (const k of ['nombres', 'apellidos', 'sede'])
    if (typeof r[k] === 'string')
      r[k] = (r[k] as string).replace(/\s+/g, ' ').trim();
  return r as T;
};

@Injectable()
export class EmpleadoService {
  private readonly logger = new Logger(EmpleadoService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================
  // UTILITY: VALIDAR UNICIDAD
  // ============================================================
  /**
   * Comprueba que la estructura y el jefe de un trabajador existan, estén
   * activos y sean de **su** empresa. Devuelve los problemas en vez de
   * lanzar, para que la importación los junte todos.
   *
   * Antes no se miraba nada de esto: una fila de una empresa podía llevar el
   * área o el puesto de otra (bastaba con que el id existiera), y un código de
   * jefe mal escrito, de otra empresa o dado de baja se guardaba igual y la
   * persona quedaba sin quien la evaluara.
   *
   * `jefesDelLote`: en una importación, el jefe puede venir en el mismo
   * archivo (todavía no existe en la base). Mapa código → idEmpresa.
   */
  private async problemasDeRelaciones(
    idEmpresa: number,
    datos: {
      codigoEmpleado?: string | null;
      idGerenciaEmpleadora?: number | null;
      idAreaEmpleadora?: number | null;
      idUnidadOcupacionalEmpleadora?: number | null;
      idPuestoEmpleadora?: number | null;
      codigoEmpleadoJefe?: string | null;
    },
    jefesDelLote?: Map<string, number>,
  ): Promise<string[]> {
    const problemas: string[] = [];
    const deLaEmpresa = { idEmpresaEmpleadora: idEmpresa, estado: true };

    const revisar = async (
      id: number | null | undefined,
      nombre: string,
      buscar: () => Promise<unknown>,
    ) => {
      if (id === undefined || id === null) return;
      if (!(await buscar())) {
        problemas.push(
          `${nombre} con id ${id} no existe en la empresa o está dado de baja.`,
        );
      }
    };

    await Promise.all([
      revisar(datos.idGerenciaEmpleadora, 'La gerencia', () =>
        this.prisma.gerenciaEmpleadora.findFirst({
          where: {
            idGerenciaEmpleadora: Number(datos.idGerenciaEmpleadora),
            ...deLaEmpresa,
          },
          select: { idGerenciaEmpleadora: true },
        }),
      ),
      revisar(datos.idAreaEmpleadora, 'El área', () =>
        this.prisma.areaEmpleadora.findFirst({
          where: {
            idAreaEmpleadora: Number(datos.idAreaEmpleadora),
            ...deLaEmpresa,
          },
          select: { idAreaEmpleadora: true },
        }),
      ),
      revisar(datos.idUnidadOcupacionalEmpleadora, 'El grupo ocupacional', () =>
        this.prisma.unidadOcupacionalEmpleadora.findFirst({
          where: {
            idUnidadOcupacionalEmpleadora: Number(
              datos.idUnidadOcupacionalEmpleadora,
            ),
            ...deLaEmpresa,
          },
          select: { idUnidadOcupacionalEmpleadora: true },
        }),
      ),
      revisar(datos.idPuestoEmpleadora, 'El puesto', () =>
        this.prisma.puestoEmpleadora.findFirst({
          where: {
            idPuestoEmpleadora: Number(datos.idPuestoEmpleadora),
            ...deLaEmpresa,
          },
          select: { idPuestoEmpleadora: true },
        }),
      ),
    ]);

    const jefe = datos.codigoEmpleadoJefe?.toString().trim();
    if (jefe) {
      if (jefe === datos.codigoEmpleado?.toString().trim()) {
        problemas.push('Un trabajador no puede ser su propio jefe.');
      } else if (jefesDelLote?.get(jefe) === idEmpresa) {
        // Viene en el mismo archivo, en la misma empresa: vale.
      } else {
        const enBase = await this.prisma.empleado.findFirst({
          where: { codigoEmpleado: jefe, ...deLaEmpresa },
          select: {
            nombres: true,
            apellidos: true,
            usuario: { select: { rol: true } },
          },
        });
        // Solo el rol Jefe tiene las pantallas para evaluar a su equipo: con
        // un jefe de rol Empleado, sus subordinados quedaban sin evaluador.
        if (enBase && enBase.usuario?.rol !== 'JEFE') {
          problemas.push(
            `${enBase.nombres} ${enBase.apellidos} (${jefe}) no tiene el rol Jefe: cámbielo a Jefe antes de asignarle personas a cargo.`,
          );
        }
        if (!enBase) {
          problemas.push(
            `No hay un trabajador activo de la empresa con el código de jefe "${jefe}".`,
          );
        }
      }
    }

    return problemas;
  }

  /**
   * Si poner a `codigoJefe` como jefe de `codigo` cierra un círculo (el
   * nuevo jefe depende, directa o indirectamente, de este trabajador), dice
   * por qué; si no, `null`. Se sube por la cadena de jefes del nuevo jefe.
   * Sin esto, A podía ser jefe de B y B de A: los dos se evaluaban como
   * jefe y como subordinado a la vez.
   */
  private async formariaCiclo(
    idEmpresa: number,
    codigo: string,
    codigoJefe: string,
  ): Promise<string | null> {
    const vistos = new Set<string>();
    let actual: string | null = codigoJefe;
    while (actual && !vistos.has(actual)) {
      if (actual === codigo) {
        return `No se puede asignar como jefe a "${codigoJefe}": está a cargo de este trabajador, directa o indirectamente.`;
      }
      vistos.add(actual);
      const fila = await this.prisma.empleado.findFirst({
        where: { codigoEmpleado: actual, idEmpresaEmpleadora: idEmpresa },
        select: { codigoEmpleadoJefe: true },
      });
      actual = fila?.codigoEmpleadoJefe ?? null;
    }
    return null;
  }

  /**
   * El documento de identidad: formato según su tipo y que nadie más de la
   * empresa lo tenga, en ninguna situación. Si es de alguien cesado, se dice:
   * a quien vuelve se lo reactiva, no se lo registra de nuevo (perdería su
   * historial). Antes el documento era opcional y nadie lo comparaba, así que
   * una misma persona podía quedar registrada dos veces.
   *
   * En la importación (`enArchivo`) el mensaje dice además qué hacer con la
   * fila: si es la misma persona, quitarla.
   */
  private async problemasDeDocumento(
    idEmpresa: number,
    tipo: string | undefined,
    numero: string | null | undefined,
    excluirIdEmpleado?: number,
    enArchivo = false,
  ): Promise<string[]> {
    const tipoDoc = (tipo ?? 'DNI') as TipoDocumento;
    const doc = (numero ?? '').toString().trim();
    if (!doc) return ['El documento es obligatorio.'];
    const formato = FORMATO_DOCUMENTO[tipoDoc];
    if (!formato) return [`Tipo de documento no válido: ${tipo}.`];
    if (!formato.regex.test(doc)) {
      return [
        `El ${tipoDoc} "${doc}" no es válido: debe tener ${formato.ayuda}.`,
      ];
    }
    const otro = await this.prisma.empleado.findFirst({
      where: {
        idEmpresaEmpleadora: idEmpresa,
        tipoDocumento: tipoDoc,
        documento: doc,
        ...(excluirIdEmpleado && { idEmpleado: { not: excluirIdEmpleado } }),
      },
      select: {
        nombres: true,
        apellidos: true,
        codigoEmpleado: true,
        situacion: true,
      },
    });
    if (!otro) return [];
    const quien = `${otro.nombres} ${otro.apellidos} (código ${otro.codigoEmpleado})`;
    return [
      otro.situacion === 'ACTIVO'
        ? `Esta persona ya está registrada: el ${tipoDoc} ${doc} es de ${quien}. ${
            enArchivo
              ? 'Si es la misma persona, quite la fila; si no, revise el número de documento.'
              : 'Revise el número de documento.'
          }`
        : `Esta persona ya está registrada: el ${tipoDoc} ${doc} es de ${quien}, que está ${otro.situacion.toLowerCase()}. Reactívela desde Trabajadores en vez de registrarla de nuevo${enArchivo ? ', y quite la fila' : ''}.`,
    ];
  }

  private async validateUniqueFields(body: CreateEmpleadoDto) {
    // ============================================================
    // VALIDAR CÓDIGO DE USUARIO
    // ============================================================
    const existsUser = await this.prisma.usuario.findFirst({
      where: {
        codigoUsuario: body.codigoUsuario,
        idEmpresaCuenta: empresaDeCuenta(body.rol, body.idEmpresaEmpleadora),
      },
      select: {
        rol: true,
        nombreCompleto: true,
        empleado: { select: { nombres: true, apellidos: true } },
      },
    });
    if (existsUser) {
      throw new BadRequestException(
        mensajeUsuarioTomado(String(body.codigoUsuario), existsUser),
      );
    }

    // ============================================================
    // VALIDAR CÓDIGO DE EMPLEADO
    // ============================================================
    // Único por empresa: dos empresas pueden usar el mismo código interno.
    const existsEmpleado = await this.prisma.empleado.findFirst({
      where: {
        codigoEmpleado: body.codigoEmpleado,
        idEmpresaEmpleadora: Number(body.idEmpresaEmpleadora),
      },
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
  async create(user: AuthUser, entrada: CreateEmpleadoDto) {
    const { body, acceso } = conAcceso(normalizarTrabajador(entrada));
    // Una contraseña escrita (no generada) no puede ser obvia.
    if (!acceso.generada) {
      const debil = problemaContrasena(body.contrasena, [
        body.codigoUsuario,
        body.documento,
        body.nombres,
        body.apellidos,
      ]);
      if (debil) throw new BadRequestException(debil);
    }
    const fechaMala = problemaFechaIngreso(body.fechaIngreso);
    if (fechaMala) throw new BadRequestException(fechaMala);
    try {
      // Primero el documento: si la persona ya está registrada, eso es lo
      // que hay que decir (el usuario es el mismo número y repetiría lo
      // mismo con otras palabras).
      const delDocumento = await this.problemasDeDocumento(
        Number(body.idEmpresaEmpleadora),
        body.tipoDocumento,
        body.documento,
      );
      if (delDocumento.length) {
        throw new BadRequestException({
          message: delDocumento[0],
          errors: delDocumento,
        });
      }
      await this.validateUniqueFields(body);

      const problemas = [
        ...(await this.problemasDeRelaciones(
          Number(body.idEmpresaEmpleadora),
          body,
        )),
      ];
      if (problemas.length) {
        throw new BadRequestException({
          message: problemas[0],
          errors: problemas,
        });
      }

      return await this.prisma.$transaction(async (tx) => {
        const hashedPassword = await hash(body.contrasena, 10);

        const usuario = await tx.usuario.create({
          data: {
            codigoUsuario: body.codigoUsuario,
            contrasena: hashedPassword,
            rol: body.rol,
            idEmpresaCuenta: empresaDeCuenta(
              body.rol,
              body.idEmpresaEmpleadora,
            ),
            creadoPorId: user.idUsuario,
          },
        });

        const empleado = await tx.empleado.create({
          data: {
            codigoEmpleado: body.codigoEmpleado, // obligatorio
            nombres: body.nombres,
            apellidos: body.apellidos,
            tipoDocumento: body.tipoDocumento ?? 'DNI',
            documento: body.documento?.toString().trim(),
            sede: body.sede,
            fechaIngreso: aFecha(body.fechaIngreso),
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

        return { empleado, acceso };
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
    T extends {
      idEmpleado: number;
      idEmpresaEmpleadora: number;
      codigoEmpleadoJefe: string | null;
    },
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
                          AND ev.codigo_empleado = e.codigo_empleado_jefe
                          AND ev.id_empresa_empleadora = e.id_empresa_empleadora) AS es_jefe
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
            where: {
              codigoEmpleado: { in: codigosJefe },
              idEmpresaEmpleadora: {
                in: [...new Set(empleados.map((e) => e.idEmpresaEmpleadora))],
              },
            },
            select: {
              idEmpresaEmpleadora: true,
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
    // El código es único por empresa: el jefe se busca en la del trabajador.
    const mapaJefes = new Map(
      jefes.map(
        (j) => [`${j.idEmpresaEmpleadora}|${j.codigoEmpleado}`, j] as const,
      ),
    );
    const vacio = { total: 0, hechas: 0 };
    const vacioCompetencias = { total: 0, hechasJefe: 0, hechasAuto: 0 };

    return empleados.map((empleado) => ({
      ...empleado,
      jefe: empleado.codigoEmpleadoJefe
        ? (mapaJefes.get(
            `${empleado.idEmpresaEmpleadora}|${empleado.codigoEmpleadoJefe}`,
          ) ?? null)
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
  /**
   * Qué pasa en la campaña en curso si el trabajador pasa a otro grupo
   * ocupacional. Mientras la campaña está abierta, lo que le toca se lee del
   * grupo ACTUAL: las competencias que el grupo nuevo no tiene dejan de
   * contar aunque ya tengan notas, las nuevas cuentan 0 hasta que se
   * califiquen y las de otro nivel cambian de comportamientos. El formulario
   * lo muestra antes de guardar.
   */
  async impactoCambioGrupo(idEmpleado: number, idUnidadNueva: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { idEmpleado },
      select: {
        idEmpresaEmpleadora: true,
        idUnidadOcupacionalEmpleadora: true,
      },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const sinImpacto = {
      campana: null as string | null,
      quitadas: [] as { titulo: string; conNotas: boolean }[],
      nuevas: [] as string[],
      cambiaNivel: [] as { titulo: string; conNotas: boolean }[],
    };
    if (empleado.idUnidadOcupacionalEmpleadora === idUnidadNueva)
      return sinImpacto;

    const campana = await campanaEnCurso(
      this.prisma,
      empleado.idEmpresaEmpleadora,
    );
    if (!campana) return sinImpacto;

    const asignacion = (idUnidad: number) =>
      this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
        where: {
          idUnidadOcupacionalEmpleadora: idUnidad,
          competencia: { estado: true },
          competenciaNivel: { estado: true },
        },
        select: {
          idCompetencia: true,
          idCompetenciaNivel: true,
          competencia: { select: { titulo: true } },
        },
      });

    const [actual, nueva, evaluaciones] = await Promise.all([
      asignacion(empleado.idUnidadOcupacionalEmpleadora),
      asignacion(idUnidadNueva),
      this.prisma.evaluacionCompetencia.findMany({
        where: {
          ...filtroEvaluacionesDeCampana(campana.idCampanaEvaluacion),
          idEvaluado: idEmpleado,
          itemsEvaluados: {
            some: { estado: true, calificacion: { not: null } },
          },
        },
        select: { idCompetencia: true },
      }),
    ]);

    const conNotas = new Set(evaluaciones.map((e) => e.idCompetencia));
    const nivelNuevo = new Map(
      nueva.map((a) => [a.idCompetencia, a.idCompetenciaNivel]),
    );
    const enActual = new Set(actual.map((a) => a.idCompetencia));
    const titulo = (a: { competencia: { titulo: string } }) =>
      a.competencia.titulo;

    return {
      campana: campana.nombre,
      quitadas: actual
        .filter((a) => !nivelNuevo.has(a.idCompetencia))
        .map((a) => ({
          titulo: titulo(a),
          conNotas: conNotas.has(a.idCompetencia),
        })),
      nuevas: nueva.filter((a) => !enActual.has(a.idCompetencia)).map(titulo),
      cambiaNivel: actual
        .filter(
          (a) =>
            nivelNuevo.has(a.idCompetencia) &&
            nivelNuevo.get(a.idCompetencia) !== a.idCompetenciaNivel,
        )
        .map((a) => ({
          titulo: titulo(a),
          conNotas: conNotas.has(a.idCompetencia),
        })),
    };
  }

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
          idUnidadOcupacionalEmpleadora: empleado.idUnidadOcupacionalEmpleadora,
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
            orderBy: { secuencial: 'asc' },
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
      modelo:
        campana?.modeloEmpresa ??
        empleado.empresaEmpleadora?.modeloEmpresa ??
        null,

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
    situacion,
  }: EmployeeQueryDto): Promise<Prisma.EmpleadoWhereInput> {
    // Cada condición compuesta va dentro de `AND` en vez de en la raíz: hay
    // tres que necesitan su propio `OR` y, puestas como claves sueltas del
    // objeto, la última pisaba a las anteriores.
    const condiciones: Prisma.EmpleadoWhereInput[] = [];

    const palabras = (texto: string) =>
      texto.trim().split(/\s+/).filter(Boolean);

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
              {
                apellidos: { contains: palabra, mode: 'insensitive' as const },
              },
            ],
          })),
        },
        select: { codigoEmpleado: true },
      });

      condiciones.push({
        OR: [
          // La caja acepta también el código escrito directo.
          {
            codigoEmpleadoJefe: { contains: jefe.trim(), mode: 'insensitive' },
          },
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

    // Situación: por defecto los activos (los únicos que operan). `TODAS`
    // es interno, para contar cuántos hay en cada una con los mismos filtros.
    const filtroSituacion: Prisma.EmpleadoWhereInput =
      situacion === 'TODAS'
        ? {}
        : !situacion || situacion === 'ACTIVO'
          ? { estado: true }
          : { situacion };

    return {
      ...filtroSituacion,

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

    if (sortBy === 'codigoUsuario')
      return { usuario: { codigoUsuario: direccion } };
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
  /**
   * `whereFijo` reemplaza los filtros del listado: lo usa el panel del jefe
   * (`avanceDeMiEquipo`), que ve solo a su equipo directo y no debe poder
   * ampliarlo con la URL.
   */
  async avance(query: AvanceQueryDto, whereFijo?: Prisma.EmpleadoWhereInput) {
    try {
      const where = whereFijo ?? (await this.construirWhereListado(query));
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
            select: {
              idEmpresaEmpleadora: true,
              nombre: true,
              modeloEmpresa: true,
            },
          })
        ).map((c) => [c.idEmpresaEmpleadora, c]),
      );

      const filas = (await this.conAgregados(empleados)).map((e) => {
        const c = e.avanceCompetencias;
        const o = e.avanceObjetivos;
        // 180° sin jefe (la cabeza de la empresa): sus competencias las
        // califican sus subordinados (`evaluadoSinJefe`), así que no hay
        // nada pendiente del jefe. Antes figuraba «Faltan 6» para siempre y
        // nunca llegaba a «Completo».
        const calificanSubordinados =
          !e.codigoEmpleadoJefe &&
          campanasEnCurso.get(e.idEmpresaEmpleadora)?.modeloEmpresa === '180';
        const jefeListo =
          calificanSubordinados || c.total === 0 || c.hechasJefe >= c.total;
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
          periodo: campanasEnCurso.get(e.idEmpresaEmpleadora)?.nombre ?? null,
          calificanSubordinados,
          gerencia: e.gerenciaEmpleadora?.descripcion ?? null,
          area: e.areaEmpleadora?.descripcion ?? null,
          unidad: e.unidadOcupacionalEmpleadora?.descripcion ?? null,
          puesto: e.puestoEmpleadora?.descripcion ?? null,
          idGerenciaEmpleadora: e.idGerenciaEmpleadora,
          idAreaEmpleadora: e.idAreaEmpleadora,
          idUnidadOcupacionalEmpleadora: e.idUnidadOcupacionalEmpleadora,
          idPuestoEmpleadora: e.idPuestoEmpleadora,
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
          (a, f) => {
            // Sin jefe en 180°: sus competencias no son tarea de ningún jefe
            // y no entran a lo que falta calificar.
            const total = f.calificanSubordinados ? 0 : f.competencias.total;
            return {
              compTotal: a.compTotal + total,
              compJefe: a.compJefe + Math.min(f.competencias.hechasJefe, total),
              compAuto: a.compAuto + Math.min(f.competencias.hechasAuto, total),
              objTotal: a.objTotal + f.objetivos.total,
              objHechas:
                a.objHechas + Math.min(f.objetivos.hechas, f.objetivos.total),
            };
          },
          { compTotal: 0, compJefe: 0, compAuto: 0, objTotal: 0, objHechas: 0 },
        );
        const porEstado = Object.fromEntries(
          ESTADOS_AVANCE.map((e) => [
            e,
            grupo.filter((f) => f.estadoAvance === e).length,
          ]),
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

      /**
       * Agrupa a los trabajadores por un nivel. `id` sirve al front para
       * filtrar al entrar en el grupo (los nombres se repiten entre
       * empresas); `padre` es el nivel de arriba más frecuente del grupo
       * (el área de una unidad, la gerencia de un área), como contexto.
       */
      const agrupar = (
        clave: (f: Fila) => string,
        id?: (f: Fila) => number | null,
        padre?: (f: Fila) => string | null,
      ) => {
        const grupos = new Map<string, Fila[]>();
        filas.forEach((f) => {
          const k = clave(f);
          grupos.set(k, [...(grupos.get(k) ?? []), f]);
        });
        const masFrecuente = (grupo: Fila[]) => {
          if (!padre) return null;
          const cuenta = new Map<string, number>();
          grupo.forEach((f) => {
            const p = padre(f);
            if (p) cuenta.set(p, (cuenta.get(p) ?? 0) + 1);
          });
          return [...cuenta].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        };
        return [...grupos]
          .map(([nombre, grupo]) => ({
            nombre,
            id: id ? id(grupo[0]) : null,
            padre: masFrecuente(grupo),
            ...resumir(grupo),
          }))
          .sort((a, b) => (a.cumplimiento ?? 101) - (b.cumplimiento ?? 101));
      };

      const estadoFiltro = ESTADOS_AVANCE.includes(
        query.estadoAvance as EstadoAvance,
      )
        ? query.estadoAvance
        : undefined;

      return {
        // Los indicadores van SIN el filtro de estado: filtrar por
        // "completos" y ver 100 % de cumplimiento no le dice nada a nadie.
        resumen: resumir(filas),
        porJefe: agrupar(
          (f) => f.jefe ?? 'Sin jefe asignado',
          undefined,
          (f) => f.area,
        ),
        porGerencia: agrupar(
          (f) => f.gerencia ?? 'Sin gerencia',
          (f) => f.idGerenciaEmpleadora,
        ),
        porArea: agrupar(
          (f) => f.area ?? 'Sin área',
          (f) => f.idAreaEmpleadora,
          (f) => f.gerencia,
        ),
        porUnidad: agrupar(
          (f) => f.unidad ?? 'Sin grupo ocupacional',
          (f) => f.idUnidadOcupacionalEmpleadora,
          (f) => f.area,
        ),
        porPuesto: agrupar(
          (f) => f.puesto ?? 'Sin puesto',
          (f) => f.idPuestoEmpleadora,
          (f) => f.unidad,
        ),
        trabajadores: estadoFiltro
          ? filas.filter((f) => f.estadoAvance === estadoFiltro)
          : filas,
      };
    } catch (error) {
      this.logger.error('Error al calcular el avance:', error);
      handlePrismaError(error, 'empleados');
    }
  }

  /**
   * Panel del jefe: el avance de su equipo directo (mismo cálculo que el
   * avance de RR. HH., así las cifras coinciden) y lo suyo pendiente
   * (autoevaluación; sus objetivos los califica su propio jefe).
   */
  async avanceDeMiEquipo(idUsuario: number) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario, estado: true },
      select: {
        idEmpleado: true,
        idEmpresaEmpleadora: true,
        codigoEmpleado: true,
        codigoEmpleadoJefe: true,
      },
    });
    if (!yo) {
      throw new NotFoundException(
        'Su cuenta no tiene un trabajador asociado. Comuníquese con RR. HH.',
      );
    }
    const equipo = await this.avance({} as AvanceQueryDto, {
      codigoEmpleadoJefe: yo.codigoEmpleado,
      idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
      estado: true,
    });
    const [propio] = await this.conAgregados([yo]);
    // El jefe no carga la empresa en el front: el plazo viaja aquí.
    const campana = await this.prisma.campanaEvaluacion.findFirst({
      where: {
        estado: CAMPANA_EN_CURSO,
        idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
      },
      select: {
        nombre: true,
        periodoDesde: true,
        periodoHasta: true,
        fechaVigenciaInicio: true,
        fechaVigenciaFin: true,
        modeloEmpresa: true,
      },
    });
    // En 180° también evalúa a su propio jefe: es tarea suya y el panel la
    // cuenta (antes no, y decía «terminado» con esa evaluación pendiente).
    // Una competencia cuenta cuando calificó todos sus comportamientos.
    let evaluarJefe: { total: number; hechas: number } | null = null;
    if (campana?.modeloEmpresa === '180' && yo.codigoEmpleadoJefe) {
      try {
        const j = await this.findJefeWithCompetenciasByUsuario(idUsuario);
        const lista = j?.competenciasAsignadas ?? [];
        evaluarJefe = {
          total: lista.length,
          hechas: lista.filter((c) => c.progresoEvaluacion?.completo).length,
        };
      } catch {
        evaluarJefe = null;
      }
    }
    return {
      campana,
      evaluarJefe,
      resumen: equipo?.resumen,
      trabajadores: equipo?.trabajadores ?? [],
      mio: {
        competencias: propio.avanceCompetencias,
        objetivos: propio.avanceObjetivos,
        tieneJefe: !!yo.codigoEmpleadoJefe,
      },
    };
  }

  /**
   * Resumen del trabajador: lo que le toca a él en la campaña en curso
   * (autoevaluación, evaluar a su jefe en 180°, evidencias de sus objetivos y
   * responder la retroalimentación) y cómo va lo que califica su jefe, **sin
   * notas** (se comunican en la retroalimentación). Mismos cálculos que el
   * avance de RR. HH. (`conAgregados`).
   */
  async avanceMio(idUsuario: number) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario, estado: true },
      select: {
        idEmpleado: true,
        idEmpresaEmpleadora: true,
        codigoEmpleado: true,
        codigoEmpleadoJefe: true,
      },
    });
    if (!yo) {
      throw new NotFoundException(
        'Su cuenta no tiene un trabajador asociado. Comuníquese con RR. HH.',
      );
    }
    const campana = await this.prisma.campanaEvaluacion.findFirst({
      where: {
        estado: CAMPANA_EN_CURSO,
        idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
      },
      select: {
        idCampanaEvaluacion: true,
        nombre: true,
        fechaVigenciaInicio: true,
        fechaVigenciaFin: true,
        modeloEmpresa: true,
      },
    });
    // El nombre del jefe también sin campaña: lo usa «Mi perfil».
    const jefe = yo.codigoEmpleadoJefe
      ? await this.prisma.empleado.findFirst({
          where: {
            codigoEmpleado: yo.codigoEmpleadoJefe,
            idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
          },
          select: { nombres: true, apellidos: true },
        })
      : null;
    const nombreJefe = jefe ? `${jefe.nombres} ${jefe.apellidos}` : null;
    if (!campana) return { campana: null, jefe: nombreJefe };
    const [[propio], detalles, sesion] = await Promise.all([
      this.conAgregados([yo]),
      this.prisma.objetivoDetalle.findMany({
        where: {
          estado: true,
          objetivo: {
            idEmpleado: yo.idEmpleado,
            idCampanaEvaluacion: campana.idCampanaEvaluacion,
            estado: true,
          },
        },
        select: { idObjetivoDetalle: true },
      }),
      this.prisma.sesionRetroalimentacion.findUnique({
        where: {
          idCampanaEvaluacion_idEmpleado: {
            idCampanaEvaluacion: campana.idCampanaEvaluacion,
            idEmpleado: yo.idEmpleado,
          },
        },
        select: { conformidad: true },
      }),
    ]);
    const conEvidencia = detalles.length
      ? (
          await this.prisma.evidencia.findMany({
            where: {
              estado: true,
              idObjetivoDetalle: {
                in: detalles.map((d) => d.idObjetivoDetalle),
              },
            },
            distinct: ['idObjetivoDetalle'],
            select: { idObjetivoDetalle: true },
          })
        ).length
      : 0;
    let evaluarJefe: { total: number; hechas: number } | null = null;
    if (campana.modeloEmpresa === '180' && yo.codigoEmpleadoJefe) {
      try {
        const j = await this.findJefeWithCompetenciasByUsuario(idUsuario);
        const lista = j?.competenciasAsignadas ?? [];
        evaluarJefe = {
          total: lista.length,
          hechas: lista.filter((x) => x.progresoEvaluacion?.completo).length,
        };
      } catch {
        evaluarJefe = null;
      }
    }
    const c = propio.avanceCompetencias;
    const o = propio.avanceObjetivos;
    return {
      campana: {
        nombre: campana.nombre,
        fechaVigenciaInicio: campana.fechaVigenciaInicio,
        fechaVigenciaFin: campana.fechaVigenciaFin,
      },
      jefe: nombreJefe,
      autoevaluacion: {
        total: c.total,
        hechas: Math.min(c.hechasAuto, c.total),
      },
      evaluarJefe,
      evidencias: { total: detalles.length, hechas: conEvidencia },
      // Lo que califica su jefe: solo cuántos, no la nota.
      porSuJefe: {
        competencias: {
          total: c.total,
          hechas: Math.min(c.hechasJefe, c.total),
        },
        objetivos: { total: o.total, hechas: Math.min(o.hechas, o.total) },
      },
      // null = su jefe todavía no registró la sesión.
      retroalimentacion: sesion?.conformidad ?? null,
    };
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
        // Los nombres de su estructura: sin ellos la pantalla cargaba las
        // cuatro listas completas solo para traducir ids.
        gerenciaEmpleadora: { select: { descripcion: true } },
        areaEmpleadora: { select: { descripcion: true } },
        unidadOcupacionalEmpleadora: { select: { descripcion: true } },
        puestoEmpleadora: { select: { descripcion: true } },
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

      const whereTodas = await this.construirWhereListado({
        ...query,
        situacion: 'TODAS',
      });

      const [total, data, porSituacion] = await Promise.all([
        this.prisma.empleado.count({ where }),
        this.prisma.empleado.findMany({
          where,
          skip,
          take: safeLimit,
          include,
          orderBy,
        }),
        // Cuántos hay en cada situación con los mismos filtros: las pestañas
        // del listado los muestran sin pedir tres veces la lista.
        this.prisma.empleado.groupBy({
          by: ['situacion'],
          where: whereTodas,
          _count: { _all: true },
        }),
      ]);

      const situaciones = Object.fromEntries(
        SITUACIONES.map((sit) => [
          sit,
          porSituacion.find((g) => g.situacion === sit)?._count._all ?? 0,
        ]),
      );

      return {
        data: await this.conAgregados(data),
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
          situaciones,
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
    body = normalizarTrabajador(body);
    const fechaMala = problemaFechaIngreso(body.fechaIngreso);
    if (fechaMala) throw new BadRequestException(fechaMala);
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        select: {
          idEmpleado: true,
          idUsuario: true,
          codigoEmpleado: true,
          idEmpresaEmpleadora: true,
          tipoDocumento: true,
          documento: true,
          usuario: { select: { rol: true, codigoUsuario: true } },
        },
      });

      if (!existEmpleado) throw new NotFoundException('Empleado no encontrado');

      // Quitarle el rol Jefe a quien tiene gente a cargo la dejaba sin
      // evaluador: primero se reasigna a su equipo.
      if (
        body.rol !== undefined &&
        body.rol !== 'JEFE' &&
        existEmpleado.usuario?.rol === 'JEFE'
      ) {
        const aCargo = await this.prisma.empleado.count({
          where: {
            codigoEmpleadoJefe: existEmpleado.codigoEmpleado,
            idEmpresaEmpleadora: existEmpleado.idEmpresaEmpleadora,
            situacion: { not: 'CESADO' },
          },
        });
        if (aCargo > 0)
          throw new BadRequestException(
            `Tiene ${aCargo === 1 ? '1 persona' : `${aCargo} personas`} a cargo: reasígne${aCargo === 1 ? 'la' : 'las'} a otro jefe antes de quitarle el rol Jefe.`,
          );
      }

      // Jefe: `undefined` = no se toca (PATCH parcial); "" o null = sin jefe.
      // Antes `?? null` dejaba sin jefe a cualquiera actualizado sin el campo.
      const codigoEmpleadoFinal =
        body.codigoEmpleado ?? existEmpleado.codigoEmpleado;
      let codigoEmpleadoJefe: string | null | undefined;
      if (body.codigoEmpleadoJefe !== undefined) {
        codigoEmpleadoJefe = body.codigoEmpleadoJefe?.trim() || null;
      }
      // Estructura y jefe: de la empresa final del trabajador, activos.
      // Solo se revisa lo que llega (el PATCH es parcial).
      const idEmpresaFinal = Number(
        body.idEmpresaEmpleadora ?? existEmpleado.idEmpresaEmpleadora,
      );
      const cambiaDocumento =
        body.documento !== undefined || body.tipoDocumento !== undefined;
      const problemas = [
        ...(cambiaDocumento
          ? await this.problemasDeDocumento(
              idEmpresaFinal,
              body.tipoDocumento ?? existEmpleado.tipoDocumento,
              body.documento ?? existEmpleado.documento,
              id,
            )
          : []),
        ...(await this.problemasDeRelaciones(idEmpresaFinal, {
          codigoEmpleado: codigoEmpleadoFinal,
          idGerenciaEmpleadora: body.idGerenciaEmpleadora,
          idAreaEmpleadora: body.idAreaEmpleadora,
          idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
          idPuestoEmpleadora: body.idPuestoEmpleadora,
          codigoEmpleadoJefe: codigoEmpleadoJefe ?? undefined,
        })),
      ];
      if (codigoEmpleadoJefe) {
        const ciclo = await this.formariaCiclo(
          idEmpresaFinal,
          existEmpleado.codigoEmpleado,
          codigoEmpleadoJefe,
        );
        if (ciclo) problemas.push(ciclo);
      }
      if (problemas.length) {
        throw new BadRequestException({
          message: problemas[0],
          errors: problemas,
        });
      }

      // Validación de unicidad: códigoUsuario
      // El ámbito de la cuenta sigue al rol y a la empresa finales.
      const rolFinal = body.rol ?? existEmpleado.usuario?.rol;
      const cuentaFinal = empresaDeCuenta(rolFinal, idEmpresaFinal);
      const usuarioFinal =
        body.codigoUsuario ?? existEmpleado.usuario?.codigoUsuario;
      if (usuarioFinal) {
        const existsUser = await this.prisma.usuario.findFirst({
          where: { codigoUsuario: usuarioFinal, idEmpresaCuenta: cuentaFinal },
          select: {
            idUsuario: true,
            rol: true,
            nombreCompleto: true,
            empleado: { select: { nombres: true, apellidos: true } },
          },
        });

        if (existsUser && existsUser.idUsuario !== existEmpleado.idUsuario) {
          throw new BadRequestException(
            mensajeUsuarioTomado(usuarioFinal, existsUser),
          );
        }
      }

      // Validación de unicidad: códigoEmpleado
      if (body.codigoEmpleado) {
        const existsEmp = await this.prisma.empleado.findFirst({
          where: {
            codigoEmpleado: body.codigoEmpleado,
            idEmpresaEmpleadora: idEmpresaFinal,
          },
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
        idEmpresaCuenta: cuentaFinal,
        fechaModificacion: new Date(),
        actualizadoPorId: user.idUsuario,
      };

      if (body.contrasena) {
        const debil = problemaContrasena(body.contrasena, [
          usuarioFinal,
          body.documento ?? existEmpleado.documento,
        ]);
        if (debil) throw new BadRequestException(debil);
        usuarioUpdateData.contrasena = await hash(body.contrasena, 10);
      }

      // --------- Actualizar Empleado ----------
      const empleadoUpdateData = {
        codigoEmpleado: body.codigoEmpleado,
        nombres: body.nombres,
        apellidos: body.apellidos,
        tipoDocumento: body.tipoDocumento,
        documento: body.documento?.toString().trim(),
        sede: body.sede,
        // PATCH parcial: si no llega, no se toca; "" o null la borran.
        ...(body.fechaIngreso !== undefined && {
          fechaIngreso: aFecha(body.fechaIngreso),
        }),
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
            where: {
              codigoEmpleadoJefe: existEmpleado.codigoEmpleado,
              idEmpresaEmpleadora: existEmpleado.idEmpresaEmpleadora,
            },
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
  /** Dar de baja a uno = cesarlo (mismo camino que la baja masiva). */
  async remove(user: AuthUser, id: number) {
    await this.cambiarSituacion(user, {
      ids: [id],
      situacion: 'CESADO',
      motivo: 'Dado de baja',
    });
    return { idEmpleado: id };
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
  /**
   * Dar de baja = cesar. Se conserva por compatibilidad con
   * `DELETE /empleado/masivo`; el camino completo es `cambiarSituacion`.
   */
  async removeMany(user: AuthUser, ids: number[]) {
    const r = await this.cambiarSituacion(user, {
      ids,
      situacion: 'CESADO',
      motivo: 'Dado de baja',
    });
    return { eliminados: r?.ids ?? [] };
  }

  /**
   * Suspender, cesar o reactivar a uno o varios trabajadores, todo o nada.
   *
   * - A SUSPENDIDO o CESADO (desde ACTIVO): no se deja a nadie sin jefe. Si
   *   alguien de la selección todavía es jefe de gente activa que no está en
   *   la selección, no se cambia a nadie. Se desactiva también su usuario.
   * - Entre SUSPENDIDO y CESADO: solo cambia la situación (ya no opera).
   * - A ACTIVO: su estructura y su jefe tienen que seguir vigentes; vuelve a
   *   entrar con su mismo usuario y conserva todo su historial.
   */
  async cambiarSituacion(
    user: AuthUser,
    dto: {
      ids: number[];
      situacion: Situacion;
      fecha?: string;
      motivo?: string;
    },
  ) {
    try {
      const unicos = [...new Set(dto.ids.map(Number))];
      const motivo = dto.motivo?.trim() || null;
      if (dto.situacion !== 'ACTIVO' && !motivo) {
        throw new BadRequestException(
          dto.situacion === 'SUSPENDIDO'
            ? 'Indique el motivo de la suspensión.'
            : 'Indique el motivo del cese.',
        );
      }

      const empleados = await this.prisma.empleado.findMany({
        where: { idEmpleado: { in: unicos } },
        select: {
          idEmpleado: true,
          idUsuario: true,
          codigoEmpleado: true,
          nombres: true,
          apellidos: true,
          situacion: true,
          idEmpresaEmpleadora: true,
          idGerenciaEmpleadora: true,
          idAreaEmpleadora: true,
          idUnidadOcupacionalEmpleadora: true,
          idPuestoEmpleadora: true,
          codigoEmpleadoJefe: true,
        },
      });
      if (empleados.length !== unicos.length) {
        const encontrados = new Set(empleados.map((e) => e.idEmpleado));
        throw new NotFoundException(
          `No se encontraron los trabajadores con ID ${unicos.filter((id) => !encontrados.has(id)).join(', ')}.`,
        );
      }

      const yaEstan = empleados.filter((e) => e.situacion === dto.situacion);
      if (yaEstan.length === empleados.length) {
        throw new BadRequestException(
          `${empleados.length === 1 ? 'Ya está' : 'Ya están'} en situación ${dto.situacion.toLowerCase()}.`,
        );
      }

      const nombre = (e: { nombres: string; apellidos: string }) =>
        `${e.nombres} ${e.apellidos}`;

      if (dto.situacion === 'ACTIVO') {
        // Reactivar: la estructura y el jefe que tenía tienen que seguir
        // vigentes en su empresa (pudieron darse de baja mientras tanto).
        const delConjunto = new Map(
          empleados.map((e) => [e.codigoEmpleado, e.idEmpresaEmpleadora]),
        );
        const problemas = (
          await Promise.all(
            empleados.map(async (e) =>
              (
                await this.problemasDeRelaciones(
                  e.idEmpresaEmpleadora,
                  e,
                  // El jefe puede volver en la misma operación: un jefe con
                  // su equipo se suspende junto y se reactiva junto.
                  delConjunto,
                )
              ).map((p) => `${nombre(e)}: ${p}`),
            ),
          )
        ).flat();
        if (problemas.length) {
          throw new BadRequestException({
            message: `No se reactivó a nadie: ${problemas[0]}`,
            errors: problemas,
          });
        }
      } else {
        // Dejar de operar: nadie activo puede quedar sin jefe.
        const activos = empleados.filter((e) => e.situacion === 'ACTIVO');
        const huerfanos = activos.length
          ? await this.prisma.empleado.findMany({
              where: {
                estado: true,
                idEmpleado: { notIn: unicos },
                codigoEmpleadoJefe: {
                  in: activos.map((e) => e.codigoEmpleado),
                },
              },
              select: { codigoEmpleadoJefe: true },
            })
          : [];
        if (huerfanos.length > 0) {
          const cuantos = new Map<string, number>();
          for (const h of huerfanos) {
            const codigo = h.codigoEmpleadoJefe ?? '';
            cuantos.set(codigo, (cuantos.get(codigo) ?? 0) + 1);
          }
          const detalle = activos
            .filter((e) => cuantos.has(e.codigoEmpleado))
            .map((e) => `${nombre(e)} (${cuantos.get(e.codigoEmpleado)})`)
            .join(', ');
          throw new ConflictException(
            unicos.length === 1
              ? `No se puede cambiar su situación: ${detalle} todavía tiene gente a cargo. Reasígnala a otro jefe primero.`
              : `No se cambió a nadie: ${detalle} todavía tiene gente a cargo fuera de la selección. Reasígnala a otro jefe o inclúyela en la selección.`,
          );
        }
      }

      const ahora = new Date();
      const fecha = dto.fecha ? new Date(dto.fecha) : ahora;
      const opera = dto.situacion === 'ACTIVO';
      const ids = empleados
        .filter((e) => e.situacion !== dto.situacion)
        .map((e) => e.idEmpleado);

      await this.prisma.$transaction([
        this.prisma.usuario.updateMany({
          where: {
            idUsuario: {
              in: empleados
                .filter((e) => ids.includes(e.idEmpleado))
                .map((e) => e.idUsuario),
            },
          },
          data: {
            estado: opera,
            fechaModificacion: ahora,
            actualizadoPorId: user.idUsuario,
          },
        }),
        this.prisma.empleado.updateMany({
          where: { idEmpleado: { in: ids } },
          data: {
            estado: opera,
            situacion: dto.situacion,
            fechaSituacion: fecha,
            motivoSituacion: motivo,
            fechaModificacion: ahora,
            actualizadoPorId: user.idUsuario,
          },
        }),
      ]);

      return { ids, situacion: dto.situacion };
    } catch (error) {
      this.logger.error(
        'Error al cambiar la situación de trabajadores:',
        error,
      );
      handlePrismaError(error, 'empleado');
    }
  }

  /** Plantilla de importación con listas desplegables (ver su archivo). */
  plantillaImportacion(idEmpresa: number) {
    return construirPlantillaTrabajadores(this.prisma, idEmpresa);
  }

  /**
   * Documento, código, nombre y situación de todos los trabajadores de la
   * empresa (también suspendidos y cesados: el documento no se repite en
   * ninguna situación). La revisión de la importación marca con esto «Ya
   * registrado» antes de enviar, con el mismo criterio que `createMany`.
   */
  registradosParaImportar(idEmpresa: number) {
    return this.prisma.empleado.findMany({
      where: { idEmpresaEmpleadora: idEmpresa },
      select: {
        tipoDocumento: true,
        documento: true,
        codigoEmpleado: true,
        nombres: true,
        apellidos: true,
        situacion: true,
      },
    });
  }

  async createMany(user: AuthUser, entrada: CreateEmpleadoDto[]) {
    const conAccesos = entrada.map((f) => conAcceso(normalizarTrabajador(f)));
    const data = conAccesos.map((c) => c.body);
    const BATCH_SIZE = 10;

    try {
      /* =====================================================
       * 1. Validaciones en memoria (archivo)
       * ===================================================== */
      // Usuario y código: repetidos en el archivo o ya registrados. Se
      // informan por fila ("[i] …", junto con el resto), no con el primero
      // que aparezca: el front marca cada fila con su problema.
      const usuarioEn = new Set<string>();
      const empleadoEn = new Set<string>();
      const repetidos = data.map((b) => {
        const p: string[] = [];
        // Las filas de ejemplo de la plantilla (apellidos que terminan en
        // «(Ejemplo)») no se crean. El front ya no las envía; si llegan, se
        // rechazan en su fila en vez de crear trabajadores ficticios.
        if (/\(\s*ejemplo\s*\)\s*$/i.test(b.apellidos ?? ''))
          p.push('Es una fila de ejemplo de la plantilla: no se importa.');
        // Usuario único dentro de su ámbito (empresa, o sistema si es ADMIN).
        const u = `${empresaDeCuenta(b.rol, b.idEmpresaEmpleadora) ?? 'sistema'}|${b.codigoUsuario}`;
        // El código es único por empresa: la clave lleva la empresa.
        const c = `${b.idEmpresaEmpleadora}|${b.codigoEmpleado}`;
        // El usuario es el documento: si se repite, ya lo dice «El documento
        // … se repite en el archivo» (más abajo). Solo se marca para no
        // repetirlo con otras palabras.
        usuarioEn.add(u);
        if (empleadoEn.has(c))
          p.push(
            `El código de empleado "${b.codigoEmpleado}" se repite en el archivo.`,
          );
        empleadoEn.add(c);
        return p;
      });

      const [usuariosExistentes, empleadosExistentes] = await Promise.all([
        this.prisma.usuario.findMany({
          where: {
            codigoUsuario: { in: data.map((b) => String(b.codigoUsuario)) },
          },
          select: {
            codigoUsuario: true,
            idEmpresaCuenta: true,
            rol: true,
            nombreCompleto: true,
            empleado: { select: { nombres: true, apellidos: true } },
          },
        }),
        this.prisma.empleado.findMany({
          where: {
            codigoEmpleado: {
              in: data.map((b) => String(b.codigoEmpleado)),
            },
            idEmpresaEmpleadora: {
              in: [...new Set(data.map((b) => Number(b.idEmpresaEmpleadora)))],
            },
          },
          select: { codigoEmpleado: true, idEmpresaEmpleadora: true },
        }),
      ]);
      const usuariosTomados = new Map(
        usuariosExistentes.map((u) => [
          `${u.idEmpresaCuenta ?? 'sistema'}|${u.codigoUsuario}`,
          u,
        ]),
      );
      const empleadosTomados = new Set(
        empleadosExistentes.map(
          (e) => `${e.idEmpresaEmpleadora}|${e.codigoEmpleado}`,
        ),
      );
      // El usuario tomado se informa aparte (`usuarioTomado`): solo hace
      // falta si el documento no explicó ya que la persona está registrada.
      const usuarioTomado = data.map((b) => {
        const duenio = usuariosTomados.get(
          `${empresaDeCuenta(b.rol, b.idEmpresaEmpleadora) ?? 'sistema'}|${b.codigoUsuario}`,
        );
        return duenio
          ? mensajeUsuarioTomado(String(b.codigoUsuario), duenio)
          : null;
      });
      const unicidad = data.map((b, i) => [
        ...repetidos[i],
        ...(empleadosTomados.has(`${b.idEmpresaEmpleadora}|${b.codigoEmpleado}`)
          ? [`El código de empleado "${b.codigoEmpleado}" ya está registrado.`]
          : []),
      ]);

      /* =====================================================
       * 2b. Estructura y jefe de cada fila (todas, juntas)
       * ===================================================== */
      const jefesDelLote = new Map(
        data.map((f) => [
          String(f.codigoEmpleado).trim(),
          Number(f.idEmpresaEmpleadora),
        ]),
      );
      // Jefes en círculo dentro del archivo (A jefe de B y B jefe de A):
      // se sube por los jefes que el mismo archivo declara.
      const jefeEnArchivo = new Map(
        data.map((f) => [
          String(f.codigoEmpleado ?? '').trim(),
          String(f.codigoEmpleadoJefe ?? '').trim(),
        ]),
      );
      // Un jefe que viene en el mismo archivo también tiene que tener rol JEFE.
      const rolEnArchivo = new Map(
        data.map((f) => [String(f.codigoEmpleado ?? '').trim(), f.rol]),
      );
      const jefeSinRolEnArchivo = (i: number): string[] => {
        const jefe = String(data[i].codigoEmpleadoJefe ?? '').trim();
        const rol = rolEnArchivo.get(jefe);
        return jefe && rol && rol !== 'JEFE'
          ? [
              `Su jefe ${jefe} viene en el archivo con rol ${rol}: para tener personas a cargo debe ser JEFE.`,
            ]
          : [];
      };
      const cicloEnArchivo = (i: number): string[] => {
        const codigo = String(data[i].codigoEmpleado ?? '').trim();
        const vistos = new Set<string>();
        let actual = jefeEnArchivo.get(codigo);
        // Ser su propio jefe ya lo informa `problemasDeRelaciones`.
        if (actual === codigo) return [];
        while (actual && !vistos.has(actual)) {
          if (actual === codigo)
            return [
              `${codigo}: los jefes del archivo forman un círculo (nadie puede depender de su propio subordinado).`,
            ];
          vistos.add(actual);
          actual = jefeEnArchivo.get(actual);
        }
        return [];
      };
      // Mismo documento dos veces en el archivo (por empresa y tipo).
      const vistos = new Map<string, number>();
      const repetidosEnArchivo = data.map((f, i) => {
        const clave = `${f.idEmpresaEmpleadora}|${f.tipoDocumento ?? 'DNI'}|${String(f.documento ?? '').trim()}`;
        const primera = vistos.get(clave);
        if (primera === undefined) {
          vistos.set(clave, i);
          return [] as string[];
        }
        return [
          `El documento ${String(f.documento).trim()} se repite en el archivo (también en la fila ${primera + 2}).`,
        ];
      });
      const porFila = await Promise.all(
        data.map(async (f, i) => {
          const delDocumento = [
            ...repetidosEnArchivo[i],
            ...(await this.problemasDeDocumento(
              Number(f.idEmpresaEmpleadora),
              f.tipoDocumento,
              f.documento,
              undefined,
              true,
            )),
          ];
          return [
            ...unicidad[i],
            ...delDocumento,
            ...(!delDocumento.length && usuarioTomado[i]
              ? [usuarioTomado[i]]
              : []),
            ...(!conAccesos[i].acceso.generada &&
            problemaContrasena(f.contrasena, [f.codigoUsuario, f.documento])
              ? [
                  problemaContrasena(f.contrasena, [
                    f.codigoUsuario,
                    f.documento,
                  ])!,
                ]
              : []),
            ...(problemaFechaIngreso(f.fechaIngreso)
              ? [problemaFechaIngreso(f.fechaIngreso)!]
              : []),
            ...(await this.problemasDeRelaciones(
              Number(f.idEmpresaEmpleadora),
              f,
              jefesDelLote,
            )),
            ...cicloEnArchivo(i),
            ...jefeSinRolEnArchivo(i),
          ];
        }),
      );
      // "[i] …" como los mensajes de ParseArrayPipe: el front lo traduce a la
      // fila del Excel.
      const problemasLote = porFila.flatMap((ps, i) =>
        ps.map((p) => `[${i}] ${p}`),
      );
      if (problemasLote.length) {
        throw new BadRequestException({
          message: `No se importó nada: hay ${problemasLote.length} problema(s) en el archivo.`,
          errors: problemasLote,
        });
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
                idEmpresaCuenta: empresaDeCuenta(
                  body.rol,
                  body.idEmpresaEmpleadora,
                ),
                creadoPorId: user.idUsuario,
              },
            });

            const empleado = await tx.empleado.create({
              data: {
                codigoEmpleado: body.codigoEmpleado,
                nombres: body.nombres,
                apellidos: body.apellidos,
                tipoDocumento: body.tipoDocumento ?? 'DNI',
                documento: String(body.documento).trim(),
                sede: body.sede,
                fechaIngreso: aFecha(body.fechaIngreso),
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
        // Una sola vez: con esto se arma el Excel de accesos para entregar.
        accesos: data.map((f, i) => ({
          codigoEmpleado: f.codigoEmpleado,
          nombre: `${f.nombres} ${f.apellidos}`.trim(),
          usuario: conAccesos[i].acceso.usuario,
          contrasena: conAccesos[i].acceso.generada
            ? conAccesos[i].acceso.contrasena
            : null,
        })),
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
          idEmpresaEmpleadora: true,
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
          idEmpresaEmpleadora: empleado.idEmpresaEmpleadora,
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
          idEmpresaEmpleadora: true,
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
          idEmpresaEmpleadora: empleado.idEmpresaEmpleadora,
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
          idEmpresaEmpleadora: true,
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
          idEmpresaEmpleadora: jefe.idEmpresaEmpleadora,
          estado: true,
        },
        include: {
          unidadOcupacionalEmpleadora: true,
          puestoEmpleadora: { select: { descripcion: true } },
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      // Evidencias de competencias de cada uno en la campaña en curso (la
      // tabla del jefe muestra cuántas tiene antes de calificar).
      const campana = await campanaEnCurso(
        this.prisma,
        jefe.idEmpresaEmpleadora,
      );
      const evidencias = campana
        ? await this.prisma.evidencia.groupBy({
            by: ['idEmpleado'],
            where: {
              idEmpleado: { in: subordinados.map((s) => s.idEmpleado) },
              idCampanaEvaluacion: campana.idCampanaEvaluacion,
              // Solo las de competencias: las de objetivos van en su lista.
              idEvaluacionCompetencia: { not: null },
              estado: true,
            },
            _count: { _all: true },
          })
        : [];
      const evidenciasDe = new Map(
        evidencias.map((e) => [e.idEmpleado, e._count._all]),
      );

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

        // Su autoevaluación (el mismo conteo, con él como evaluador): el
        // jefe ve si ya la hizo antes de calificarlo.
        const auto = await this.calcularProgresoCompetencias(
          sub.idEmpleado,
          sub.idEmpleado,
          competencias,
        );

        results.push({
          subordinado: sub,
          competenciasAsignadas: progreso.competenciasAsignadas,
          progresoEvaluacion: progreso.progresoEvaluacion,
          progresoAutoevaluacion: auto.progresoEvaluacion,
          evidencias: evidenciasDe.get(sub.idEmpleado) ?? 0,
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
      // Desde el espacio de una empresa «Empresa» repetiría el mismo nombre
      // en cada fila: solo va si el archivo mezcla empresas.
      const variasEmpresas =
        !query.idEmpresaEmpleadora &&
        new Set(empleados.map((e) => e.idEmpresaEmpleadora)).size > 1;
      const columnasEmpresa = variasEmpresas
        ? [
            { header: 'Empresa', key: 'empresa', width: 28 },
            { header: 'ID empresa', key: 'idEmpresaEmpleadora' },
          ]
        : [];
      return await construirLibroExcel([
        {
          nombre: 'Trabajadores',
          columnas: [
            { header: 'ID', key: 'idEmpleado', width: 8 },
            {
              header: 'Código de empleado',
              key: 'codigoEmpleado',
              tipo: 'texto',
            },
            { header: 'Nombres', key: 'nombres', width: 24 },
            { header: 'Apellidos', key: 'apellidos', width: 24 },
            // Para volver a importar el archivo: la importación lo pide.
            {
              header: 'Tipo de documento',
              key: 'tipoDocumento',
              breve: 'DNI, CE o PASAPORTE',
            },
            {
              header: 'Documento',
              key: 'documento',
              tipo: 'texto',
              breve: '8 dígitos si es DNI',
            },
            { header: 'Usuario', key: 'codigoUsuario', tipo: 'texto' },
            { header: 'Rol', key: 'rol', breve: 'EMPLEADO o JEFE' },
            ...columnasEmpresa,
            { header: 'Gerencia', key: 'gerencia', width: 24 },
            { header: 'ID gerencia', key: 'idGerenciaEmpleadora' },
            { header: 'Área', key: 'area', width: 24 },
            { header: 'ID área', key: 'idAreaEmpleadora' },
            { header: 'Grupo ocupacional', key: 'unidad', width: 26 },
            {
              header: 'ID grupo ocupacional',
              key: 'idUnidadOcupacionalEmpleadora',
            },
            { header: 'Puesto', key: 'puesto', width: 24 },
            { header: 'ID puesto', key: 'idPuestoEmpleadora' },
            { header: 'Jefe', key: 'jefe', width: 28 },
            {
              header: 'Código del jefe',
              key: 'codigoEmpleadoJefe',
              tipo: 'texto',
            },
            { header: 'Sede', key: 'sede', width: 18 },
            // dd/mm/aaaa como texto: la importación lo vuelve a leer igual.
            {
              header: 'Fecha de ingreso',
              key: 'fechaIngreso',
              tipo: 'texto',
              breve: 'dd/mm/aaaa',
            },
            { header: 'Antigüedad', key: 'antiguedad' },
            // Cuatro números en vez de un "1/2" de texto: así se pueden sumar
            // y cruzar en una tabla dinámica, que es para lo que se exporta.
            {
              header: 'Competencias evaluadas por el jefe',
              key: 'competenciasJefe',
            },
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
            tipoDocumento: item.tipoDocumento,
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
            jefe: item.jefe
              ? `${item.jefe.nombres} ${item.jefe.apellidos}`
              : '',
            codigoEmpleadoJefe: item.codigoEmpleadoJefe,
            sede: item.sede,
            fechaIngreso: item.fechaIngreso
              ? item.fechaIngreso
                  .toISOString()
                  .slice(0, 10)
                  .split('-')
                  .reverse()
                  .join('/')
              : '',
            antiguedad: textoAntiguedad(item.fechaIngreso),
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
