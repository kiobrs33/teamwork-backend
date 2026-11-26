import { randomInt } from 'crypto';

/**
 * Contraseña inicial al azar, sin caracteres que se confunden al dictarla o
 * copiarla (0/O, 1/l/I). La misma regla que `generarContrasena` del front.
 */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

export const generarContrasena = (largo = 12) =>
  Array.from(
    { length: largo },
    () => ALFABETO[randomInt(ALFABETO.length)],
  ).join('');
