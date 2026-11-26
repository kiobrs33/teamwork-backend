import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  construirPlantilla,
  type ColumnaPlantilla,
} from 'src/common/excel/plantilla-importacion';
import { campanaEnCurso } from 'src/common/resultados/campana';

/** Plantillas que arma este módulo (la de trabajadores vive en `empleado`). */
export const TIPOS_PLANTILLA = [
  'objetivos',
  'competencias',
  'gerencias',
  'areas',
  'grupos-ocupacionales',
  'puestos',
] as const;
export type TipoPlantilla = (typeof TIPOS_PLANTILLA)[number];

/** Las mismas etiquetas que el formulario; el lector las pasa a código. */
const UNIDADES = [
  'Porcentaje',
  'Unidad',
  'Cantidad',
  'Horas',
  'Días',
  'Puntos',
  'Soles',
];

/** Gerencias, áreas, grupos y puestos: solo el nombre. */
const ESTRUCTURA: Record<
  'gerencias' | 'areas' | 'grupos-ocupacionales' | 'puestos',
  {
    plural: string;
    singular: string;
    hoja: string;
    registrados: string;
    ejemplo: string;
    /**
     * Diez filas de ejemplo escritas en la hoja. Se les agrega «(Ejemplo)»:
     * la importación las reconoce y no las crea si quedan en el archivo.
     */
    ejemplos: string[];
  }
> = {
  gerencias: {
    plural: 'gerencias',
    singular: 'gerencia',
    hoja: 'Nuevas gerencias',
    registrados: 'Gerencias registradas',
    ejemplo: 'Gerencia de Operaciones',
    ejemplos: [
      'Gerencia General',
      'Gerencia de Operaciones',
      'Gerencia Comercial',
      'Gerencia de Administración y Finanzas',
      'Gerencia de Recursos Humanos',
      'Gerencia de Tecnologías de la Información',
      'Gerencia de Logística',
      'Gerencia Legal',
      'Gerencia de Proyectos',
      'Gerencia de Calidad',
    ],
  },
  areas: {
    plural: 'áreas',
    singular: 'área',
    hoja: 'Nuevas áreas',
    registrados: 'Áreas registradas',
    ejemplo: 'Recursos Humanos',
    ejemplos: [
      'Recursos Humanos',
      'Contabilidad',
      'Tesorería',
      'Ventas',
      'Atención al Cliente',
      'Compras',
      'Almacén',
      'Mantenimiento',
      'Sistemas',
      'Seguridad y Salud en el Trabajo',
    ],
  },
  'grupos-ocupacionales': {
    plural: 'grupos ocupacionales',
    singular: 'grupo ocupacional',
    hoja: 'Nuevos grupos ocupacionales',
    registrados: 'Grupos registrados',
    ejemplo: 'Profesionales',
    ejemplos: [
      'Directivos',
      'Ejecutivos',
      'Profesionales',
      'Especialistas',
      'Supervisores',
      'Técnicos',
      'Asistentes administrativos',
      'Auxiliares',
      'Operarios',
      'Practicantes',
    ],
  },
  puestos: {
    plural: 'puestos',
    singular: 'puesto',
    hoja: 'Nuevos puestos',
    registrados: 'Puestos registrados',
    ejemplo: 'Analista de Operaciones',
    ejemplos: [
      'Gerente General',
      'Jefe de Recursos Humanos',
      'Analista de Operaciones',
      'Contador General',
      'Asistente Administrativo',
      'Ejecutivo de Ventas',
      'Supervisor de Mantenimiento',
      'Técnico Electricista',
      'Analista de Sistemas',
      'Auxiliar de Almacén',
    ],
  },
};

/**
 * Diez metas de ejemplo escritas en la plantilla de objetivos, de tres
 * trabajadores ficticios (código `EJEMPLO-0n`), con pesos que suman 100 por
 * trabajador y los tres tipos de cálculo. La meta termina en «(Ejemplo)»:
 * el importador las reconoce y no las importa si quedan en el archivo.
 */
