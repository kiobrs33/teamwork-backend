import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { carpetaDe } from '../../config/cloudinary';

export const empresasStorage = new CloudinaryStorage({
  cloudinary,
  // Logos en la carpeta del módulo, bajo la raíz del entorno.
  params: async () => ({
    folder: carpetaDe('empresas'),
  }),
});

export const LOGO_EMPRESA_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const FORMATOS_LOGO_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

// Sin esto cualquier archivo (un .zip, un .exe) terminaba subido a Cloudinary,
// porque el endpoint solo leía `file.path`.
export const empresaLogoUploadOptions: MulterOptions = {
  storage: empresasStorage,
  limits: { fileSize: LOGO_EMPRESA_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!FORMATOS_LOGO_PERMITIDOS.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'El logo debe ser una imagen JPG, PNG, WEBP o SVG.',
        ),
        false,
      );
    }
    callback(null, true);
  },
};
