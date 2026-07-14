// cloudinary.evidencias.storage.ts

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';

export const evidenciaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'evidencias',
    resource_type: 'auto',
    public_id: `empleado_${Date.now()}_${file.originalname}`,
  }),
});