const EJEMPLO_OBJETIVOS: {
  codigo: string;
  meta: string;
  iniciativa: string;
  tipo: 'ASCENDENTE' | 'DESCENDENTE' | 'MANUAL';
  unidad: (typeof UNIDADES)[number];
  peso: number;
  valor: number;
  /** Meses desde hoy hasta la fecha límite (fin de ese mes). */
  meses: number;
}[] = [
  {
    codigo: 'EJEMPLO-01',
    meta: 'Reducir los reclamos por facturación',
    iniciativa: 'Revisión semanal de los cobros observados',
    tipo: 'DESCENDENTE',
    unidad: 'Cantidad',
    peso: 40,
    valor: 4,
    meses: 3,
  },
  {
    codigo: 'EJEMPLO-01',
    meta: 'Cumplir el plan de mantenimiento preventivo',
    iniciativa: 'Calendario mensual por equipo',
    tipo: 'ASCENDENTE',
    unidad: 'Porcentaje',
    peso: 30,
    valor: 95,
    meses: 6,
  },
  {
    codigo: 'EJEMPLO-01',
    meta: 'Reducir el tiempo de atención de averías',
    iniciativa: 'Turnos de guardia en fines de semana',
    tipo: 'DESCENDENTE',
    unidad: 'Horas',
    peso: 30,
    valor: 8,
    meses: 6,
  },
  {
    codigo: 'EJEMPLO-02',
    meta: 'Incrementar la cobranza del semestre',
    iniciativa: 'Seguimiento a la cartera vencida',
    tipo: 'ASCENDENTE',
    unidad: 'Soles',
    peso: 50,
    valor: 250000,
    meses: 6,
  },
  {
    codigo: 'EJEMPLO-02',
    meta: 'Captar nuevos clientes corporativos',
    iniciativa: 'Visitas a empresas de la zona industrial',
    tipo: 'ASCENDENTE',
    unidad: 'Cantidad',
    peso: 30,
    valor: 12,
    meses: 6,
  },
  {
    codigo: 'EJEMPLO-02',
    meta: 'Mejorar la satisfacción de los clientes',
    iniciativa: 'Encuesta después de cada atención',
    tipo: 'ASCENDENTE',
    unidad: 'Puntos',
    peso: 20,
    valor: 85,
    meses: 3,
  },
  {
    codigo: 'EJEMPLO-03',
    meta: 'Completar las capacitaciones obligatorias',
    iniciativa: 'Programa anual de capacitación',
    tipo: 'ASCENDENTE',
    unidad: 'Porcentaje',
    peso: 25,
    valor: 100,
    meses: 4,
  },
  {
    codigo: 'EJEMPLO-03',
    meta: 'Reducir los días de cierre de la planilla',
    iniciativa: 'Automatizar el cálculo de horas extra',
    tipo: 'DESCENDENTE',
    unidad: 'Días',
    peso: 25,
    valor: 3,
    meses: 2,
  },
  {
    codigo: 'EJEMPLO-03',
    meta: 'Implementar el plan de bienestar',
    iniciativa: 'Una actividad por trimestre',
    tipo: 'MANUAL',
    unidad: 'Unidad',
    peso: 25,
    valor: 1,
    meses: 6,
  },
  {
    codigo: 'EJEMPLO-03',
    meta: 'Digitalizar los legajos del personal',
    iniciativa: 'Avance por área',
    tipo: 'ASCENDENTE',
    unidad: 'Cantidad',
    peso: 25,
    valor: 120,
    meses: 5,
  },
];

/** Último día del mes que cae `meses` después del actual (fecha en UTC). */
const finDeMes = (meses: number) => {
  const hoy = new Date();
  return new Date(
    Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + meses + 1, 0),
  );
};

