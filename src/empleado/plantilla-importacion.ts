import { PrismaService } from 'src/prisma/prisma.service';
import {
  construirPlantilla,
  type ColumnaPlantilla,
} from 'src/common/excel/plantilla-importacion';

/**
 * Plantilla de importación de trabajadores de UNA empresa, con el formato
 * común de las plantillas (`common/excel/plantilla-importacion`): hoja
 * «Instrucciones», hoja «Trabajadores» (solo los títulos) y las de
 * referencia. Gerencia, área, grupo y puesto se escriben **por su ID**: sus
 * hojas traen solo ID y Nombre, con filtros, y no están enlazadas a la hoja
 * de datos (pedido explícito: la lista «nombre · ID» se descartó). El
 * código del jefe se busca igual, en «Trabajadores registrados».
 * Los títulos son los mismos del Excel de «Exportar»: el front los reconoce
 * igual.
 */

const COLUMNAS: ColumnaPlantilla[] = [
  {
    titulo: 'Tipo de documento',
    breve: 'DNI, CE o PASAPORTE',
    requerida: false,
    queVa: 'DNI, CE o PASAPORTE. Vacío: DNI.',
    ejemplo: 'DNI',
    ancho: 18,
    opciones: ['DNI', 'CE', 'PASAPORTE'],
  },
  {
    titulo: 'Documento',
    breve: '8 dígitos si es DNI',
    requerida: true,
    queVa: 'DNI de 8 dígitos; CE o pasaporte de 6 a 12. No se repite.',
    ejemplo: '45871236',
    ancho: 14,
    texto: true,
  },
  {
    titulo: 'Nombres',
    breve: 'Nombres completos',
    requerida: true,
    queVa: 'Nombres.',
    ejemplo: 'María Elena',
    ancho: 22,
  },
  {
    titulo: 'Apellidos',
    breve: 'Ambos apellidos',
    requerida: true,
    queVa: 'Apellidos.',
    ejemplo: 'Quispe Rojas',
    ancho: 22,
  },
  {
    titulo: 'ID gerencia',
    breve: 'Número de la hoja «Gerencias»',
    requerida: true,
    queVa:
      'El ID de la gerencia: búsquelo en la hoja «Gerencias» (tiene filtros por nombre).',
    ejemplo: '12',
    ancho: 18,
    numero: { min: 1, entero: true },
  },
  {
    titulo: 'ID área',
    breve: 'Número de la hoja «Áreas»',
    requerida: true,
    queVa:
      'El ID del área: búsquelo en la hoja «Áreas» (tiene filtros por nombre).',
    ejemplo: '34',
    ancho: 18,
    numero: { min: 1, entero: true },
  },
  {
    titulo: 'ID grupo ocupacional',
    breve: 'Número de la hoja «Grupos ocupacionales»',
    requerida: true,
    queVa:
      'El ID del grupo ocupacional: búsquelo en la hoja «Grupos ocupacionales» (tiene filtros por nombre). Decide qué competencias se le evalúan.',
    ejemplo: '5',
    ancho: 18,
    numero: { min: 1, entero: true },
  },
  {
    titulo: 'ID puesto',
    breve: 'Número de la hoja «Puestos»',
    requerida: true,
    queVa:
      'El ID del puesto: búsquelo en la hoja «Puestos» (tiene filtros por nombre).',
    ejemplo: '78',
    ancho: 18,
    numero: { min: 1, entero: true },
  },
  {
    titulo: 'Código de empleado',
    breve: 'Único en la empresa',
    requerida: true,
    queVa:
      'Código del trabajador en la empresa. Puede ser su documento. No se repite.',
    ejemplo: '45871236',
    ancho: 18,
    texto: true,
  },
  {
    titulo: 'Código del jefe',
    breve: 'Vacío si no tiene',
    requerida: false,
    queVa:
      'El código de empleado de su jefe: búsquelo en la hoja «Trabajadores registrados» (filtre por rol JEFE) o use el de alguien de este archivo con rol JEFE. Vacío si no tiene.',
    ejemplo: '40112233',
    ancho: 18,
    texto: true,
  },
  {
    titulo: 'Rol',
    breve: 'EMPLEADO o JEFE',
    requerida: true,
    queVa: 'EMPLEADO o JEFE (JEFE si tendrá personas a cargo).',
    ejemplo: 'EMPLEADO',
    ancho: 12,
    opciones: ['EMPLEADO', 'JEFE'],
  },
  {
    titulo: 'Sede',
    breve: 'Sede o local',
    requerida: false,
    queVa: 'Sede o local.',
    ejemplo: 'Arequipa',
    ancho: 16,
  },
  {
    titulo: 'Fecha de ingreso',
    breve: 'dd/mm/aaaa',
    requerida: false,
    queVa:
      'Día en que ingresó a la empresa. Con ella se calcula la antigüedad, siempre al día.',
    ejemplo: '15/03/2023',
    ancho: 16,
    fecha: { futura: false },
  },
];

