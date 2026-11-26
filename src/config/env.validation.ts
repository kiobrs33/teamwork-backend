import { Logger } from '@nestjs/common';

/**
 * Validación de las variables de entorno, en el arranque.
 *
 * Antes no había ninguna y `ConfigModule` buscaba un `.env.${NODE_ENV}` que no
 * existía: Nest arrancaba con `JWT_SECRET_KEY` en `undefined`, `JwtModule` se
 * quedaba sin secreto y el login fallaba sin que nada en el log dijera por qué.
 * El backend además caía al puerto 3000 y la SPA, que busca el 4055, dejaba de
 * conectar. Los dos síntomas apuntaban a cualquier lado menos a la causa.
 *
 * Ahora una variable requerida ausente tumba el arranque con el nombre exacto.
 */

const logger = new Logger('Entorno');

/** Sin esto la aplicación no puede funcionar: mejor no arrancar. */
const REQUERIDAS = ['DATABASE_URL', 'JWT_SECRET_KEY'] as const;

/**
 * Se usan al subir el logo de una empresa. Faltando, el backend levanta
 * igual y solo esa función falla, así que avisa en vez de tumbar el arranque.
 */
const OPCIONALES_CON_AVISO = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

/** El front espera la API acá (`VITE_API_URL`). */
const PORT_POR_DEFECTO = '4055';
const JWT_EXPIRATION_POR_DEFECTO = '7d';

export function validarEntorno(config: Record<string, unknown>) {
  const entorno = String(config.NODE_ENV ?? 'development');

  const vacia = (clave: string) =>
    config[clave] === undefined || String(config[clave]).trim() === '';

  const faltantes = REQUERIDAS.filter(vacia);

  if (faltantes.length > 0) {
    throw new Error(
      [
        `Faltan variables de entorno requeridas: ${faltantes.join(', ')}.`,
        `NODE_ENV=${entorno}, así que se leyó .env.${entorno} y, como base, .env.`,
        'En local: copiá .env.example y repartí las claves como indica su cabecera.',
        'En producción: cargalas en el panel de la plataforma de despliegue.',
      ].join(' '),
    );
  }

  const sinCloudinary = OPCIONALES_CON_AVISO.filter(vacia);

  if (sinCloudinary.length > 0) {
    logger.warn(
      `Sin ${sinCloudinary.join(', ')}: la subida del logo de empresa va a fallar.`,
    );
  }

  if (vacia('APISPERU_TOKEN')) {
    logger.warn(
      'Sin APISPERU_TOKEN: la búsqueda por DNI y RUC de los formularios queda desactivada.',
    );
  }

  const puerto = String(config.PORT ?? '').trim() || PORT_POR_DEFECTO;

  if (!/^\d+$/.test(puerto)) {
    throw new Error(`PORT debe ser un número; llegó "${String(config.PORT)}".`);
  }

  if (vacia('PORT')) {
    logger.warn(`Sin PORT definido: se usa el ${PORT_POR_DEFECTO}.`);
  }

  // Lo devuelto es lo que `ConfigService` expone, así que acá quedan aplicados
  // los valores por defecto en vez de repetir `?? 4055` en cada lectura.
  return {
    ...config,
    NODE_ENV: entorno,
    PORT: puerto,
    JWT_EXPIRATION:
      String(config.JWT_EXPIRATION ?? '').trim() || JWT_EXPIRATION_POR_DEFECTO,
  };
}
