import * as ExcelJS from 'exceljs';
import {
  aplicarCabecera,
  bordeFino,
  estiloCabecera,
  letraColumna,
} from './estilo-excel';

/**
 * Plantillas de importación con el mismo formato en todos los módulos (el de
 * trabajadores):
 *
 * - Hoja **Instrucciones**: pasos y una tabla «Columna · Obligatoria · Qué va
 *   · Ejemplo».
 * - Hoja de **datos**: solo los títulos (negrita, `*` si es obligatoria y una
 *   línea gris breve debajo). Aquí se escribe.
 * - Hojas de **referencia**: lo que ya existe en la empresa y alimenta las
 *   listas desplegables.
 *
 * Se arma en el servidor porque lleva listas desplegables, que la librería
 * del front no sabe escribir. Los lectores del front toman solo la primera
 * línea de cada título.
 */

/** Filas con listas desplegables y validaciones. */
const FILAS = 1000;

export interface ColumnaPlantilla {
  titulo: string;
  /** Debajo del título, en gris: formato o "Elija de la lista". */
  breve: string;
  requerida: boolean;
  queVa: string;
  ejemplo: string;
  ancho: number;
  /** Texto: conserva ceros a la izquierda (documentos y códigos). */
  texto?: boolean;
  /** Lista fija: se exige elegir de ella. */
  opciones?: string[];
  /** Fecha dd/mm/aaaa. `futura: false` = no posterior a hoy. */
  fecha?: { futura: boolean };
  /** Número entero o decimal dentro de un rango. */
  numero?: { min: number; max?: number; entero?: boolean };
  /**
   * Lista tomada de la primera columna de una hoja de referencia. Es una
   * sugerencia (no se exige): también vale escribir el ID o el código.
   */
  hoja?: string;
}

export interface HojaReferencia {
  nombre: string;
  titulos: string[];
  filas: unknown[][];
  anchos?: number[];
}

export interface DefinicionPlantilla {
  /** Título de la hoja de instrucciones. */
  titulo: string;
  pasos: string[];
  /** Nombre de la hoja donde se escribe. */
  hoja: string;
  columnas: ColumnaPlantilla[];
  referencias?: HojaReferencia[];
  /**
   * Filas de ejemplo ya escritas en la hoja de datos, con el formato normal
   * (quien llena la plantilla las borra o escribe encima). Deben llevar la
   * marca «(Ejemplo)» que el importador reconoce y omite.
   */
  ejemplos?: (string | number | Date)[][];
  /**
   * Más hojas de datos, después de la primera (competencias: «Comportamientos»).
   * No se enlazan entre sí: el importador comprueba que los datos coincidan.
   */
  otrasHojas?: HojaDatos[];
}

export interface HojaDatos {
  hoja: string;
  columnas: ColumnaPlantilla[];
  ejemplos?: (string | number | Date)[][];
}

const titulo = (c: ColumnaPlantilla) => `${c.titulo}${c.requerida ? ' *' : ''}`;

type ConValidaciones = {
  dataValidations: {
    add: (rango: string, v: ExcelJS.DataValidation) => void;
  };
};