/**
 * Diez trabajadores de ejemplo escritos en la hoja «Trabajadores»: dos jefes
 * y ocho personas a su cargo. El código de empleado (y el del jefe) es
 * la sigla de la empresa más el número de documento, sea DNI, CE o
 * pasaporte (`siglaDeEmpresa`). Los apellidos terminan en «(Ejemplo)»: la
 * importación los reconoce y no los crea si quedan en el archivo. La
 * estructura (IDs) se toma de la propia empresa, para que la fila sea un
 * modelo real de lo que se escribe.
 */
const EJEMPLO_TRABAJADORES: {
  tipo: 'DNI' | 'CE' | 'PASAPORTE';
  documento: string;
  nombres: string;
  apellidos: string;
  /** Documento del jefe (su código se arma igual); vacío si no tiene. */
  jefe: string;
  rol: 'JEFE' | 'EMPLEADO';
  sede: string;
  ingreso: [number, number, number];
}[] = [
  {
    tipo: 'DNI',
    documento: '70000101',
    nombres: 'Carmen Rosa',
    apellidos: 'Huamán Torres',
    jefe: '',
    rol: 'JEFE',
    sede: 'Arequipa',
    ingreso: [2015, 3, 2],
  },
  {
    tipo: 'DNI',
    documento: '70000102',
    nombres: 'Jorge Luis',
    apellidos: 'Paredes Salas',
    jefe: '',
    rol: 'JEFE',
    sede: 'Arequipa',
    ingreso: [2017, 8, 14],
  },
  {
    tipo: 'DNI',
    documento: '70000103',
    nombres: 'Ana Lucía',
    apellidos: 'Mamani Quispe',
    jefe: '70000101',
    rol: 'EMPLEADO',
    sede: 'Arequipa',
    ingreso: [2019, 1, 7],
  },
  {
    tipo: 'DNI',
    documento: '70000104',
    nombres: 'Luis Alberto',
    apellidos: 'Ccori Flores',
    jefe: '70000101',
    rol: 'EMPLEADO',
    sede: 'Arequipa',
    ingreso: [2020, 6, 1],
  },
  {
    tipo: 'CE',
    documento: '001234567',
    nombres: 'Rosa María',
    apellidos: 'Apaza Condori',
    jefe: '70000101',
    rol: 'EMPLEADO',
    sede: 'Camaná',
    ingreso: [2021, 2, 15],
  },
  {
    tipo: 'DNI',
    documento: '70000106',
    nombres: 'Miguel Ángel',
    apellidos: 'Delgado Ríos',
    jefe: '70000101',
    rol: 'EMPLEADO',
    sede: 'Arequipa',
    ingreso: [2022, 9, 5],
  },
  {
    tipo: 'DNI',
    documento: '70000107',
    nombres: 'Patricia',
    apellidos: 'Valdivia Chávez',
    jefe: '70000102',
    rol: 'EMPLEADO',
    sede: 'Mollendo',
    ingreso: [2018, 11, 19],
  },
  {
    tipo: 'PASAPORTE',
    documento: 'PE4589123',
    nombres: 'Diego Armando',
    apellidos: 'Zúñiga Peña',
    jefe: '70000102',
    rol: 'EMPLEADO',
    sede: 'Arequipa',
    ingreso: [2023, 4, 3],
  },
  {
    tipo: 'DNI',
    documento: '70000109',
    nombres: 'Lucía Fernanda',
    apellidos: 'Vargas Lima',
    jefe: '70000102',
    rol: 'EMPLEADO',
    sede: 'Arequipa',
    ingreso: [2024, 1, 22],
  },
  {
    tipo: 'DNI',
    documento: '70000110',
    nombres: 'Raúl Enrique',
    apellidos: 'Cáceres Núñez',
    jefe: '70000102',
    rol: 'EMPLEADO',
    sede: 'Camaná',
    ingreso: [2025, 7, 7],
  },
];

