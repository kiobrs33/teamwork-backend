import { NotFoundException } from '@nestjs/common';
import { Rol } from 'src/empleado/types/empleadoTypes';

/**
 * Hasta dónde llega un usuario, resuelto en el servidor en cada petición
 * (nunca desde un parámetro de la URL ni del cuerpo).
 *
 * - ADMIN (TeamWork): todas las empresas.
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
  /** Su ficha de trabajador (jefe / empleado), si tiene. */
  idEmpleado?: number;
  codigoEmpleado?: string;
}

/** Los dos administradores: el de TeamWork y el de cada empresa. */
export const ADMINISTRADORES = [Rol.ADMIN, Rol.ADMIN_EMPRESA];
/** Cualquier usuario autenticado. */
export const TODOS = [Rol.ADMIN, Rol.ADMIN_EMPRESA, Rol.JEFE, Rol.EMPLEADO];

/**
 * La empresa con la que debe filtrarse un listado: la pedida si el usuario
 * las ve todas (o `undefined` = todas), y siempre la suya si no, ignore lo que
 * pida. Así un administrador de empresa no puede pedir otra cambiando la URL.
 */
export const empresaDelListado = (
  alcance: Alcance,
  pedida?: number | string | null,
): number | undefined => {
  if (alcance.todasLasEmpresas) {
    const id = Number(pedida);
    return Number.isInteger(id) && id > 0 ? id : undefined;
  }
  // Sin empresa resuelta (cuenta mal configurada) no ve nada: -1 no existe.
  return alcance.idEmpresa ?? -1;
};

/**
 * Comprueba que un registro sea de una empresa al alcance del usuario.
 * Responde 404 y no 403 para no confirmar que el id existe en otra empresa
 * (mismo criterio que evidencias).
 */
export const verificarEmpresa = (
  alcance: Alcance,
  idEmpresaDelRecurso: number | null | undefined,
  recurso = 'Registro',
) => {
  if (alcance.todasLasEmpresas) return;
  if (
    idEmpresaDelRecurso == null ||
    idEmpresaDelRecurso !== alcance.idEmpresa
  ) {
    throw new NotFoundException(`${recurso} no encontrado`);
  }
};
