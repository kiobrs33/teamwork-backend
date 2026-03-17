import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'empresas',
  }),
});