/** Artículos y preposiciones que no aportan inicial. */
const SIN_INICIAL = new Set([
  'DE',
  'DEL',
  'LA',
  'LAS',
  'LOS',
  'EL',
  'Y',
  'E',
  'EN',
  'PARA',
  'POR',
  'A',
  'AL',
]);

/** Formas legales que no forman parte de la sigla, estén donde estén. */
const FORMA_LEGAL =
  /\b(S\.?\s?A\.?\s?C|S\.?\s?A\.?\s?A|S\.?\s?C\.?\s?R\.?\s?L|S\.?\s?R\.?\s?L|E\.?\s?I\.?\s?R\.?\s?L|S\.?\s?A)\b\.?/g;

/**
 * Sigla sugerida para la empresa, solo para los códigos de la plantilla
 * (no se guarda): sin tildes, forma legal ni números; con varias palabras,
 * sus iniciales (sin artículos); con una sola, la palabra si tiene hasta 6
 * letras o sus 4 primeras. «SEAL» → SEAL, «SAN GABÁN» → SG,
 * «DIGO TELECOM S.A.C.» → DT, «EGEMSA» → EGEMSA, «MANGUITO SAC 2026» → MANG.
 */
export const siglaDeEmpresa = (nombre: string) => {
  const limpio = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(FORMA_LEGAL, ' ');
  const palabras = limpio
    .split(/[^A-Z]+/)
    .filter((p) => p && !SIN_INICIAL.has(p));
  if (!palabras.length) return 'EMP';
  if (palabras.length === 1)
    return palabras[0].length <= 6 ? palabras[0] : palabras[0].slice(0, 4);
  return palabras
    .map((p) => p[0])
    .join('')
    .slice(0, 6);
};

