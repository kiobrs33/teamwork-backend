import * as ExcelJS from 'exceljs';

/**
 * El encabezado de todos los Excel de TeamWork, plantillas y exportaciones:
 * título en negrita y, si la columna lo pide, una línea breve en gris debajo
 * (formato, unidad o "Elija de la lista"), sobre fondo gris claro y con
 * bordes finos. Es el diseño de la plantilla de trabajadores.
 *
 * Los lectores de importación toman solo la PRIMERA línea de la celda como
 * nombre de la columna, así que la línea gris no estorba al reimportar.
 */

export const GRIS_CABECERA = 'FFF5F5F5';
export const GRIS_TEXTO = 'FF8C8C8C';

export const bordeFino: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
};

/** Letra de la columna n (1 → A, 27 → AA). */
export const letraColumna = (n: number) => {
  let s = '';
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26))
    s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
  return s;
};

/** Fondo gris, bordes y negrita en una fila de títulos (sin línea gris). */
export const estiloCabecera = (fila: ExcelJS.Row) => {
  fila.font = { bold: true };
  fila.eachCell((c) => {
    c.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: GRIS_CABECERA },
    };
    c.border = bordeFino;
    // Centrado en vertical: arriba, en una fila de una línea el título
    // quedaba pegado al borde y la flecha del autofiltro abajo, con un
    // hueco entre los dos.
    c.alignment = { vertical: 'middle', wrapText: true };
  });
};

/**
 * Aplica el encabezado común a la fila 1 de una hoja ya armada.
 *
 * - `breves[i]`: línea gris bajo el título de la columna i (opcional).
 * - Autofiltro sobre todas las columnas.
 * - **Sin fijar la fila de títulos**: se pidió así para las exportaciones.
 */
export const aplicarCabecera = (
  ws: ExcelJS.Worksheet,
  breves: (string | undefined)[] = [],
  { autofiltro = true }: { autofiltro?: boolean } = {},
) => {
  const fila = ws.getRow(1);
  const total = ws.columnCount;
  for (let i = 1; i <= total; i++) {
    const celda = fila.getCell(i);
    const titulo =
      celda.value === null || celda.value === undefined
        ? ''
        : String(
            typeof celda.value === 'object' && 'richText' in celda.value
              ? celda.value.richText
                  .map((r) => r.text)
                  .join('')
                  .split('\n')[0]
              : celda.value,
          );
    const breve = breves[i - 1];
    celda.value = breve
      ? {
          richText: [
            { text: titulo, font: { bold: true } },
            {
              text: `\n${breve}`,
              font: { size: 9, color: { argb: GRIS_TEXTO } },
            },
          ],
        }
      : titulo;
  }
  estiloCabecera(fila);
  fila.height = breves.some(Boolean) ? 32 : 20;
  if (autofiltro && total > 0) {
    ws.autoFilter = { from: 'A1', to: `${letraColumna(total)}1` };
  }
  ws.views = [];
};
