/**
 * Las reglas de cálculo de la evaluación de desempeño, en un solo sitio.
 *
 * Estaban escritas tres veces —el Excel de resultados por empresa, el PDF
 * individual y el indicador de avance del listado— y habían dejado de
 * coincidir: para el mismo trabajador el Excel daba 100 en competencias y el
 * PDF 75, porque el PDF no descartaba las evaluaciones anuladas ni las de
 * campañas anteriores. Cualquier salida nueva que enseñe un resultado tiene
 * que pasar por acá.
 *
 * Son funciones puras a propósito, sin inyección: así las pueden importar
 * servicios de módulos distintos sin montar dependencias circulares.
 */

/** Redondeo estable. `Number.EPSILON` evita que 1.005 caiga a 1.00. */
export const redondear = (num: number, decimales = 2): number => {
  const factor = Math.pow(10, decimales);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const promedio = (valores: number[]): number =>
  valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;

/**
 * Recorta un periodo a "YYYY-MM". Solo para datos heredados: las campañas
 * se identifican por id.
 *
 * `EmpresaEmpleadora.periodoEvaluacion` se guarda así, pero hay valores viejos
 * en ISO completo; el prefijo sirve para los dos.
 */
export const normalizarPeriodo = (periodo?: string | null): string | null => {
  const prefijo = /^(\d{4}-\d{2})/.exec(periodo?.trim() ?? '');
  return prefijo ? prefijo[1] : null;
};

// El filtro de evaluaciones por campaña vive en `./campana.ts`
// (`filtroEvaluacionesDeCampana`): la campaña es una entidad con id, ya no un
// "YYYY-MM".

/**
 * Nota de una evaluación: el promedio de sus ítems calificados.
 *
 * Devuelve `null` —no 0— cuando no hay ninguno. `null` es "sin evaluar" y 0 es
 * una nota válida; confundirlos hundía el resultado de quien todavía no tenía
 * notas puestas.
 */
export const notaDeEvaluacion = (
  items: { calificacion: number | null }[],
): number | null => {
  const calificadas = items
    .map((i) => i.calificacion)
    .filter((c): c is number => c !== null && c !== undefined);

  return calificadas.length ? promedio(calificadas) : null;
};

export type OrigenEvaluacion = 'auto' | 'jefe' | 'subordinado' | 'otro';

/** Cómo se guarda cada origen en `EvaluacionCompetencia.tipoEvaluador`. */
export const TIPO_POR_ORIGEN: Record<OrigenEvaluacion, string> = {
  auto: 'AUTO',
  jefe: 'JEFE',
  subordinado: 'SUBORDINADO',
  otro: 'OTRO',
};

const ORIGEN_POR_TIPO: Record<string, OrigenEvaluacion> = {
  AUTO: 'auto',
  JEFE: 'jefe',
  SUBORDINADO: 'subordinado',
  OTRO: 'otro',
};

/**
 * De quién viene la nota, según los tres papeles que define el modelo.
 *
 * El vínculo jerárquico es el texto `codigoEmpleadoJefe`, no una relación, así
 * que se compara por código:
 * - **auto**: se evalúa a sí mismo. No puntúa en ningún modelo.
 * - **jefe**: su líder inmediato. 100 % en 90°, 70 % en 180°.
 * - **subordinado**: alguien que depende jerárquicamente del evaluado. 30 %
 *   en 180°, y en 90° no se recoge.
 * - **otro**: no es ninguno de los tres. Antes caía en el cajón de
 *   subordinados y se llevaba su 30 % de la nota sin serlo; ahora se descarta.
 */
export const origenDeEvaluacion = (datos: {
  /**
   * La foto guardada al iniciar la evaluación (`EvaluacionCompetencia.
   * tipoEvaluador`). Si está, MANDA: así un cambio de jefe posterior no
   * convierte en "otro" las notas que puso el jefe de entonces. Las
   * comparaciones de abajo solo corren para filas sin foto.
   */
  tipoEvaluador?: string | null;
  // Los dos son opcionales en el esquema, así que llegan como `number | null`.
  idEvaluado: number | null;
  idEvaluador: number | null;
  codigoEvaluado?: string | null;
  codigoEvaluador?: string | null;
  codigoEmpleadoJefe?: string | null;
  /** El jefe del evaluador: así se confirma que de verdad es subordinado. */
  codigoJefeDelEvaluador?: string | null;
}): OrigenEvaluacion => {
  const foto = ORIGEN_POR_TIPO[datos.tipoEvaluador ?? ''];
  if (foto) return foto;

  if (datos.idEvaluador !== null && datos.idEvaluador === datos.idEvaluado) {
    return 'auto';
  }

  if (
    datos.codigoEmpleadoJefe &&
    datos.codigoEvaluador === datos.codigoEmpleadoJefe
  ) {
    return 'jefe';
  }

  if (
    datos.codigoEvaluado &&
    datos.codigoJefeDelEvaluador === datos.codigoEvaluado
  ) {
    return 'subordinado';
  }

  return 'otro';
};

/**
 * Resultado de UN objetivo: el promedio de sus detalles ponderado por
 * `pesoEspecifico` (los pesos de un objetivo suman 100).
 *
 * `null` si ninguno de sus detalles está calificado, para que el objetivo se
 * quede fuera del promedio en vez de entrar como un 0.
 */
export const resultadoDeObjetivo = (
  detalles: {
    porcentajeLogrado: number | null;
    pesoEspecifico: number;
  }[],
): number | null => {
  let acumulado = 0;
  let totalPeso = 0;

  for (const det of detalles) {
    if (det.porcentajeLogrado === null || det.porcentajeLogrado === undefined) {
      continue;
    }

    acumulado += det.porcentajeLogrado * det.pesoEspecifico;
    totalPeso += det.pesoEspecifico;
  }

  return totalPeso > 0 ? acumulado / totalPeso : null;
};

/** Las notas de un evaluado, ya clasificadas por origen. */
export interface NotasDeEvaluado {
  autoEvaluaciones: number[];
  evaluacionesJefe: number[];
  evaluacionesSubordinados: number[];
  /** Un valor por objetivo, ya ponderado por dentro. */
  objetivos: number[];
}

export const notasVacias = (): NotasDeEvaluado => ({
  autoEvaluaciones: [],
  evaluacionesJefe: [],
  evaluacionesSubordinados: [],
  objetivos: [],
});

export interface ConfiguracionEmpresa {
  modeloEmpresa?: string | null;
  porcentajeCompetecias?: number | null;
  porcentajeObjetivos?: number | null;
  porcentajeEvaluacionJefeCompetencia?: number | null;
  porcentajeEvaluacionSubordinadoCompetencia?: number | null;
  competenciaResultadoEsperado?: number | null;
  /**
   * Del evaluado, no de la empresa: no tiene jefe (la cabeza de la empresa).
   * En 180° su nota de competencias es la de sus subordinados al 100 %, igual
   * que quien no tiene gente a cargo queda con la del jefe al 100 %. Antes
   * contaba «jefe 70 % + subordinados 30 %» con la parte del jefe en 0, y un
   * gerente general no podía pasar de 30. Ver `evaluadoSinJefe`.
   */
  evaluadoSinJefe?: boolean;
}

/**
 * ¿El evaluado no tiene jefe en esta campaña? En curso, se mira la
 * estructura de hoy; en una cerrada, la foto que guardó cada evaluación al
 * iniciarse (`codigoJefeEvaluado`), porque el jefe pudo cambiar después.
 */
export const evaluadoSinJefe = (datos: {
  cerrada: boolean;
  codigoJefeActual: string | null | undefined;
  fotosJefe: (string | null | undefined)[];
}): boolean =>
  datos.cerrada && datos.fotosJefe.length
    ? datos.fotosJefe.every((c) => !c)
    : !datos.codigoJefeActual;

/**
 * Los pesos de la empresa en tanto por uno.
 *
 * Los valores por defecto describen el modelo 90° (solo evalúa el jefe,
 * 80/20 entre competencias y objetivos). Antes cada sitio ponía los suyos: el
 * Excel caía a 0, o sea que una empresa sin pesos configurados sacaba el
 * informe entero a cero sin avisar.
 */
export const pesosDeEmpresa = (empresa: ConfiguracionEmpresa) => {
  // Los valores por defecto son los del modelo: 90° es el jefe al 100 % y en
  // 180° el reparto es 70/30. Uno fijo al 100/0 dejaba a una empresa de 180°
  // sin configurar comportándose como una de 90° sin decirlo.
  const esCiento80 = empresa.modeloEmpresa === '180';

  return {
    jefe:
      (empresa.porcentajeEvaluacionJefeCompetencia ?? (esCiento80 ? 70 : 100)) /
      100,
    subordinado:
      (empresa.porcentajeEvaluacionSubordinadoCompetencia ??
        (esCiento80 ? 30 : 0)) / 100,
    competencias: (empresa.porcentajeCompetecias ?? 80) / 100,
    objetivos: (empresa.porcentajeObjetivos ?? 20) / 100,
    resultadoEsperado: empresa.competenciaResultadoEsperado ?? 100,
  };
};

export interface ResultadosEvaluado {
  promedioAuto: number;
  promedioJefe: number;
  promedioSubordinados: number;
  resultadoCompetencias: number;
  promedioObjetivos: number;
  resultadoFinal: number;
  /** No hay ni una nota de competencia en la campaña. */
  competenciasSinEvaluar: boolean;
  /** No hay ni un objetivo con porcentaje puesto. */
  objetivosSinEvaluar: boolean;
  /** No hay absolutamente nada evaluado: el informe no puede dar cifras. */
  sinEvaluar: boolean;
}

/**
 * El resultado de un evaluado a partir de sus notas.
 *
 * En 180° el peso de los subordinados solo se aplica si de verdad hay notas de
 * subordinados: se mira `length`, no si el promedio es mayor que cero, porque
 * un 0 es una nota válida y tratarlo como "no hay" cambiaba la fórmula.
 */
export const calcularResultados = (
  empresa: ConfiguracionEmpresa,
  notas: NotasDeEvaluado,
  decimales = 2,
): ResultadosEvaluado => {
  const peso = pesosDeEmpresa(empresa);

  // Se calcula con toda la precisión y se redondea solo al salir. Antes el
  // Excel redondeaba los promedios intermedios a 4 decimales y el PDF a 2, y
  // el mismo trabajador aparecía con 144.1675 en un sitio y 144.17 en el otro.
  const auto = promedio(notas.autoEvaluaciones);
  const jefe = promedio(notas.evaluacionesJefe);
  const subordinados = promedio(notas.evaluacionesSubordinados);

  const tieneSubordinados = notas.evaluacionesSubordinados.length > 0;

  // En 180°: sin subordinados que califiquen, solo el jefe; sin jefe (la
  // cabeza de la empresa), solo los subordinados.
  const competencias =
    empresa.modeloEmpresa === '180' && tieneSubordinados
      ? empresa.evaluadoSinJefe
        ? subordinados
        : jefe * peso.jefe + subordinados * peso.subordinado
      : jefe;

  const objetivos = promedio(notas.objetivos);

  const final = competencias * peso.competencias + objetivos * peso.objetivos;

  // La autoevaluación NO entra aquí a propósito. No influye cuantitativamente
  // en nada, y eso incluye decidir si una competencia está evaluada: si el
  // trabajador se autoevalúa antes que su jefe —que es el orden habitual— la
  // competencia se daba por evaluada y su 0 se leía como "el jefe le puso 0"
  // en vez de "nadie la ha evaluado".
  const competenciasSinEvaluar =
    notas.evaluacionesJefe.length === 0 &&
    notas.evaluacionesSubordinados.length === 0;

  const objetivosSinEvaluar = notas.objetivos.length === 0;

  return {
    promedioAuto: redondear(auto, decimales),
    promedioJefe: redondear(jefe, decimales),
    promedioSubordinados: redondear(subordinados, decimales),
    resultadoCompetencias: redondear(competencias, decimales),
    promedioObjetivos: redondear(objetivos, decimales),
    resultadoFinal: redondear(final, decimales),
    competenciasSinEvaluar,
    objetivosSinEvaluar,
    sinEvaluar: competenciasSinEvaluar && objetivosSinEvaluar,
  };
};

/**
 * Resultado de UNA competencia asignada: `null` si nadie la evaluó.
 *
 * Se calcula con la misma fórmula que el resultado global, así que la fila de
 * la tabla y la esquina del radar salen del mismo sitio que la nota final.
 */
export const resultadoDeCompetencia = (
  empresa: ConfiguracionEmpresa,
  notas: NotasDeEvaluado | undefined,
): number | null => {
  if (!notas) return null;

  const r = calcularResultados(empresa, notas);
  return r.competenciasSinEvaluar ? null : r.resultadoCompetencias;
};

/**
 * Resultado de competencias: el promedio sobre las que tiene ASIGNADAS su
 * unidad ocupacional, contando **0** las que nadie evaluó.
 *
 * Promediando solo las evaluadas, evaluar una competencia de cinco daba el
 * mismo resultado que evaluar las cinco con esa nota. El 0 es deliberado y el
 * informe lo dice: un 0 que nadie puso no significa lo mismo que un 0 que puso
 * el jefe, y en la base de datos no hay ninguna nota.
 */
export const resultadoDeCompetenciasAsignadas = (
  empresa: ConfiguracionEmpresa,
  competenciasAsignadas: number[],
  notasPorCompetencia: Map<number, NotasDeEvaluado>,
  decimales = 2,
) => {
  const porCompetencia = competenciasAsignadas.map((idCompetencia) =>
    resultadoDeCompetencia(empresa, notasPorCompetencia.get(idCompetencia)),
  );

  return {
    resultado: redondear(
      promedio(porCompetencia.map((r) => r ?? 0)),
      decimales,
    ),
    /** Cuántas le tocan. 0 = su unidad todavía no tiene ninguna asignada. */
    asignadas: competenciasAsignadas.length,
    /** Tiene competencias asignadas pero nadie ha evaluado ninguna. */
    ningunaEvaluada:
      competenciasAsignadas.length > 0 &&
      porCompetencia.every((r) => r === null),
    /** No hay nada que medir: ni asignadas ni evaluadas. */
    sinEvaluar: porCompetencia.every((r) => r === null),
  };
};

/**
 * Escala con la que se califica una competencia.
 *
 * `LIKERT` ofrece cinco pasos fijos; `MANUAL` deja escribir el porcentaje, y
 * llega hasta 110 porque en esa escala sí se puede superar lo esperado — de
 * ahí el "superávit" del informe, que con LIKERT es inalcanzable.
 */
export const OPCIONES_LIKERT = [0, 25, 50, 75, 100];
export const CALIFICACION_MAXIMA_MANUAL = 110;

/**
 * ¿Es una calificación válida para la escala de la empresa?
 *
 * `null` es "sin calificar" y siempre vale. El backend no comprobaba nada: el
 * DTO tenía `Min` y `Max` importados y sin usar, así que por la API entraban
 * un 9999 o un -500 y se guardaban tal cual, arrastrando el promedio de toda
 * la competencia.
 */
export const calificacionValida = (
  calificacion: number | null | undefined,
  tipo?: string | null,
): boolean => {
  if (calificacion === null || calificacion === undefined) return true;

  if (tipo === 'LIKERT') return OPCIONES_LIKERT.includes(calificacion);

  return calificacion >= 0 && calificacion <= CALIFICACION_MAXIMA_MANUAL;
};

/**
 * Brecha a partir de la cual conviene revisar una competencia.
 *
 * El caso que hay que cazar es el trabajador que se pone 100 en todo y el jefe
 * que le pone 20: eso no se corrige solo, la empresa habla con el jefe para
 * entender la diferencia. Marcarlo en el informe es lo que hace que alguien lo
 * mire. La autoevaluación NO entra en la nota; está justamente para esto.
 */
export const BRECHA_REVISION = 30;

/**
 * ¿La autoevaluación y la nota del jefe se separan tanto que hay que mirarlo?
 *
 * Solo con las dos puestas: sin autoevaluación no hay nada que comparar, y una
 * competencia sin evaluar no es una discrepancia, es un hueco.
 */
export const hayBrecha = (
  autoevaluacion: number | null,
  notaJefe: number | null,
): boolean =>
  autoevaluacion !== null &&
  notaJefe !== null &&
  Math.abs(autoevaluacion - notaJefe) >= BRECHA_REVISION;

/**
 * La clasificación cualitativa que acompaña al resultado de competencias.
 *
 * Los cortes son los del informe individual; estaban solo ahí y son parte de
 * la misma regla de negocio que el cálculo.
 */
/**
 * Nivel de desempeño de la nota de competencias (bandas de la guía de
 * FONAFE). Con la escala **LIKERT** el máximo posible es 100 (todos los
 * comportamientos en el paso más alto), así que ahí "Sobresaliente" es 100:
 * con el umbral de 105 era inalcanzable. En MANUAL (hasta 110) sigue en 105.
 */
export const clasificarDesempeno = (
  resultado: number,
  escala?: string | null,
) => {
  const umbralSobresaliente = escala === 'LIKERT' ? 100 : 105;
  if (resultado >= umbralSobresaliente) {
    return {
      nivel: 'Sobresaliente',
      mensaje: 'Siempre demuestra evidencias de todos los comportamientos.',
    };
  }

  if (resultado >= 95) {
    return {
      nivel: 'Altamente Efectivo',
      mensaje: 'Muy frecuentemente evidencia casi todos los comportamientos.',
    };
  }

  if (resultado >= 75) {
    return {
      nivel: 'Efectivo',
      mensaje: 'Usualmente evidencia la mayoría de los comportamientos.',
    };
  }

  if (resultado >= 50) {
    return {
      nivel: 'Parcialmente Efectivo',
      mensaje: 'En ocasiones evidencia los comportamientos.',
    };
  }

  return {
    nivel: 'Necesita Mejora',
    mensaje: 'Nunca evidencia los comportamientos.',
  };
};

/**
 * Bandas de la guía FONAFE para objetivos y para el resultado final
 * (Sobresaliente ≥105 · Altamente efectivo 95–104 · Efectivo 75–94 ·
 * Parcialmente efectivo 50–74 · Necesita mejora 0–49). El cumplimiento de
 * objetivos puede pasar de 100, así que aquí el umbral es siempre 105.
 */
const nivelPorBanda = (resultado: number) =>
  resultado >= 105
    ? 'Sobresaliente'
    : resultado >= 95
      ? 'Altamente Efectivo'
      : resultado >= 75
        ? 'Efectivo'
        : resultado >= 50
          ? 'Parcialmente Efectivo'
          : 'Necesita Mejora';

/** Textos de la escala de objetivos de la guía (p. 22). */
const MENSAJE_OBJETIVOS: Record<string, string> = {
  Sobresaliente:
    'Supera de manera consistente los objetivos establecidos, con resultados excepcionales.',
  'Altamente Efectivo': 'Logra el cumplimiento de todos sus objetivos.',
  Efectivo: 'Cumple la mayoría de sus objetivos tal como fueron planteados.',
  'Parcialmente Efectivo':
    'Cumple parcialmente sus objetivos: algunas metas no se alcanzan o quedan incompletas.',
  'Necesita Mejora': 'No cumple la mayoría de los objetivos establecidos.',
};

export const clasificarObjetivos = (resultado: number) => {
  const nivel = nivelPorBanda(resultado);
  return { nivel, mensaje: MENSAJE_OBJETIVOS[nivel] };
};

const RANGO: Record<string, string> = {
  Sobresaliente: 'De 105 % a más',
  'Altamente Efectivo': 'De 95 % a 104 %',
  Efectivo: 'De 75 % a 94 %',
  'Parcialmente Efectivo': 'De 50 % a 74 %',
  'Necesita Mejora': 'De 0 % a 49 %',
};

/** Nivel del resultado final (competencias + objetivos, ya ponderados). */
export const clasificarResultadoFinal = (resultado: number) => {
  const nivel = nivelPorBanda(resultado);
  return {
    nivel,
    mensaje: `${RANGO[nivel]}. El nivel esperado es Efectivo o superior.`,
  };
};

/** Ajuste de calibración de un trabajador (ver `AjusteCalibracion`). */
export interface AjusteDeCalibracion {
  competencias: number | null;
  objetivos: number | null;
  competenciasOriginal: number | null;
  objetivosOriginal: number | null;
  motivo: string;
}

/**
 * Aplica el ajuste de calibración a unos resultados ya calculados: el comité
 * reemplaza el resultado de competencias y/o de objetivos, y el final se
 * recalcula con los pesos de la campaña. Es la ÚNICA forma de aplicarlo: la
 * usan el PDF, el historial, el Excel de resultados y la calibración, para que
 * todos den la misma cifra.
 */
export const aplicarCalibracion = <
  R extends {
    resultadoCompetencias: number;
    promedioObjetivos: number;
    resultadoFinal: number;
    competenciasSinEvaluar: boolean;
    objetivosSinEvaluar: boolean;
    sinEvaluar: boolean;
  },
>(
  resultados: R,
  ajuste: AjusteDeCalibracion | null | undefined,
  empresa: ConfiguracionEmpresa,
): R => {
  if (!ajuste) return resultados;
  const peso = pesosDeEmpresa(empresa);
  const competencias = ajuste.competencias ?? resultados.resultadoCompetencias;
  const objetivos = ajuste.objetivos ?? resultados.promedioObjetivos;
  const competenciasSinEvaluar =
    ajuste.competencias === null && resultados.competenciasSinEvaluar;
  const objetivosSinEvaluar =
    ajuste.objetivos === null && resultados.objetivosSinEvaluar;
  return {
    ...resultados,
    resultadoCompetencias: redondear(competencias, 2),
    promedioObjetivos: redondear(objetivos, 2),
    resultadoFinal: redondear(
      competencias * peso.competencias + objetivos * peso.objetivos,
      2,
    ),
    competenciasSinEvaluar,
    objetivosSinEvaluar,
    sinEvaluar: competenciasSinEvaluar && objetivosSinEvaluar,
  };
};

/** Lo que se enseña cuando no hay nada que enseñar. */
export const SIN_EVALUAR_TEXTO = 'Sin evaluar';

export const DESEMPENO_SIN_EVALUAR = {
  nivel: SIN_EVALUAR_TEXTO,
  mensaje:
    'Todavía no se ha registrado ninguna evaluación de este periodo, así que no hay resultado que clasificar.',
};
