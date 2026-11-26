import * as ExcelJS from 'exceljs';
import type { Response } from 'express';
import { aplicarCabecera } from './estilo-excel';

export interface ColumnaExcel {
  header: string;
  key: string;
  width?: number;
  /**
   * `texto` fuerza la celda como texto: un DNI o un código con ceros a la
   * izquierda escrito como número pierde los ceros, y uno alfanumérico sale
   * como NaN.
   */
  tipo?: 'texto' | 'numero' | 'fecha';
  /** Línea gris bajo el título (formato, unidad…), como en las plantillas. */
  breve?: string;
}

export interface HojaExcel {
  nombre: string;
  columnas: ColumnaExcel[];
  filas: Record<string, unknown>[];
}

/**
 * Arma un libro con el formato común de todas las exportaciones: el
 * encabezado de las plantillas (`aplicarCabecera`: negrita, línea gris
 * opcional, fondo y bordes) y autofiltro sobre todas las columnas. La fila de
 * títulos NO se fija al bajar: se pidió así.
 */
export async function construirLibroExcel(hojas: HojaExcel[]) {
  const workbook = new ExcelJS.Workbook();

  for (const hoja of hojas) {
    const ws = workbook.addWorksheet(hoja.nombre.slice(0, 31));
    ws.columns = hoja.columnas.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width ?? Math.max(12, c.header.length + 4),
      style:
        c.tipo === 'texto'
          ? { numFmt: '@' }
          : c.tipo === 'fecha'
            ? { numFmt: 'dd/mm/yyyy hh:mm' }
            : {},
    }));

    for (const fila of hoja.filas) {
      const normalizada: Record<string, unknown> = {};
      for (const c of hoja.columnas) {
        const v = fila[c.key];
        normalizada[c.key] =
          v === null || v === undefined
            ? null
            : c.tipo === 'texto'
              ? String(v)
              : v;
      }
      ws.addRow(normalizada);
    }

    aplicarCabecera(
      ws,
      hoja.columnas.map(
        (c) => c.breve ?? (c.tipo === 'fecha' ? 'dd/mm/aaaa hh:mm' : undefined),
      ),
    );
  }

  return workbook.xlsx.writeBuffer();
}

/** Envía un buffer de Excel como descarga (fuera del ResponseInterceptor). */
export function enviarExcel(res: Response, buffer: unknown, archivo: string) {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', `attachment; filename=${archivo}.xlsx`);
  res.send(buffer);
}
