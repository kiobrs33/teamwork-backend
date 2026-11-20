import * as ExcelJS from 'exceljs';
import type { Response } from 'express';

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
}

export interface HojaExcel {
  nombre: string;
  columnas: ColumnaExcel[];
  filas: Record<string, unknown>[];
}

/**
 * Arma un libro con el formato común de todas las exportaciones: cabecera en
 * negrita, autofiltro sobre todas las columnas y cabecera fija al bajar.
 * Cada exportación lo repetía a mano y el autofiltro llegó a quedarse corto.
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

    ws.getRow(1).font = { bold: true };
    if (ws.columnCount > 0) {
      const ultima = ws.getColumn(ws.columnCount).letter;
      ws.autoFilter = { from: 'A1', to: `${ultima}1` };
    }
    ws.views = [{ state: 'frozen', ySplit: 1 }];
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
