import { NotFoundException } from '@nestjs/common';
import { Rol } from 'src/empleado/types/empleadoTypes';

/**
 * Hasta dónde llega un usuario, resuelto en el servidor en cada petición
 * (nunca desde un parámetro de la URL ni del cuerpo).
 *
 * - ADMIN (dueño de TeamWork): todas las empresas.
 * - EQUIPO (personal de TeamWork): las empresas asignadas, o todas.
 * - ADMIN_EMPRESA (RR. HH.): solo la empresa de su usuario.
 * - JEFE / EMPLEADO: la empresa de su ficha de trabajador.
 */
export interface Alcance {
  idUsuario: number;
  rol: Rol;
  /** `true` solo para el superadministrador. */
  todasLasEmpresas: boolean;
  /** La empresa a la que está limitado; `null` si las ve todas. */
  idEmpresa: number | null;
  /**
   * EQUIPO con empresas asignadas: las que puede ver (varias). Si está, manda
   * sobre `idEmpresa`.
   */
  empresasPermitidas?: number[];
  /** Su ficha de trabajador (jefe / empleado), si tiene. */
  idEmpleado?: number;
  codigoEmpleado?: string;
  /**
   * Cuenta de gestión de Solo lectura (EQUIPO o ADMIN_EMPRESA): `RolesGuard`
   * rechaza toda escritura salvo cambiar la propia contraseña.
   */
  soloLectura?: boolean;
}

/** La gente de TeamWork: el dueño y su equipo. */
export const INTERNOS = [Rol.ADMIN, Rol.EQUIPO];
/** Quienes administran: TeamWork (dueño y equipo) y RR. HH. de cada empresa. */
export const ADMINISTRADORES = [Rol.ADMIN, Rol.EQUIPO, Rol.ADMIN_EMPRESA];
/** Cualquier usuario autenticado. */
export const TODOS = [
  Rol.ADMIN,
  Rol.EQUIPO,
  Rol.ADMIN_EMPRESA,
  Rol.JEFE,
  Rol.EMPLEADO,
];

/**
 * Las empresas al alcance: `null` = todas; si no, la lista (una sola para RR.
 * HH., jefe y empleado; varias para EQUIPO con empresas asignadas).
 */
export const empresasDelAlcance = (alcance: Alcance): number[] | null => {
  if (alcance.todasLasEmpresas) return null;
  if (alcance.empresasPermitidas) return alcance.empresasPermitidas;
  return alcance.idEmpresa != null ? [alcance.idEmpresa] : [];
};

/**
 * La empresa con la que debe filtrarse un listado: la pedida si el usuario
 * las ve todas (o `undefined` = todas), y siempre la suya si no, ignore lo que
 * pida. Así un administrador de empresa no puede pedir otra cambiando la URL.
 */
export const empresaDelListado = (
  alcance: Alcance,
  pedida?: number | string | null,
): number | undefined => {
  const id = Number(pedida);
  const valida = Number.isInteger(id) && id > 0;
  if (alcance.todasLasEmpresas) return valida ? id : undefined;
  // EQUIPO con empresas asignadas: la pedida si es una de las suyas. Sin
  // pedirla, los listados por empresa no muestran nada (-1); la cartera usa
  // `empresasDelAlcance` para listar todas las suyas.
  if (alcance.empresasPermitidas) {
    return valida && alcance.empresasPermitidas.includes(id) ? id : -1;
  }
  // Sin empresa resuelta (cuenta mal configurada) no ve nada: -1 no existe.
  return alcance.idEmpresa ?? -1;
};

/**
 * Comprueba que un registro sea de una empresa al alcance del usuario.
 * Responde 404 y no 403 para no confirmar que el id existe en otra empresa
 * (mismo criterio que evidencias).
 */
/** «Empresa no encontrada», «Empleado no encontrado»: concuerda en género. */
const FEMENINOS = new Set([
  'Empresa',
  'Área',
  'Gerencia',
  'Competencia',
  'Campaña',
  'Evaluación',
  'Retroalimentación',
]);
export const noEncontrado = (recurso: string) =>
  `${recurso} no ${FEMENINOS.has(recurso) ? 'encontrada' : 'encontrado'}`;

export const verificarEmpresa = (
  alcance: Alcance,
  idEmpresaDelRecurso: number | null | undefined,
  recurso = 'Registro',
) => {
  if (alcance.todasLasEmpresas) return;
  const permitidas = empresasDelAlcance(alcance) ?? [];
  if (
    idEmpresaDelRecurso == null ||
    !permitidas.includes(idEmpresaDelRecurso)
  ) {
    throw new NotFoundException(noEncontrado(recurso));
  }
};