/**
 * Cinco competencias de ejemplo escritas en la plantilla, con tres niveles y
 * dos comportamientos por nivel: la competencia en la hoja «Competencias» y
 * sus comportamientos en «Comportamientos», unidos por el código. El título
 * termina en «(Ejemplo)» para que no se importen si quedan en el archivo.
 */
interface CompetenciaDeEjemplo {
  codigo: string;
  titulo: string;
  definicion: string;
  niveles: [string, string][];
}

const competenciaDeEjemplo = (
  codigo: string,
  titulo: string,
  definicion: string,
  niveles: [string, string][],
): CompetenciaDeEjemplo => ({
  codigo,
  titulo: `${titulo} (Ejemplo)`,
  definicion,
  niveles,
});

const EJEMPLO_COMPETENCIAS: CompetenciaDeEjemplo[] = [
  competenciaDeEjemplo(
    'EJ-01',
    'Orientación a resultados',
    'Capacidad para cumplir los objetivos con la calidad y en los plazos acordados, buscando mejorar los resultados.',
    [
      [
        'Cumple las tareas asignadas en los plazos acordados.',
        'Informa a su jefe cuando una tarea corre el riesgo de retrasarse.',
      ],
      [
        'Propone mejoras en su trabajo para obtener mejores resultados.',
        'Hace seguimiento a sus metas y corrige el rumbo sin que se lo pidan.',
      ],
      [
        'Fija metas exigentes para su equipo y verifica su cumplimiento.',
        'Prioriza los recursos del área según su impacto en los resultados.',
      ],
    ],
  ),
  competenciaDeEjemplo(
    'EJ-02',
    'Trabajo en equipo',
    'Capacidad para colaborar con otras personas y áreas para alcanzar objetivos comunes.',
    [
      [
        'Comparte con sus compañeros la información que necesitan para su trabajo.',
        'Cumple los acuerdos tomados con su equipo.',
      ],
      [
        'Apoya a sus compañeros cuando tienen más carga de trabajo.',
        'Expresa sus opiniones con respeto y escucha las de los demás.',
      ],
      [
        'Coordina con otras áreas para resolver problemas comunes.',
        'Reconoce los aportes de los integrantes de su equipo.',
      ],
    ],
  ),
  competenciaDeEjemplo(
    'EJ-03',
    'Orientación al cliente',
    'Capacidad para conocer y atender las necesidades de los clientes internos y externos con calidad y oportunidad.',
    [
      [
        'Atiende las consultas de los clientes con amabilidad y en el plazo establecido.',
        'Registra los reclamos y deriva los que no puede resolver.',
      ],
      [
        'Se anticipa a las necesidades del cliente y le ofrece alternativas.',
        'Hace seguimiento a los casos hasta confirmar que se resolvieron.',
      ],
      [
        'Propone cambios en los procesos a partir de la opinión de los clientes.',
        'Mide la satisfacción de los clientes y comparte los resultados con su equipo.',
      ],
    ],
  ),
  competenciaDeEjemplo(
    'EJ-04',
    'Comunicación efectiva',
    'Capacidad para transmitir información de forma clara, oportuna y respetuosa, y para escuchar a los demás.',
    [
      [
        'Expresa sus ideas de forma clara al hablar y al escribir.',
        'Confirma que entendió las indicaciones antes de ejecutarlas.',
      ],
      [
        'Adapta su mensaje al público al que se dirige.',
        'Informa a tiempo los avances y los problemas de su trabajo.',
      ],
      [
        'Comunica las decisiones del área explicando sus motivos.',
        'Abre espacios para que su equipo exprese sus opiniones.',
      ],
    ],
  ),
  competenciaDeEjemplo(
    'EJ-05',
    'Planificación y organización',
    'Capacidad para definir prioridades, organizar los recursos y cumplir los plazos del trabajo propio y del equipo.',
    [
      [
        'Organiza sus tareas diarias según su prioridad.',
        'Mantiene ordenada la información y los documentos de su trabajo.',
      ],
      [
        'Planifica sus actividades del mes y prevé los recursos que necesita.',
        'Reorganiza su trabajo cuando cambian las prioridades.',
      ],
      [
        'Elabora el plan de trabajo del área con metas, responsables y plazos.',
        'Evalúa el avance del plan y lo ajusta cuando es necesario.',
      ],
    ],
  ),
];

