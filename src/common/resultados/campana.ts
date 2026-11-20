import type { CampanaEvaluacion, PrismaClient } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

type Prisma = Pick<PrismaClient, 'campanaEvaluacion'>;

export type Campana = CampanaEvaluacion;

export const CAMPANA_EN_CURSO = 'EN_CURSO';
export const CAMPANA_CERRADA = 'CERRADA';

/**
 * Qué evaluaciones cuentan para un resultado: las de la campaña y que no estén
 * anuladas. Reemplaza al filtro por `periodoEvaluacion` ("YYYY-MM"): la
 * campaña es ahora una entidad con id.
 *
 * Sin campaña (`null`) no cuenta ninguna: `-1` no coincide con ningún id, y
 * así un trabajador de una empresa sin campaña abierta sale "sin evaluar" en
 * vez de sumar evaluaciones de cualquier ciclo.
 */
export const filtroEvaluacionesDeCampana = (idCampana?: number | null) => ({
  estado: true,
  estadoEvaluacion: { not: 'ANULADA' },
  idCampanaEvaluacion: idCampana ?? -1,
});

/** La campaña en curso de una empresa (hay como mucho una). */
export function campanaEnCurso(prisma: Prisma, idEmpresaEmpleadora: number) {
  return prisma.campanaEvaluacion.findFirst({
    where: { idEmpresaEmpleadora, estado: CAMPANA_EN_CURSO },
  });
}

/**
 * La campaña pedida, comprobando que sea de la empresa; sin id, la en curso.
 * La configuración (modelo, pesos, escala) vive en la propia campaña, así que
 * una cerrada se calcula con la que tenía y no con la actual.
 */
export async function resolverCampana(
  prisma: Prisma,
  idEmpresaEmpleadora: number,
  idCampana?: number | string | null,
): Promise<Campana | null> {
  const id = idCampana ? Number(idCampana) : undefined;
  if (!id) return campanaEnCurso(prisma, idEmpresaEmpleadora);

  const campana = await prisma.campanaEvaluacion.findFirst({
    where: { idCampanaEvaluacion: id, idEmpresaEmpleadora },
  });
  if (!campana) {
    throw new NotFoundException('La campaña no existe o no es de esta empresa.');
  }
  return campana;
}

/** "Evaluación anual 2026 (01/01/2026 – 31/12/2026)" para títulos y PDF. */
export const etiquetaDeCampana = (c: Pick<Campana, 'nombre'>) => c.nombre;
