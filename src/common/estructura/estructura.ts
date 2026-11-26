import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Reglas comunes a los cuatro niveles de la estructura de una empresa
 * (gerencias, áreas, unidades ocupacionales y puestos). Son cuatro listas
 * planas por empresa con los mismos campos, así que las reglas son una sola:
 *
 * - El nombre se guarda recortado y sin espacios dobles, y no se repite dentro
 *   de la empresa. La comparación ignora mayúsculas, tildes y espacios, igual
 *   que la revisión de la importación del front.
 * - No se elimina ni se cambia de empresa un registro que tiene trabajadores:
 *   quedarían apuntando a algo que ya no se ve o que es de otra empresa.
 *   Los cesados cuentan para cambiar de empresa (su historial lo usa), no para
 *   eliminar (el registro se desactiva, no se borra, y su historial lo
 *   conserva).
 */
export type NivelEstructura = 'gerencia' | 'area' | 'unidad' | 'puesto';

interface ConfigNivel {
  modelo:
    | 'gerenciaEmpleadora'
    | 'areaEmpleadora'
    | 'unidadOcupacionalEmpleadora'
    | 'puestoEmpleadora';
  id: string;
  /** "una gerencia", "un área". */
  uno: string;
  /** "la gerencia", "el área". */
  el: string;
  /** "de la gerencia", "del área". */
  del: string;
  /** "asignada", "asignado". */
  asignado: string;
}

const NIVELES: Record<NivelEstructura, ConfigNivel> = {
  gerencia: {
    modelo: 'gerenciaEmpleadora',
    id: 'idGerenciaEmpleadora',
    uno: 'una gerencia',
    el: 'la gerencia',
    del: 'de la gerencia',
    asignado: 'asignada',
  },
  area: {
    modelo: 'areaEmpleadora',
    id: 'idAreaEmpleadora',
    uno: 'un área',
    el: 'el área',
    del: 'del área',
    asignado: 'asignada',
  },
  unidad: {
    modelo: 'unidadOcupacionalEmpleadora',
    id: 'idUnidadOcupacionalEmpleadora',
    uno: 'un grupo ocupacional',
    el: 'el grupo ocupacional',
    del: 'del grupo ocupacional',
    asignado: 'asignado',
  },
  puesto: {
    modelo: 'puestoEmpleadora',
    id: 'idPuestoEmpleadora',
    uno: 'un puesto',
    el: 'el puesto',
    del: 'del puesto',
    asignado: 'asignado',
  },
};

type Cliente = Prisma.TransactionClient;

/** "  Gerencia   de  Operaciones " → "Gerencia de Operaciones". */
export const nombreLimpio = (texto: string) =>
  String(texto ?? '')
    .replace(/\s+/g, ' ')
    .trim();

/** La clave de comparación: sin mayúsculas, tildes ni espacios de más. */
export const claveNombre = (texto: string) =>
  nombreLimpio(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Los cuatro delegados de Prisma tienen la misma forma para lo que se usa
// aquí; el acceso dinámico evita repetir cada función cuatro veces.
const delegado = (db: Cliente, nivel: NivelEstructura) =>
  db[NIVELES[nivel].modelo] as unknown as {
    findMany: (args: unknown) => Promise<Record<string, unknown>[]>;
  };

/** Nombres activos de la empresa, por clave (id del registro como valor). */
const nombresDeEmpresa = async (
  db: Cliente,
  nivel: NivelEstructura,
  idEmpresa: number,
) => {
  const filas = await delegado(db, nivel).findMany({
    where: { idEmpresaEmpleadora: idEmpresa, estado: true },
    select: { [NIVELES[nivel].id]: true, descripcion: true },
  });
  return new Map(
    filas.map((f) => [
      claveNombre(String(f.descripcion)),
      Number(f[NIVELES[nivel].id]),
    ]),
  );
};

/** 409 si la empresa ya tiene otro registro con ese nombre. */
export const exigirNombreLibre = async (
  db: Cliente,
  nivel: NivelEstructura,
  idEmpresa: number,
  nombre: string,
  excluirId?: number,
) => {
  const id = (await nombresDeEmpresa(db, nivel, idEmpresa)).get(
    claveNombre(nombre),
  );
  if (id !== undefined && id !== excluirId)
    throw new ConflictException(
      `Ya existe ${NIVELES[nivel].uno} "${nombreLimpio(nombre)}" en esta empresa.`,
    );
};

const contarTrabajadores = (
  db: Cliente,
  nivel: NivelEstructura,
  id: number,
  incluirCesados: boolean,
) =>
  db.empleado.count({
    where: {
      [NIVELES[nivel].id]: id,
      ...(!incluirCesados && { situacion: { not: 'CESADO' } }),
    },
  });

const trabajadores = (n: number) =>
  n === 1 ? '1 trabajador' : `${n} trabajadores`;

/** 409 si hay trabajadores (activos o suspendidos) con el registro. */
export const exigirSinTrabajadoresParaEliminar = async (
  db: Cliente,
  nivel: NivelEstructura,
  id: number,
) => {
  const n = await contarTrabajadores(db, nivel, id, false);
  if (n > 0)
    throw new ConflictException(
      `No se puede eliminar ${NIVELES[nivel].el}: está ${NIVELES[nivel].asignado} a ${trabajadores(n)}. Reasígnelos antes.`,
    );
};

/** 409 si el registro tiene trabajadores (también cesados) y cambia de empresa. */
export const exigirSinTrabajadoresParaMudar = async (
  db: Cliente,
  nivel: NivelEstructura,
  id: number,
) => {
  const n = await contarTrabajadores(db, nivel, id, true);
  if (n > 0)
    throw new BadRequestException(
      `No se puede cambiar la empresa ${NIVELES[nivel].del}: está ${NIVELES[nivel].asignado} a ${trabajadores(n)}.`,
    );
};

/**
 * La importación: limpia los nombres y omite las filas de ejemplo de la
 * plantilla, los que la empresa ya tiene y los repetidos dentro del envío. El front ya los omite al revisar el
 * archivo; esto cubre a cualquier otro cliente de la API.
 */
export const filtrarImportacion = async <
  T extends { descripcion: string; idEmpresaEmpleadora: number },
>(
  db: Cliente,
  nivel: NivelEstructura,
  filas: T[],
) => {
  const porEmpresa = new Map<number, Map<string, number>>();
  const nuevas: T[] = [];
  for (const fila of filas) {
    const idEmpresa = Number(fila.idEmpresaEmpleadora);
    if (!porEmpresa.has(idEmpresa))
      porEmpresa.set(idEmpresa, await nombresDeEmpresa(db, nivel, idEmpresa));
    const vistos = porEmpresa.get(idEmpresa)!;
    const clave = claveNombre(fila.descripcion);
    // Las filas de ejemplo de la plantilla terminan en "(Ejemplo)".
    if (/\(\s*ejemplo\s*\)\s*$/i.test(fila.descripcion)) continue;
    if (vistos.has(clave)) continue;
    vistos.set(clave, 0);
    nuevas.push({ ...fila, descripcion: nombreLimpio(fila.descripcion) });
  }
  return { nuevas, omitidas: filas.length - nuevas.length };
};
