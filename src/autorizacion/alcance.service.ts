import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Rol } from 'src/empleado/types/empleadoTypes';

/** Administra (TeamWork o RR. HH.): ve cualquier par de su(s) empresa(s). */
const esAdministrador = (a: { rol: Rol }) =>
  a.rol === Rol.ADMIN || a.rol === Rol.EQUIPO || a.rol === Rol.ADMIN_EMPRESA;
import {
  Alcance,
  empresasDelAlcance,
  noEncontrado,
  verificarEmpresa,
} from './alcance';

/** Entidades cuya empresa se puede comprobar por id. */
export type EntidadConEmpresa =
  | 'empresa'
  | 'area'
  | 'gerencia'
  | 'puesto'
  | 'unidad'
  | 'competencia'
  | 'empleado'
  | 'campana'
  | 'objetivo'
  | 'objetivoDetalle'
  | 'evaluacionCompetencia'
  | 'retroalimentacion';

const NOMBRES: Record<EntidadConEmpresa, string> = {
  empresa: 'Empresa',
  area: 'Área',
  gerencia: 'Gerencia',
  puesto: 'Puesto',
  unidad: 'Grupo ocupacional',
  competencia: 'Competencia',
  empleado: 'Empleado',
  campana: 'Campaña',
  objetivo: 'Objetivo',
  objetivoDetalle: 'Detalle de objetivo',
  evaluacionCompetencia: 'Evaluación',
  retroalimentacion: 'Retroalimentación',
};

