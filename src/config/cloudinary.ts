import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const logger = new Logger('Cloudinary');

/**
 * Carpeta raíz de este entorno (`CLOUDINARY_CARPETA_RAIZ`), con una carpeta
 * por módulo debajo: `teamwork-local/evidencias`. Vacía en producción, donde
 * los archivos siguen en `evidencias`, `empresas`… como siempre.
 *
 * Existe porque la cuenta de Cloudinary es la misma en local y en producción,
 * y la base local es una copia de la de producción: sin una raíz propia, borrar
 * una evidencia en una prueba borraba el archivo real.
 */
let carpetaRaiz = '';

/** La carpeta de un módulo en este entorno: `teamwork-local/evidencias`. */
export const carpetaDe = (modulo: string) =>
  carpetaRaiz ? `${carpetaRaiz}/${modulo}` : modulo;

/**
 * Borra un archivo de Cloudinary, **solo si es de este entorno**: con una
 * raíz configurada, lo que está fuera de ella (los archivos que trae la copia
 * de producción) no se toca. Nunca lanza: devuelve si se intentó borrar.
 */
export async function borrarArchivo(
  publicId: string | null | undefined,
): Promise<boolean> {
  if (!publicId || !cloudinary.config().cloud_name) return false;
  if (carpetaRaiz && !publicId.startsWith(`${carpetaRaiz}/`)) {
    logger.warn(
      `No se borra «${publicId}»: está fuera de la carpeta de este entorno (${carpetaRaiz}).`,
    );
    return false;
  }
  // `destroy` no acepta `resource_type: 'auto'` (antes se le pasaba y el
  // archivo nunca se borraba): se prueba cada tipo hasta que uno lo encuentre.
  // Un PDF o una imagen son `image`; Word, Excel y PowerPoint, `raw`.
  for (const tipo of ['image', 'raw', 'video'] as const) {
    try {
      const r = await cloudinary.uploader.destroy(publicId, {
        resource_type: tipo,
      });
      if (r?.result === 'ok') return true;
    } catch (e) {
      logger.warn(`No se pudo borrar «${publicId}» (${tipo}): ${e}`);
    }
  }
  logger.warn(`«${publicId}» no se encontró en Cloudinary.`);
  return false;
}

/** Vigencia de un enlace firmado de PDF: alcanza para una jornada de trabajo. */
const VIGENCIA_ENLACE_PDF_S = 12 * 60 * 60;

const PDF_DE_CLOUDINARY =
  /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw)\/upload\/(?:v\d+\/)?(.+\.pdf)$/i;

/**
 * Enlace con el que el navegador puede abrir un archivo guardado.
 *
 * La cuenta de Cloudinary **no entrega PDF por su URL pública** (ajuste de
 * seguridad «Allow delivery of PDF and ZIP files» desactivado: responde 401,
 * subido como `image` o como `raw`), así que un PDF de evidencia o de un hito
 * no se podía abrir. A los PDF se les da un enlace de descarga firmado
 * (`private_download_url`, se abre en el navegador) con vigencia de 12 h;
 * imágenes y documentos de Office se entregan igual que siempre. En la base
 * se sigue guardando la URL pública: la firma se pone al responder.
 */
export function enlaceDeEntrega(url: string): string {
  const m = PDF_DE_CLOUDINARY.exec(url);
  const config = cloudinary.config();
  if (!m || !config.api_secret || m[1] !== config.cloud_name) return url;
  const [, , tipo, ruta] = m;
  let publicId: string;
  try {
    publicId = decodeURIComponent(ruta);
  } catch {
    return url;
  }
  // En `image` la extensión es el formato; en `raw`, parte del public_id.
  const esImagen = tipo === 'image';
  return cloudinary.utils.private_download_url(
    esImagen ? publicId.replace(/\.pdf$/i, '') : publicId,
    esImagen ? 'pdf' : '',
    {
      resource_type: tipo,
      type: 'upload',
      expires_at: Math.floor(Date.now() / 1000) + VIGENCIA_ENLACE_PDF_S,
    },
  );
}

/**
 * Carga las credenciales en el SDK de Cloudinary.
 *
 * Antes esto se hacía en el cuerpo del módulo, leyendo `process.env` al
 * importarlo. Ese import se resuelve mientras Node carga la cadena de
 * `app.module.ts`, o sea **antes** de que `ConfigModule.forRoot()` llegue a
 * leer los archivos `.env`: el SDK se quedaba con las tres claves en
 * `undefined` para siempre y cualquier subida respondía 500 en pocos
 * milisegundos, sin llegar a salir a la red. Con `cloudinary.config()` dentro
 * del módulo el problema no se ve en ningún log, porque nada falla al
 * arrancar.
 *
 * Se llama desde `main.ts`, una vez que `ConfigService` ya existe. El
 * `CloudinaryStorage` de los interceptores guarda una referencia a este mismo
 * objeto y lo lee al subir, así que configurarlo después funciona.
 */
export function configurarCloudinary(config: ConfigService): void {
  const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
  const apiKey = config.get<string>('CLOUDINARY_API_KEY');
  const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
  carpetaRaiz = (config.get<string>('CLOUDINARY_CARPETA_RAIZ') ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '');

  if (!cloudName || !apiKey || !apiSecret) {
    // La validación de entorno ya avisó cuáles faltan; acá solo se deja
    // constancia de que las subidas van a fallar.
    logger.warn('Sin credenciales: las subidas de archivos van a fallar.');
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  logger.log(
    `Configurado (cloud: ${cloudName}${carpetaRaiz ? `, carpeta: ${carpetaRaiz}/<módulo>` : ''}).`,
  );
}

export default cloudinary;
