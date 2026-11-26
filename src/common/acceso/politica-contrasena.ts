/**
 * Contraseñas que una persona escribe (no las generadas): se rechazan las
 * obvias. Con el DNI como usuario, la contraseña es lo único que protege la
 * cuenta, y "12345678" o el propio DNI se adivinan en segundos.
 */
const COMUNES = new Set([
  '12345678',
  '123456789',
  '1234567890',
  '87654321',
  '11111111',
  '00000000',
  'password',
  'password1',
  'contrasena',
  'contraseña',
  'qwerty123',
  'qwertyui',
  'abc12345',
  'abcd1234',
  'teamwork',
  'teamwork1',
  'admin123',
  'peru1234',
  'iloveyou',
  'welcome1',
  'bienvenido',
]);

const normal = (t: string) => t.trim().toLowerCase();

/**
 * Por qué una contraseña no sirve, o `undefined` si sirve. `datos`: lo que
 * no puede repetir (usuario, documento, nombre).
 */
export const problemaContrasena = (
  clave: string | undefined | null,
  datos: (string | undefined | null)[] = [],
): string | undefined => {
  const c = String(clave ?? '');
  if (c.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  const n = normal(c);
  if (COMUNES.has(n)) return 'La contraseña es demasiado común. Elija otra.';
  if (/^(.)\1+$/.test(c))
    return 'La contraseña no puede ser un mismo carácter repetido.';
  // 12345678, 23456789, 98765432… (secuencias de dígitos o de letras)
  const codigos = [...n].map((x) => x.charCodeAt(0));
  const sube = codigos.every((x, i) => i === 0 || x - codigos[i - 1] === 1);
  const baja = codigos.every((x, i) => i === 0 || x - codigos[i - 1] === -1);
  if (sube || baja)
    return 'La contraseña no puede ser una secuencia (12345678, abcdefgh).';
  for (const d of datos
    .map((x) => normal(String(x ?? '')))
    .filter((x) => x.length >= 4))
    if (n === d || n.includes(d))
      return 'La contraseña no puede contener su usuario, documento o nombre.';
  return undefined;
};