export async function construirPlantillaTrabajadores(
  prisma: PrismaService,
  idEmpresa: number,
) {
  const deLaEmpresa = { idEmpresaEmpleadora: idEmpresa, estado: true };
  const orden = { descripcion: 'asc' as const };
  const [empresa, gerencias, areas, unidades, puestos, registrados] =
    await Promise.all([
      prisma.empresaEmpleadora.findUnique({
        where: { idEmpresaEmpleadora: idEmpresa },
        select: { nombreEmpresa: true },
      }),
      prisma.gerenciaEmpleadora.findMany({
        where: deLaEmpresa,
        orderBy: orden,
      }),
      prisma.areaEmpleadora.findMany({ where: deLaEmpresa, orderBy: orden }),
      prisma.unidadOcupacionalEmpleadora.findMany({
        where: deLaEmpresa,
        orderBy: orden,
      }),
      prisma.puestoEmpleadora.findMany({ where: deLaEmpresa, orderBy: orden }),
      // Los activos: entre ellos se busca al jefe (rol JEFE).
      prisma.empleado.findMany({
        where: { ...deLaEmpresa, situacion: 'ACTIVO' },
        select: {
          codigoEmpleado: true,
          nombres: true,
          apellidos: true,
          usuario: { select: { rol: true } },
          puestoEmpleadora: { select: { descripcion: true } },
        },
        orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      }),
    ]);

  /** Solo ID y nombre, ordenadas por nombre; se buscan con el filtro. */
  const conId = <T extends { descripcion: string }>(
    filas: T[],
    id: (f: T) => number,
  ) => filas.map((f) => [id(f), f.descripcion]);
  const sigla = siglaDeEmpresa(empresa?.nombreEmpresa ?? '');
  /** Sigla + documento: «SEAL-70000101». Igual para el código del jefe. */
  const codigo = (documento: string) =>
    documento ? `${sigla}-${documento}` : '';

  return construirPlantilla({
    titulo: `Importación de trabajadores · ${empresa?.nombreEmpresa ?? ''}`,
    pasos: [
      'Escriba un trabajador por fila en la hoja «Trabajadores», debajo de los títulos.',
      'Las columnas con * son obligatorias. No cambie ni borre los títulos.',
      'Gerencia, área, grupo ocupacional y puesto van por su ID: búsquelo en su hoja («Gerencias», «Áreas», «Grupos ocupacionales», «Puestos»), que tiene filtros por nombre.',
      'El código del jefe se busca en la hoja «Trabajadores registrados» (tiene filtros por rol y nombre). Tipo de documento y rol tienen lista desplegable; la fecha de ingreso va como dd/mm/aaaa.',
      'No se escriben usuario ni contraseña: el usuario es el número de documento y la contraseña la genera el sistema.',
      'La hoja trae diez trabajadores de ejemplo (dos jefes y su equipo). Bórrelos o escriba encima; mientras los apellidos terminen en «(Ejemplo)» no se importan.',
      'Suba el archivo en TeamWork: antes de crear nada se muestra qué pasará con cada fila. Al terminar se descarga el Excel con los accesos para entregar.',
    ],
    hoja: 'Trabajadores',
    // El código se propone como sigla de la empresa + documento.
    columnas: COLUMNAS.map((c) =>
      c.titulo === 'Código de empleado'
        ? {
            ...c,
            queVa: `Código del trabajador en la empresa; no se repite. Formato sugerido: la sigla de la empresa y su número de documento (${sigla}-45871236). El código del jefe se escribe igual.`,
            ejemplo: `${sigla}-45871236`,
            ancho: 22,
          }
        : c,
    ),
    // La estructura de los ejemplos es la de la empresa (rota entre sus
    // registros); si un nivel no tiene ninguno, la celda queda vacía.
    ejemplos: EJEMPLO_TRABAJADORES.map((e, i) => {
      const de = <T>(lista: T[], id: (x: T) => number) =>
        lista.length ? id(lista[i % lista.length]) : '';
      return [
        e.tipo,
        e.documento,
        e.nombres,
        `${e.apellidos} (Ejemplo)`,
        de(gerencias, (g) => g.idGerenciaEmpleadora),
        de(areas, (a) => a.idAreaEmpleadora),
        de(unidades, (u) => u.idUnidadOcupacionalEmpleadora),
        de(puestos, (p) => p.idPuestoEmpleadora),
        codigo(e.documento),
        codigo(e.jefe),
        e.rol,
        e.sede,
        new Date(Date.UTC(e.ingreso[0], e.ingreso[1] - 1, e.ingreso[2])),
      ];
    }),
    referencias: [
      {
        nombre: 'Gerencias',
        titulos: ['ID', 'Nombre'],
        anchos: [10, 56],
        filas: conId(gerencias, (g) => g.idGerenciaEmpleadora),
      },
      {
        nombre: 'Áreas',
        titulos: ['ID', 'Nombre'],
        anchos: [10, 56],
        filas: conId(areas, (a) => a.idAreaEmpleadora),
      },
      {
        nombre: 'Grupos ocupacionales',
        titulos: ['ID', 'Nombre'],
        anchos: [10, 56],
        filas: conId(unidades, (u) => u.idUnidadOcupacionalEmpleadora),
      },
      {
        nombre: 'Puestos',
        titulos: ['ID', 'Nombre'],
        anchos: [10, 56],
        filas: conId(puestos, (p) => p.idPuestoEmpleadora),
      },
      {
        // Sin columnas que coincidan con los títulos de la hoja de datos
        // («Documento», «Código de empleado»): el lector busca la hoja por
        // sus títulos.
        nombre: 'Trabajadores registrados',
        titulos: ['Código', 'Apellidos y nombres', 'Rol', 'Puesto'],
        anchos: [16, 44, 12, 44],
        filas: registrados.map((t) => [
          t.codigoEmpleado,
          `${t.apellidos}, ${t.nombres}`,
          t.usuario?.rol ?? '',
          t.puestoEmpleadora?.descripcion ?? '',
        ]),
      },
    ],
  });
}
