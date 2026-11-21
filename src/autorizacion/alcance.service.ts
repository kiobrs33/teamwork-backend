import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { Alcance, verificarEmpresa } from './alcance';

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
  unidad: 'Unidad ocupacional',
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
        idEmpresaEmpleadora: true,
        empleado: {
          select: {
            idEmpleado: true,
            codigoEmpleado: true,
            idEmpresaEmpleadora: true,
            estado: true,
          },
        },
      },
    });

    // Un usuario dado de baja no entra aunque su token siga vigente; y el
    // rol se lee de la base, no del token (pudo cambiar desde que se emitió).
    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Sesión no válida');
    }

    const rol = usuario.rol as Rol;
    const base = { idUsuario: Number(user.idUsuario), rol };

    if (rol === Rol.ADMIN) {
      return { ...base, todasLasEmpresas: true, idEmpresa: null };
    }

    if (rol === Rol.ADMIN_EMPRESA) {
      return {
        ...base,
        todasLasEmpresas: false,
        idEmpresa: usuario.idEmpresaEmpleadora ?? null,
      };
    }

    const empleado = usuario.empleado?.estado ? usuario.empleado : null;
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
      throw new NotFoundException(`${NOMBRES[entidad]} no encontrado`);
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
    if (alcance.rol === Rol.ADMIN_EMPRESA) {
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
    if (alcance.rol === Rol.ADMIN || alcance.rol === Rol.ADMIN_EMPRESA) {
      await this.verificar(alcance, 'empleado', id);
      return;
    }
    if (alcance.idEmpleado === id) return;
    if (alcance.rol === Rol.JEFE && alcance.codigoEmpleado) {
      const sub = await this.prisma.empleado.findFirst({
        where: {
          idEmpleado: id,
          codigoEmpleadoJefe: alcance.codigoEmpleado,
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
    throw new ForbiddenException(`No puedes asignar el rol ${rol}`);
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
    if (alcance.rol === Rol.ADMIN || alcance.rol === Rol.ADMIN_EMPRESA) {
      await this.verificar(alcance, 'empleado', idEvaluado);
      await this.verificar(alcance, 'empleado', idEvaluador);
      return;
    }
    if (Number(idEvaluador) !== alcance.idEmpleado) {
      throw new ForbiddenException('Solo puedes evaluar como tú mismo');
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
    if (alcance.rol === Rol.ADMIN || alcance.rol === Rol.ADMIN_EMPRESA) {
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
    if (alcance.rol === Rol.ADMIN || alcance.rol === Rol.ADMIN_EMPRESA) {
      await this.verificar(alcance, 'empleado', idEmpleado);
      return;
    }
    if (alcance.rol === Rol.JEFE && alcance.codigoEmpleado) {
      const sub = await this.prisma.empleado.findFirst({
        where: {
          idEmpleado: Number(idEmpleado),
          codigoEmpleadoJefe: alcance.codigoEmpleado,
          estado: true,
        },
        select: { idEmpleado: true },
      });
      if (sub) return;
    }
    throw new NotFoundException('Empleado no encontrado');
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
  async verificarCodigos(alcance: Alcance, codigos: string[]): Promise<void> {
    if (alcance.todasLasEmpresas) return;
    const unicos = [...new Set(codigos.filter(Boolean))];
    const encontrados = await this.prisma.empleado.findMany({
      where: {
        codigoEmpleado: { in: unicos },
        idEmpresaEmpleadora: alcance.idEmpresa ?? -1,
      },
      select: { codigoEmpleado: true },
    });
    const propios = new Set(encontrados.map((e) => e.codigoEmpleado));
    const ajenos = unicos.filter((c) => !propios.has(c));
    if (ajenos.length) {
      throw new NotFoundException(
        `Trabajadores no encontrados en tu empresa: ${ajenos.join(', ')}`,
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
