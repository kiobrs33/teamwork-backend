/**
 * Unidades de medida de una meta. Se guardan en mayúsculas y sin tildes:
 * antes se guardaba lo que llegara y convivían "Porcentaje", "PORCENTAJE",
 * "Unidad", "UNIDAD"… (`20261122130000_objetivos_fechas_y_unidades` las
 * unificó). CANTIDAD y HORAS existen en datos de SEAL; DIAS, PUNTOS y SOLES
 * vienen de los ejemplos de la guía FONAFE (plazos, NPS, montos).
 */
export const UNIDADES_MEDIDA = [
  'PORCENTAJE',
  'UNIDAD',
  'CANTIDAD',
  'HORAS',
  'DIAS',
  'PUNTOS',
  'SOLES',
];

/** "Días" → "DIAS": mayúsculas, sin tildes ni espacios sobrantes. */
export const normalizarUnidad = (valor: unknown) =>
  typeof valor === 'string'
    ? valor
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase()
    : valor;
