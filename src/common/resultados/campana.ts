import type { EmpresaEmpleadora, PrismaClient } from '@prisma/client';
import type { ConfiguracionEmpresa } from './resultados-evaluacion';
import { normalizarPeriodo } from './resultados-evaluacion';

type Prisma = Pick<PrismaClient, 'campanaEvaluacion'>;

/**
 * Con qué configuración se calcula una campaña.
 *
 * La vigente usa la de la empresa. Una cerrada usa la que se guardó en
 * `CampanaEvaluacion` al cerrarla: los pesos, el modelo y la escala de la
 * empresa se sobrescriben de una campaña a otra, y recalcular un resultado
 * viejo con la configuración nueva daba otra cifra que la que se entregó.
 * Si la campaña es anterior a esta tabla (no hay fila), cae a la de la
 * empresa, que es lo único que existe.
 */
export async function configuracionDeCampana(
  prisma: Prisma,
  empresa: Pick<
    EmpresaEmpleadora,
    keyof ConfiguracionEmpresa | 'idEmpresaEmpleadora' | 'periodoEvaluacion'
  >,
  periodo?: string | null,
): Promise<ConfiguracionEmpresa & { periodo: string | null; cerrada: boolean }> {
  const vigente = normalizarPeriodo(empresa.periodoEvaluacion);
  const pedido = normalizarPeriodo(periodo) ?? vigente;

  if (pedido && pedido !== vigente) {
    const campana = await prisma.campanaEvaluacion.findUnique({
      where: {
        idEmpresaEmpleadora_periodoEvaluacion: {
          idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
          periodoEvaluacion: pedido,
        },
      },
    });
    if (campana) return { ...campana, periodo: pedido, cerrada: true };
  }

  return { ...empresa, periodo: pedido, cerrada: pedido !== vigente };
}