@Injectable()
export class PlantillaService {
  constructor(private readonly prisma: PrismaService) {}

  async construir(tipo: TipoPlantilla, idEmpresa: number) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: { idEmpresaEmpleadora: idEmpresa, estado: true },
      select: { nombreEmpresa: true },
    });
    if (!empresa) throw new BadRequestException('Empresa no encontrada.');
    if (tipo === 'objetivos')
      return this.objetivos(idEmpresa, empresa.nombreEmpresa);
    if (tipo === 'competencias')
      return this.competencias(idEmpresa, empresa.nombreEmpresa);
    return this.estructura(tipo, idEmpresa, empresa.nombreEmpresa);
  }

  // ── Objetivos ───────────────────────────────────────────────────────
  private async objetivos(idEmpresa: number, nombreEmpresa: string) {
    const campana = await campanaEnCurso(this.prisma, idEmpresa);
    // Solo los activos: son los que pueden tener objetivos. Con lo que ayuda
    // a definir sus metas (dónde trabaja, quién lo evalúa, si ya tiene).
    const trabajadores = await this.prisma.empleado.findMany({
      where: {
        idEmpresaEmpleadora: idEmpresa,
        estado: true,
        situacion: 'ACTIVO',
      },
      select: {
        codigoEmpleado: true,
        nombres: true,
        apellidos: true,
        codigoEmpleadoJefe: true,
        usuario: { select: { rol: true } },
        puestoEmpleadora: { select: { descripcion: true } },
        unidadOcupacionalEmpleadora: { select: { descripcion: true } },
        areaEmpleadora: { select: { descripcion: true } },
        gerenciaEmpleadora: { select: { descripcion: true } },
        objetivos: {
          where: {
            estado: true,
            idCampanaEvaluacion: campana?.idCampanaEvaluacion ?? -1,
          },
          select: { _count: { select: { objetivoDetalles: true } } },
        },
      },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    });
    const nombrePorCodigo = new Map(
      trabajadores.map((t) => [
        t.codigoEmpleado,
        `${t.apellidos}, ${t.nombres}`,
      ]),
    );
    const fecha = (d?: Date | null) =>
      d ? d.toISOString().slice(0, 10).split('-').reverse().join('/') : null;
    const plazo =
      campana &&
      fecha(campana.fechaVigenciaInicioObjetivo) &&
      fecha(campana.fechaVigenciaFinObjetivo)
        ? ` Los objetivos se definen del ${fecha(campana.fechaVigenciaInicioObjetivo)} al ${fecha(campana.fechaVigenciaFinObjetivo)}.`
        : '';
    const columnas: ColumnaPlantilla[] = [
      {
        titulo: 'Código de empleado',
        breve: 'De «Trabajadores registrados»',
        requerida: true,
        queVa:
          'El código del trabajador: búsquelo en la hoja «Trabajadores registrados» (tiene filtros por nombre, puesto, área o jefe). Una fila por objetivo: repita el código en cada objetivo del mismo trabajador.',
        ejemplo: trabajadores[0]?.codigoEmpleado ?? '45871236',
        ancho: 22,
        texto: true,
      },
      {
        titulo: 'Objetivo',
        breve: 'Un resultado medible',
        requerida: true,
        queVa:
          'Qué se quiere lograr, con su plazo (metodología SMART). Hasta 1000 caracteres.',
        ejemplo: 'Reducir los reclamos por facturación',
        ancho: 44,
      },
      {
        titulo: 'Iniciativa',
        breve: 'Opcional',
        requerida: false,
        queVa: 'Cómo se va a lograr.',
        ejemplo: 'Plan de mantenimiento preventivo',
        ancho: 32,
      },
      {
        titulo: 'Tipo de cálculo',
        breve: 'Elija de la lista',
        requerida: true,
        queVa:
          'ASCENDENTE: más es mejor. DESCENDENTE: menos es mejor (la meta es un máximo). MANUAL: el jefe indica el % al calificar.',
        ejemplo: 'DESCENDENTE',
        ancho: 18,
        opciones: ['ASCENDENTE', 'DESCENDENTE', 'MANUAL'],
      },
      {
        titulo: 'Unidad de medida',
        breve: 'Elija de la lista',
        requerida: true,
        queVa: `En qué se mide: ${UNIDADES.join(', ')}.`,
        ejemplo: 'Cantidad',
        ancho: 18,
        opciones: UNIDADES,
      },
      {
        titulo: 'Peso (%)',
        breve: 'Suman 100 por trabajador',
        requerida: true,
        queVa:
          'Cuánto vale el objetivo. Los objetivos de un mismo trabajador suman 100.',
        ejemplo: '60',
        ancho: 14,
        numero: { min: 0.01, max: 100 },
      },
      {
        titulo: 'Meta a alcanzar',
        breve: 'Número, en la unidad',
        requerida: true,
        queVa:
          'El número que se quiere lograr. Mayor que 0 si el cálculo es ascendente.',
        ejemplo: '4',
        ancho: 16,
        numero: { min: 0 },
      },
      {
        titulo: 'Fecha límite',
        breve: 'dd/mm/aaaa',
        requerida: true,
        queVa: 'Hasta cuándo hay para lograrla.',
        ejemplo: '31/12/2026',
        ancho: 18,
        fecha: { futura: true },
      },
    ];
    return construirPlantilla({
      titulo: `Importación de objetivos · ${nombreEmpresa}`,
      pasos: [
        'Escriba un objetivo por fila en la hoja «Objetivos», debajo de los títulos. Los objetivos de un mismo trabajador llevan el mismo código.',
        'Las columnas con * son obligatorias. No cambie ni borre los títulos.',
        'El código de cada trabajador está en la hoja «Trabajadores registrados», con su puesto, grupo ocupacional, área, gerencia y jefe: úselos para definir objetivos que correspondan a lo que hace. Tiene filtros para buscar.',
        'Tipo de cálculo y unidad tienen lista desplegable; la fecha va como dd/mm/aaaa.',
        'Los pesos de los objetivos de cada trabajador deben sumar 100.',
        `Quien ya tiene objetivos en la campaña en curso se omite (columna «¿Ya tiene objetivos?» de «Trabajadores registrados»).${
          campana
            ? ` Campaña en curso: «${campana.nombre}».${plazo}`
            : ' La empresa no tiene campaña en curso: ábrala antes de importar.'
        }`,
        'La hoja trae diez objetivos de ejemplo de tres trabajadores ficticios (EJEMPLO-01 a 03). Bórrelos o escriba encima; mientras el objetivo termine en «(Ejemplo)» no se importa.',
        'Suba el archivo en TeamWork: antes de guardar se muestra qué pasará con cada trabajador.',
      ],
      hoja: 'Objetivos',
      columnas,
      ejemplos: EJEMPLO_OBJETIVOS.map((e) => [
        e.codigo,
        `${e.meta} (Ejemplo)`,
        e.iniciativa,
        e.tipo,
        e.unidad,
        e.peso,
        e.valor,
        finDeMes(e.meses),
      ]),
      // Sin enlazar a la hoja de datos (pedido explícito): se consulta y se
      // filtra; sus títulos no coinciden con los de «Objetivos», así el
      // lector no la confunde con la hoja de datos.
      referencias: [
        {
          nombre: 'Trabajadores registrados',
          titulos: [
            'Código',
            'Apellidos y nombres',
            'Puesto',
            'Grupo ocupacional',
            'Área',
            'Gerencia',
            'Rol',
            'Jefe',
            '¿Ya tiene objetivos?',
            'Objetivos en la campaña',
          ],
          anchos: [18, 36, 34, 22, 28, 28, 11, 36, 20, 20],
          filas: trabajadores.map((t) => {
            const metas = t.objetivos.reduce(
              (n, o) => n + o._count.objetivoDetalles,
              0,
            );
            const jefe = t.codigoEmpleadoJefe
              ? `${nombrePorCodigo.get(t.codigoEmpleadoJefe) ?? 'Sin registro'} (${t.codigoEmpleadoJefe})`
              : 'Sin jefe';
            return [
              t.codigoEmpleado,
              `${t.apellidos}, ${t.nombres}`,
              t.puestoEmpleadora?.descripcion ?? '',
              t.unidadOcupacionalEmpleadora?.descripcion ?? '',
              t.areaEmpleadora?.descripcion ?? '',
              t.gerenciaEmpleadora?.descripcion ?? '',
              t.usuario?.rol === 'JEFE' ? 'Jefe' : 'Empleado',
              jefe,
              t.objetivos.length ? 'Sí' : 'No',
              metas,
            ];
          }),
        },
      ],
    });
  }

  // ── Competencias ────────────────────────────────────────────────────
  private async competencias(idEmpresa: number, nombreEmpresa: string) {
    const registradas = await this.prisma.competencia.findMany({
      where: { idEmpresaEmpleadora: idEmpresa, estado: true },
      select: { codigo: true, titulo: true },
      orderBy: { codigo: 'asc' },
    });
    const codigo = (queVa: string): ColumnaPlantilla => ({
      titulo: 'Código',
      breve: 'Único en la empresa',
      requerida: true,
      queVa,
      ejemplo: 'ORI-01',
      ancho: 14,
      texto: true,
    });
    const competencias: ColumnaPlantilla[] = [
      codigo(
        'Identifica la competencia; no se repite con las ya registradas. Hasta 20 caracteres.',
      ),
      {
        titulo: 'Título',
        breve: 'Hasta 150 caracteres',
        requerida: true,
        queVa: 'Nombre de la competencia.',
        ejemplo: 'Orientación a resultados',
        ancho: 34,
      },
      {
        titulo: 'Definición',
        breve: 'Qué es la competencia',
        requerida: true,
        queVa: 'Qué es la competencia. Hasta 2000 caracteres.',
        ejemplo:
          'Logra los objetivos con los estándares de calidad y plazos acordados.',
        ancho: 60,
      },
    ];
    const comportamientos: ColumnaPlantilla[] = [
      {
        ...codigo(
          'El código de la competencia, escrito igual que en la hoja «Competencias».',
        ),
        breve: 'El de la hoja «Competencias»',
      },
      {
        titulo: 'Nivel',
        breve: 'Número de 1 a 10',
        requerida: true,
        queVa:
          'Grado de exigencia del comportamiento. Cada nivel necesita al menos un comportamiento.',
        ejemplo: '1',
        ancho: 10,
        numero: { min: 1, max: 10, entero: true },
      },
      {
        titulo: 'Comportamiento',
        breve: 'Uno por fila',
        requerida: true,
        queVa:
          'Lo que se califica en ese nivel: una conducta observable. Hasta 1000 caracteres.',
        ejemplo: 'Cumple los plazos acordados con su equipo.',
        ancho: 70,
      },
    ];
    return construirPlantilla({
      titulo: `Importación de competencias · ${nombreEmpresa}`,
      pasos: [
        'En la hoja «Competencias» escriba una fila por competencia: código, título y definición.',
        'En la hoja «Comportamientos» escriba una fila por comportamiento: el código de su competencia, el nivel y el comportamiento.',
        'El código une las dos hojas: escríbalo igual en ambas. Al subir el archivo se avisa si un comportamiento tiene un código que no está en «Competencias» o si una competencia se quedó sin comportamientos.',
        'Las columnas con * son obligatorias. No cambie ni borre los títulos.',
        'El nivel va de 1 a 10. Los códigos que ya existen (hoja «Competencias registradas») se omiten.',
        'Las hojas traen cinco competencias de ejemplo, con tres niveles y dos comportamientos por nivel. Bórrelas de las dos hojas o escriba encima; mientras su título termine en «(Ejemplo)» no se importan.',
        'Suba el archivo en TeamWork: antes de guardar se muestra qué pasará con cada competencia.',
      ],
      hoja: 'Competencias',
      columnas: competencias,
      ejemplos: EJEMPLO_COMPETENCIAS.map((c) => [
        c.codigo,
        c.titulo,
        c.definicion,
      ]),
      otrasHojas: [
        {
          hoja: 'Comportamientos',
          columnas: comportamientos,
          ejemplos: EJEMPLO_COMPETENCIAS.flatMap((c) =>
            c.niveles.flatMap((comportamientosNivel, n) =>
              comportamientosNivel.map((texto) => [c.codigo, n + 1, texto]),
            ),
          ),
        },
      ],
      referencias: [
        {
          nombre: 'Competencias registradas',
          titulos: ['Código', 'Título'],
          anchos: [16, 56],
          filas: registradas.map((c) => [c.codigo, c.titulo]),
        },
      ],
    });
  }

  // ── Estructura ──────────────────────────────────────────────────────
  private async estructura(
    tipo: 'gerencias' | 'areas' | 'grupos-ocupacionales' | 'puestos',
    idEmpresa: number,
    nombreEmpresa: string,
  ) {
    const t = ESTRUCTURA[tipo];
    const donde = {
      where: { idEmpresaEmpleadora: idEmpresa, estado: true },
      orderBy: { descripcion: 'asc' as const },
    };
    const existentes: [number, string][] =
      tipo === 'gerencias'
        ? (await this.prisma.gerenciaEmpleadora.findMany(donde)).map((x) => [
            x.idGerenciaEmpleadora,
            x.descripcion,
          ])
        : tipo === 'areas'
          ? (await this.prisma.areaEmpleadora.findMany(donde)).map((x) => [
              x.idAreaEmpleadora,
              x.descripcion,
            ])
          : tipo === 'puestos'
            ? (await this.prisma.puestoEmpleadora.findMany(donde)).map((x) => [
                x.idPuestoEmpleadora,
                x.descripcion,
              ])
            : (
                await this.prisma.unidadOcupacionalEmpleadora.findMany(donde)
              ).map((x) => [x.idUnidadOcupacionalEmpleadora, x.descripcion]);
    return construirPlantilla({
      titulo: `Importación de ${t.plural} · ${nombreEmpresa}`,
      pasos: [
        `Escriba un nombre de ${t.singular} por fila en la hoja «${t.hoja}», debajo del título.`,
        'No cambie ni borre el título.',
        `Los nombres que ya existen (hoja «${t.registrados}») y los repetidos en el archivo se omiten.`,
        `La hoja trae diez ${t.plural} de ejemplo. Puede borrar esas filas o escribir encima; mientras el nombre termine en «(Ejemplo)» no se importan.`,
        'Suba el archivo en TeamWork: antes de guardar se muestra qué pasará con cada fila.',
      ],
      hoja: t.hoja,
      columnas: [
        {
          titulo: 'Nombre',
          breve: 'Entre 3 y 100 caracteres',
          requerida: true,
          queVa:
            'El nombre, tal como se verá en TeamWork. No se repite en la empresa.',
          ejemplo: t.ejemplo,
          ancho: 60,
        },
      ],
      ejemplos: t.ejemplos.map((nombre) => [`${nombre} (Ejemplo)`]),
      referencias: [
        {
          nombre: t.registrados,
          titulos: ['ID', 'Nombre'],
          anchos: [10, 60],
          filas: existentes,
        },
      ],
    });
  }
}
