// cloudinary.evidencias.storage.ts
import { BadRequestException, Logger } from '@nestjs/common';
import type { Request } from 'express';
import type { StorageEngine } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { carpetaDe } from '../../config/cloudinary';

const logger = new Logger('Archivos');

/** Cloudinary configurado (en local se deja vacío a propósito). */
const hayCloudinary = () => Boolean(cloudinary.config().cloud_name);

/**
 * Sube a Cloudinary, en la carpeta del módulo (`carpetaDe`: bajo la raíz del
 * entorno, p. ej. `teamwork-local/evidencias`). **Solo en desarrollo y sin
 * Cloudinary configurado** (la copia local de producción lo deja vacío para
 * no tocar archivos reales) no guarda el archivo: registra el dato con una URL
 * vacía para poder probar las reglas. En producción, sin Cloudinary, la
 * subida falla como siempre.
 */
export const almacenamientoArchivos = (carpeta: string): StorageEngine => {
  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    // La carpeta se resuelve al subir: la raíz del entorno se lee al
    // arrancar, después de que este módulo se importa.
    params: async (req, file) => ({
      folder: carpetaDe(carpeta),
      resource_type: 'auto',
      // Imágenes y PDF: sin extensión en el nombre, porque Cloudinary ya la
      // agrega (si no, la URL terminaba en «.png.png»). Word, Excel y
      // PowerPoint van como `raw` y la conservan para descargarse bien.
      public_id: `${carpeta}_${Date.now()}_${
        /^image\/|^application\/pdf$/.test(file.mimetype)
          ? file.originalname.replace(/\.[^.]+$/, '')
          : file.originalname
      }`,
    }),
  });
  return {
    _handleFile(req, file, cb) {
      if (hayCloudinary() || process.env.NODE_ENV === 'production') {
        // Si Cloudinary rechaza el archivo (un PDF dañado, por ejemplo),
        // se responde 400 con el motivo: antes salía un 500 sin explicación.
        return cloudinaryStorage._handleFile(req, file, (error, info) => {
          if (!error) return cb(null, info);
          const motivo =
            (error as { message?: string })?.message ??
            (error as { error?: { message?: string } })?.error?.message ??
            'desconocido';
          logger.warn(`Cloudinary rechazó «${file.originalname}»: ${motivo}`);
          cb(
            new BadRequestException(
              `No se pudo guardar el archivo «${file.originalname}». Verifique que no esté dañado.`,
            ),
          );
        });
      }
      logger.warn(
        `Cloudinary sin configurar: «${file.originalname}» no se guarda (solo desarrollo).`,
      );
      file.stream.resume();
      file.stream.on('end', () => cb(null, { path: '', filename: '' }));
    },
    _removeFile(req, file, cb) {
      if (hayCloudinary()) return cloudinaryStorage._removeFile(req, file, cb);
      cb(null);
    },
  };
};

export const evidenciaStorage = almacenamientoArchivos('evidencias');

/** Tipos de archivo que se aceptan como evidencia. */
export const TIPOS_EVIDENCIA_PERMITIDOS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-powerpoint': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'PowerPoint',
};

export const TAMANO_MAXIMO_EVIDENCIA = 10 * 1024 * 1024;

/** Opciones de multer para `FileInterceptor('file', …)` con archivo. */
export const opcionesArchivo = (carpeta: string) => ({
  storage: almacenamientoArchivos(carpeta),
  limits: { fileSize: TAMANO_MAXIMO_EVIDENCIA, files: 1 },
  fileFilter: (
    _req: Request,
    file: { mimetype: string },
    cb: (error: Error | null, aceptar: boolean) => void,
  ) => {
    if (TIPOS_EVIDENCIA_PERMITIDOS[file.mimetype]) return cb(null, true);
    cb(
      new BadRequestException(
        'Tipo de archivo no permitido: suba un PDF, una imagen (JPG, PNG o WEBP) o un documento de Word, Excel o PowerPoint.',
      ),
      false,
    );
  },
});

export const opcionesEvidencia = opcionesArchivo('evidencias');
