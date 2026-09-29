import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import AppError from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';

const fileExtensions = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export default class StorageService {
  async uploadFile(file, folder, userId) {
    if (!file?.buffer || !fileExtensions.has(file.mimetype)) {
      throw new AppError('Archivo de imagen inválido', StatusCodes.BAD_REQUEST);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new AppError('La carga de imágenes no está configurada', StatusCodes.SERVICE_UNAVAILABLE);
    }

    const client = createClient(supabaseUrl, supabaseKey);
    const bucket = process.env.SUPABASE_BUCKET || 'Fotos';
    const filePath = `${folder}/${userId}/${randomUUID()}.${fileExtensions.get(file.mimetype)}`;
    const { error } = await client.storage.from(bucket).upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      throw new AppError('No se pudo guardar la imagen', StatusCodes.BAD_GATEWAY);
    }

    const { data } = client.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }
}