@Injectable()
export class AlcanceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Calcula el alcance del usuario del token, siempre desde la base. */
  async de(user: AuthUser): Promise<Alcance> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: Number(user.idUsuario) },
      select: {
        rol: true,
        estado: true,
        soloLectura: true,
        idEmpresaEmpleadora: true,
        // Empresa archivada: su gente queda fuera aunque el token siga vigente.
        empresaEmpleadora: { select: { estado: true } },
        todasLasEmpresas: true,
        empresasAsignadas: { select: { idEmpresaEmpleadora: true } },
        empleado: {
          select: {
            idEmpleado: true,
            codigoEmpleado: true,
            idEmpresaEmpleadora: true,
            estado: true,
            empresaEmpleadora: { select: { estado: true } },
          },
        },
      },
    });

    // Un usuario dado de baja no entra aunque su token siga vigente; y el
    // rol se lee de la base, no del token (pudo cambiar desde que se emitió).
    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Sesión no válida');
    }

    const empresaArchivada =
      usuario.empresaEmpleadora?.estado === false ||
      usuario.empleado?.empresaEmpleadora?.estado === false;
    if (
      empresaArchivada &&
      usuario.rol !== Rol.ADMIN &&
      usuario.rol !== Rol.EQUIPO
    ) {
      throw new UnauthorizedException('Sesión no válida');
    }

    const rol = usuario.rol as Rol;
    const base = {
      idUsuario: Number(user.idUsuario),
      rol,
      // Solo las cuentas de gestión tienen niveles; el dueño, jefes y
      // empleados no.
      soloLectura:
        (rol === Rol.EQUIPO || rol === Rol.ADMIN_EMPRESA) &&
        usuario.soloLectura,
    };

    if (rol === Rol.ADMIN) {
      return { ...base, todasLasEmpresas: true, idEmpresa: null };
    }

    // Equipo de TeamWork: todas las empresas o solo las asignadas.
    if (rol === Rol.EQUIPO) {
      if (usuario.todasLasEmpresas) {
        return { ...base, todasLasEmpresas: true, idEmpresa: null };
      }
      return {
        ...base,
        todasLasEmpresas: false,
        idEmpresa: null,
        empresasPermitidas: usuario.empresasAsignadas.map(
          (a) => a.idEmpresaEmpleadora,
        ),
      };
    }

    if (rol === Rol.ADMIN_EMPRESA) {
      return {
        ...base,
        todasLasEmpresas: false,
        idEmpresa: usuario.idEmpresaEmpleadora ?? null,
      };
    }

    // Jefe o empleado cuyo trabajador está dado de baja: fuera, aunque el
    // token siga vigente (igual que un usuario desactivado).
    if (usuario.empleado && !usuario.empleado.estado) {
      throw new UnauthorizedException('Sesión no válida');
    }
    const empleado = usuario.empleado ?? null;
    return {
      ...base,
      todasLasEmpresas: false,
      idEmpresa: empleado?.idEmpresaEmpleadora ?? null,
      idEmpleado: empleado?.idEmpleado,
      codigoEmpleado: empleado?.codigoEmpleado,
    };
  }

  /** La empresa de un registro, o `null` si no existe. */
  async empresaDe(
    entidad: EntidadConEmpresa,
    id: number,
  ): Promise<number | null> {
    const p = this.prisma;
    const n = Number(id);
    if (!Number.isInteger(n)) return null;
    switch (entidad) {
      case 'empresa':
        return n;
      case 'area':
        return (
          (
            await p.areaEmpleadora.findUnique({
              where: { idAreaEmpleadora: n },
              select: { idEmpresaEmpleadora: true },
            })
          )?.idEmpresaEmpleadora ?? null
        );
      case 'gerencia':
        return (
          (
            await p.gerenciaEmpleadora.findUnique({
              where: { idGerenciaEmpleadora: n },
              select: { idEmpresaEmpleadora: true },
            })
          )?.idEmpresaEmpleadora ?? null
        );
      case 'puesto':
        return (
          (
            await p.puestoEmpleadora.findUnique({
              where: { idPuestoEmpleadora: n },
              select: { idEmpresaEmpleadora: true },
            })
          )?.idEmpresaEmpleadora ?? null
        );
      case 'unidad':
        return (
          (
            await p.unidadOcupacionalEmpleadora.findUnique({
              where: { idUnidadOcupacionalEmpleadora: n },
              select: { idEmpresaEmpleadora: true },
            })
          )?.idEmpresaEmpleadora ?? null
        );
      case 'competencia':
        return (
          (
            await p.competencia.findUnique({
              where: { idCompetencia: n },
              select: { idEmpresaEmpleadora: true },
            })
          )?.idEmpresaEmpleadora ?? null
        );
      case 'empleado':
        return (
          (
            await p.empleado.findUnique({
              where: { idEmpleado: n },
              select: { idEmpresaEmpleadora: true },
            })
          )?.idEmpresaEmpleadora ?? null
        );
      case 'campana':
        return (
          (
            await p.campanaEvaluacion.findUnique({
              where: { idCampanaEvaluacion: n },
              select: { idEmpresaEmpleadora: true },
            })
          )?.idEmpresaEmpleadora ?? null
        );
      case 'objetivo':
        return (
          (
            await p.objetivo.findUnique({
              where: { idObjetivo: n },
              select: { empleado: { select: { idEmpresaEmpleadora: true } } },
            })
          )?.empleado?.idEmpresaEmpleadora ?? null
        );
      case 'objetivoDetalle':
        return (
          (
            await p.objetivoDetalle.findUnique({
              where: { idObjetivoDetalle: n },
              select: {
                objetivo: {
                  select: {
                    empleado: { select: { idEmpresaEmpleadora: true } },
                  },
                },
              },
            })
          )?.objetivo?.empleado?.idEmpresaEmpleadora ?? null
        );
      case 'evaluacionCompetencia':
        return (
          (
            await p.evaluacionCompetencia.findUnique({
              where: { idEvaluacionCompetencia: n },
              select: { evaluado: { select: { idEmpresaEmpleadora: true } } },
            })
          )?.evaluado?.idEmpresaEmpleadora ?? null
        );
      case 'retroalimentacion':
        return (
          (
            await p.retroalimentacionDetalle.findUnique({
              where: { idRetroalimentacionDetalle: n },
              select: {
                objetivo: {
                  select: {
                    empleado: { select: { idEmpresaEmpleadora: true } },
                  },
                },
              },
            })
          )?.objetivo?.empleado?.idEmpresaEmpleadora ?? null
        );
    }
  }

  /**
   * Comprueba que el registro exista y sea de una empresa al alcance. Para el
   * superadministrador solo comprueba que exista.
   */
  async verificar(
    alcance: Alcance,
    entidad: EntidadConEmpresa,
    id: number,
  ): Promise<void> {
    const idEmpresa = await this.empresaDe(entidad, id);
    if (idEmpresa === null) {
      throw new NotFoundException(noEncontrado(NOMBRES[entidad]));
    }
    verificarEmpresa(alcance, idEmpresa, NOMBRES[entidad]);
  }

  /** Varios ids de la misma entidad (cargas y borrados masivos). */
  async verificarVarios(
    alcance: Alcance,
    entidad: EntidadConEmpresa,
    ids: number[],
  ): Promise<void> {
    if (alcance.todasLasEmpresas) return;
    for (const id of ids) await this.verificar(alcance, entidad, id);
  }

  /**
   * Datos de un usuario (rutas `by-user/:id`): jefe y empleado, solo los
   * suyos; el administrador de empresa, los de su empresa; el superadmin, todos.
   */
  async verificarUsuario(alcance: Alcance, idUsuario: number): Promise<void> {
    if (alcance.todasLasEmpresas) return;
    if (alcance.rol === Rol.ADMIN_EMPRESA || alcance.rol === Rol.EQUIPO) {
      const u = await this.prisma.usuario.findUnique({
        where: { idUsuario: Number(idUsuario) },
        select: {
          idEmpresaEmpleadora: true,
          empleado: { select: { idEmpresaEmpleadora: true } },
        },
      });
      verificarEmpresa(
        alcance,
        u?.empleado?.idEmpresaEmpleadora ?? u?.idEmpresaEmpleadora,
        'Usuario',
      );
      return;
    }
    if (Number(idUsuario) !== alcance.idUsuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  /**
   * Un trabajador concreto: el empleado, solo él; el jefe, él y sus
   * subordinados directos; los administradores, cualquiera a su alcance.
   */
  async verificarTrabajador(
    alcance: Alcance,
    idEmpleado: number,
  ): Promise<void> {
    const id = Number(idEmpleado);
    if (esAdministrador(alcance)) {
      await this.verificar(alcance, 'empleado', id);
      return;
    }
    if (alcance.idEmpleado === id) return;
    if (alcance.rol === Rol.JEFE && alcance.codigoEmpleado) {
      const sub = await this.prisma.empleado.findFirst({
        where: {
          idEmpleado: id,
          codigoEmpleadoJefe: alcance.codigoEmpleado,
          // El código es único por empresa: sus subordinados, de la suya.
          ...(alcance.idEmpresa && { idEmpresaEmpleadora: alcance.idEmpresa }),
          estado: true,
        },
        select: { idEmpleado: true },
      });
      if (sub) return;
    }
    throw new NotFoundException('Empleado no encontrado');
  }

  /**
   * El rol que se le puede dar a un trabajador. Desde Trabajadores solo se
   * asignan JEFE y EMPLEADO; ADMIN (TeamWork) solo lo da el superadmin, y
   * ADMIN_EMPRESA nunca: los administradores de empresa se gestionan aparte.
   * Sin esto, RR. HH. podía crearse un usuario ADMIN y ver todas las empresas.
   */
  verificarRolAsignable(alcance: Alcance, rol?: string | null): void {
    if (rol === undefined || rol === null) return;
    if (rol === Rol.JEFE || rol === Rol.EMPLEADO) return;
    if (rol === Rol.ADMIN && alcance.rol === Rol.ADMIN) return;
    // EQUIPO y ADMIN_EMPRESA no se dan desde Trabajadores: tienen su pantalla.
    throw new ForbiddenException(`No tiene permiso para asignar el rol ${rol}`);
  }

  /**
   * Quién puede iniciar una evaluación: para jefe y empleado, el evaluador
   * tiene que ser él mismo, y el evaluado él (autoevaluación), un subordinado
   * directo (el jefe evalúa) o su propio jefe (evaluación al jefe, 180°). Los
   * administradores, cualquier par de su empresa.
   */
  async verificarParEvaluacion(
    alcance: Alcance,
    idEvaluado: number,
    idEvaluador: number,
  ): Promise<void> {
    if (esAdministrador(alcance)) {
      await this.verificar(alcance, 'empleado', idEvaluado);
      await this.verificar(alcance, 'empleado', idEvaluador);
      return;
    }
    if (Number(idEvaluador) !== alcance.idEmpleado) {
      throw new ForbiddenException('Solo puede evaluar en nombre propio');
    }
    if (Number(idEvaluado) === alcance.idEmpleado) return;

    const [evaluado, yo] = await Promise.all([
      this.prisma.empleado.findUnique({
        where: { idEmpleado: Number(idEvaluado) },
        select: {
          codigoEmpleado: true,
          codigoEmpleadoJefe: true,
          estado: true,
        },
      }),
      this.prisma.empleado.findUnique({
        where: { idEmpleado: alcance.idEmpleado },
        select: { codigoEmpleadoJefe: true },
      }),
    ]);
    const esSubordinado =
      !!evaluado?.estado &&
      evaluado.codigoEmpleadoJefe === alcance.codigoEmpleado;
    const esMiJefe =
      !!evaluado?.estado &&
      !!yo?.codigoEmpleadoJefe &&
      evaluado.codigoEmpleado === yo.codigoEmpleadoJefe;
    if (!esSubordinado && !esMiJefe) {
      throw new NotFoundException('Empleado no encontrado');
    }
  }

  /**
   * Una evaluación ya creada: jefe y empleado, solo si son su evaluador (o,
   * para leerla, su evaluado); los administradores, si es de su empresa.
   */
  async verificarEvaluacion(
    alcance: Alcance,
    idEvaluacion: number,
    { soloEvaluador }: { soloEvaluador: boolean },
  ): Promise<void> {
    if (esAdministrador(alcance)) {
      await this.verificar(alcance, 'evaluacionCompetencia', idEvaluacion);
      return;
    }
    const ev = await this.prisma.evaluacionCompetencia.findUnique({
      where: { idEvaluacionCompetencia: Number(idEvaluacion) },
      select: { idEvaluador: true, idEvaluado: true },
    });
    const yo = alcance.idEmpleado;
    const permitido =
      !!ev &&
      yo !== undefined &&
      (ev.idEvaluador === yo || (!soloEvaluador && ev.idEvaluado === yo));
    if (!permitido) throw new NotFoundException('Evaluación no encontrada');
  }

  /**
   * Objetivos de un trabajador: el jefe solo los de sus subordinados directos
   * (los suyos los define y califica su propio jefe); los administradores, los
   * de cualquiera de su empresa.
   */
  async verificarDueñoDeObjetivos(
    alcance: Alcance,
    idEmpleado: number,
  ): Promise<void> {
    if (esAdministrador(alcance)) {
      await this.verificar(alcance, 'empleado', idEmpleado);
      return;
    }
    if (alcance.rol === Rol.JEFE && alcance.codigoEmpleado) {
      const sub = await this.prisma.empleado.findFirst({
        where: {
          idEmpleado: Number(idEmpleado),
          codigoEmpleadoJefe: alcance.codigoEmpleado,
          // El código es único por empresa: sus subordinados, de la suya.
          ...(alcance.idEmpresa && { idEmpresaEmpleadora: alcance.idEmpresa }),
          estado: true,
        },
        select: { idEmpleado: true },
      });
      if (sub) return;
    }
    throw new NotFoundException('Empleado no encontrado');
  }

  /**
   * Jefes y empleados solo califican dentro del periodo de la campaña en
   * curso (`fechaVigenciaInicio/Fin`) y el jefe solo define objetivos dentro
   * de su plazo de fijación (`…Objetivo`, si la campaña lo tiene). Antes lo
   * controlaba solo la pantalla (`EvaluationGuard`): con un token válido se
   * calificaba fuera de plazo. Los administradores quedan fuera de la regla
   * (corrigen datos). Se compara **por día en hora de Lima**, con los dos
   * extremos incluidos: las fechas se guardan a medianoche UTC, y comparadas
   * con la hora el último día se cerraba a las 7 p. m. del anterior.
   */
  async verificarVigencia(
    alcance: Alcance,
    tipo: 'evaluacion' | 'objetivos',
  ): Promise<void> {
    if (esAdministrador(alcance) || !alcance.idEmpresa) return;
    const campana = await this.prisma.campanaEvaluacion.findFirst({
      where: { idEmpresaEmpleadora: alcance.idEmpresa, estado: 'EN_CURSO' },
      select: {
        fechaVigenciaInicio: true,
        fechaVigenciaFin: true,
        fechaVigenciaInicioObjetivo: true,
        fechaVigenciaFinObjetivo: true,
      },
    });
    if (!campana) {
      throw new ForbiddenException(
        'No hay una campaña de evaluación en curso.',
      );
    }
    const [inicio, fin] =
      tipo === 'evaluacion'
        ? [campana.fechaVigenciaInicio, campana.fechaVigenciaFin]
        : [
            campana.fechaVigenciaInicioObjetivo,
            campana.fechaVigenciaFinObjetivo,
          ];
    // Sin plazo de fijación de objetivos no hay nada que comprobar.
    if (!inicio || !fin) return;
    const dia = (d: Date) => d.toISOString().slice(0, 10);
    const hoyLima = dia(new Date(Date.now() - 5 * 60 * 60 * 1000));
    const formato = (d: Date) => dia(d).split('-').reverse().join('/');
    if (hoyLima < dia(inicio) || hoyLima > dia(fin)) {
      throw new ForbiddenException(
        tipo === 'evaluacion'
          ? `Fuera del periodo de evaluación (del ${formato(inicio)} al ${formato(fin)}).`
          : `Fuera del plazo para definir objetivos (del ${formato(inicio)} al ${formato(fin)}).`,
      );
    }
  }

  /** Un objetivo ya creado, con la misma regla que `verificarDueñoDeObjetivos`. */
  async verificarObjetivo(alcance: Alcance, idObjetivo: number): Promise<void> {
    const objetivo = await this.prisma.objetivo.findUnique({
      where: { idObjetivo: Number(idObjetivo) },
      select: { idEmpleado: true },
    });
    if (!objetivo) throw new NotFoundException('Objetivo no encontrado');
    await this.verificarDueñoDeObjetivos(alcance, objetivo.idEmpleado);
  }

  /** Cargas masivas que identifican al trabajador por su código. */
  async verificarCodigos(
    alcance: Alcance,
    codigos: string[],
    idEmpresa?: number,
  ): Promise<void> {
    const unicos = [...new Set(codigos.filter(Boolean))];
    // Con empresa indicada, los códigos tienen que ser de esa empresa (el
    // código es único por empresa, no en todo el sistema).
    if (alcance.todasLasEmpresas && !idEmpresa) return;
    const empresas = idEmpresa
      ? [idEmpresa]
      : (empresasDelAlcance(alcance) ?? []);
    const encontrados = await this.prisma.empleado.findMany({
      where: {
        codigoEmpleado: { in: unicos },
        idEmpresaEmpleadora: { in: empresas },
      },
      select: { codigoEmpleado: true },
    });
    const propios = new Set(encontrados.map((e) => e.codigoEmpleado));
    const ajenos = unicos.filter((c) => !propios.has(c));
    if (ajenos.length) {
      throw new NotFoundException(
        `Trabajadores no encontrados en su empresa: ${ajenos.join(', ')}`,
      );
    }
  }

  /** El objetivo al que pertenece una retroalimentación (404 si no existe). */
  async objetivoDeRetroalimentacion(
    idRetroalimentacion: number,
  ): Promise<number> {
    const r = await this.prisma.retroalimentacionDetalle.findUnique({
      where: { idRetroalimentacionDetalle: Number(idRetroalimentacion) },
      select: { idObjetivo: true },
    });
    if (!r) throw new NotFoundException('Retroalimentación no encontrada');
    return r.idObjetivo;
  }
}
