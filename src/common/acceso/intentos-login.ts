import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Límite de intentos fallidos de inicio de sesión, en memoria.
 *
 * Con el DNI como usuario (fácil de conocer), sin límite se podían probar
 * contraseñas sin parar. Se cuenta por usuario (5 fallos) y por IP (20, para
 * quien prueba muchos usuarios); al pasarse, bloqueo de 15 minutos.
 *
 * Limitación conocida: vive en la memoria del proceso. Se reinicia al
 * reiniciar el backend y no se comparte si algún día hay varias instancias
 * (entonces, moverlo a Redis o a la base).
 */
const VENTANA_MS = 15 * 60 * 1000;
const BLOQUEO_MS = 15 * 60 * 1000;
const LIMITE = { usuario: 5, ip: 20 } as const;

interface Registro {
  fallos: number[];
  bloqueadoHasta?: number;
}

const registros = new Map<string, Registro>();

const clave = (tipo: keyof typeof LIMITE, valor: string) =>
  `${tipo}:${valor.trim().toLowerCase()}`;

const minutos = (ms: number) => Math.max(1, Math.ceil(ms / 60000));

/** 429 si el usuario o la IP están bloqueados. */
export const exigirSinBloqueo = (usuario: string, ip: string) => {
  const ahora = Date.now();
  for (const k of [clave('usuario', usuario), clave('ip', ip)]) {
    const r = registros.get(k);
    if (r?.bloqueadoHasta && r.bloqueadoHasta > ahora)
      throw new HttpException(
        (() => {
          const m = minutos(r.bloqueadoHasta - ahora);
          return `Demasiados intentos fallidos. Intente de nuevo en ${m} ${m === 1 ? 'minuto' : 'minutos'}.`;
        })(),
        HttpStatus.TOO_MANY_REQUESTS,
      );
  }
};

/** Anota un intento fallido (contraseña o usuario incorrectos). */
export const registrarFallo = (usuario: string, ip: string) => {
  const ahora = Date.now();
  for (const [tipo, valor] of [
    ['usuario', usuario],
    ['ip', ip],
  ] as const) {
    const k = clave(tipo, valor);
    const r = registros.get(k) ?? { fallos: [] };
    r.fallos = [...r.fallos.filter((t) => ahora - t < VENTANA_MS), ahora];
    if (r.fallos.length >= LIMITE[tipo]) {
      r.bloqueadoHasta = ahora + BLOQUEO_MS;
      r.fallos = [];
    }
    registros.set(k, r);
  }
  // Limpieza: que el mapa no crezca sin fin.
  if (registros.size > 10000)
    for (const [k, r] of registros)
      if (!r.fallos.length && (r.bloqueadoHasta ?? 0) < ahora)
        registros.delete(k);
};

/** Un ingreso correcto borra los fallos de ese usuario. */
export const limpiarFallos = (usuario: string) =>
  registros.delete(clave('usuario', usuario));
