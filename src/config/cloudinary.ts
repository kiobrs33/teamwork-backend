import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const logger = new Logger('Cloudinary');

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

  logger.log(`Configurado (cloud: ${cloudName}).`);
}

export default cloudinary;