export async function construirPlantilla(def: DefinicionPlantilla) {
  const libro = new ExcelJS.Workbook();

  // ── Instrucciones ─────────────────────────────────────────────────────
  const ins = libro.addWorksheet('Instrucciones');
  ins.columns = [{ width: 26 }, { width: 13 }, { width: 70 }, { width: 24 }];
  ins.addRow([def.titulo]).font = { bold: true, size: 14 };
  ins.addRow([]);
  def.pasos.forEach((paso, i) => ins.addRow([`${i + 1}. ${paso}`]));
  ins.addRow([]);
  const datos: HojaDatos[] = [
    { hoja: def.hoja, columnas: def.columnas, ejemplos: def.ejemplos },
    ...(def.otrasHojas ?? []),
  ];
  datos.forEach((d, n) => {
    if (datos.length > 1) {
      if (n > 0) ins.addRow([]);
      ins.addRow([`Hoja «${d.hoja}»`]).font = { bold: true };
    }
    estiloCabecera(ins.addRow(['Columna', 'Obligatoria', 'Qué va', 'Ejemplo']));
    for (const c of d.columnas) {
      const fila = ins.addRow([
        c.titulo,
        c.requerida ? 'Sí' : 'No',
        c.queVa,
        c.ejemplo,
      ]);
      fila.alignment = { vertical: 'top', wrapText: true };
      fila.eachCell((celda) => (celda.border = bordeFino));
    }
  });

  // ── Hojas de datos ────────────────────────────────────────────────────
  const hojas = datos.map((d) => {
    const hoja = libro.addWorksheet(d.hoja);
    hoja.columns = d.columnas.map((c) => ({
      header: titulo(c),
      width: c.ancho,
      style: c.texto
        ? { numFmt: '@' }
        : c.fecha
          ? { numFmt: 'dd/mm/yyyy' }
          : {},
    }));
    // En la plantilla no hace falta autofiltro.
    aplicarCabecera(
      hoja,
      d.columnas.map((c) => c.breve),
      { autofiltro: false },
    );
    for (const ejemplo of d.ejemplos ?? []) {
      hoja.addRow(ejemplo).alignment = { vertical: 'top', wrapText: true };
    }
    return hoja;
  });

  // ── Referencias ───────────────────────────────────────────────────────
  const cuantos: Record<string, number> = {};
  for (const ref of def.referencias ?? []) {
    const h = libro.addWorksheet(ref.nombre.slice(0, 31));
    h.columns = ref.titulos.map((t, i) => ({
      header: t,
      width: ref.anchos?.[i] ?? (i === 0 ? 56 : i === 1 ? 44 : 14),
    }));
    ref.filas.forEach((f) => h.addRow(f));
    aplicarCabecera(h);
    cuantos[ref.nombre] = ref.filas.length;
  }

  // ── Listas desplegables y validaciones ────────────────────────────────
  datos.forEach((d, n) =>
    d.columnas.forEach((c, i) => {
      const letra = letraColumna(i + 1);
      let v: ExcelJS.DataValidation | undefined;
      if (c.opciones) {
        v = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${c.opciones.join(',')}"`],
          showErrorMessage: true,
          errorStyle: 'stop',
          errorTitle: c.titulo,
          error: `Elija una opción de la lista: ${c.opciones.join(', ')}.`,
        };
      } else if (c.fecha) {
        v = {
          type: 'date',
          operator: c.fecha.futura ? 'greaterThan' : 'between',
          allowBlank: true,
          formulae: c.fecha.futura
            ? [new Date(Date.UTC(2000, 0, 1))]
            : [new Date(Date.UTC(1950, 0, 1)), new Date()],
          showErrorMessage: true,
          errorStyle: 'stop',
          errorTitle: c.titulo,
          error: c.fecha.futura
            ? 'Escriba una fecha dd/mm/aaaa.'
            : 'Escriba una fecha dd/mm/aaaa que no sea futura.',
        };
      } else if (c.numero) {
        const { min, max, entero } = c.numero;
        v = {
          type: entero ? 'whole' : 'decimal',
          operator: max === undefined ? 'greaterThanOrEqual' : 'between',
          allowBlank: true,
          formulae: max === undefined ? [min] : [min, max],
          showErrorMessage: true,
          errorStyle: 'stop',
          errorTitle: c.titulo,
          error:
            max === undefined
              ? `Escriba un número ${entero ? 'entero ' : ''}mayor o igual que ${min}.`
              : `Escriba un número ${entero ? 'entero ' : ''}entre ${min} y ${max}.`,
        };
      } else if (c.hoja && (cuantos[c.hoja] ?? 0) > 0) {
        v = {
          type: 'list',
          allowBlank: true,
          formulae: [`'${c.hoja.slice(0, 31)}'!$A$2:$A$${cuantos[c.hoja] + 1}`],
          showErrorMessage: false,
        };
      }
      if (!v) return;
      // Un rango, no celda por celda: al agrupar celdas sueltas ExcelJS
      // ordena "A10" antes que "A2" y escribía rangos superpuestos.
      (hojas[n] as unknown as ConValidaciones).dataValidations.add(
        `${letra}2:${letra}${FILAS + 1}`,
        v,
      );
    }),
  );

  libro.views = [
    {
      activeTab: 0,
      x: 0,
      y: 0,
      width: 20000,
      height: 12000,
      firstSheet: 0,
      visibility: 'visible',
    },
  ];
  return libro.xlsx.writeBuffer();
}

/** "PROFESIONALES · ID 3": la opción de lista de una entidad con ID. */
export const opcionConId = (nombre: string, id: number) =>
  `${nombre} · ID ${id}`;

/** "JUAN PÉREZ · Cód. 40112233": la opción de lista de una persona. */
export const opcionConCodigo = (nombre: string, codigo: string) =>
  `${nombre} · Cód. ${codigo}`;
