import { createClient } from '@supabase/supabase-js';
import { StatusCodes } from 'http-status-codes';

// Verificar que las variables de Supabase estén configuradas
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(
  supabaseUrl,
  supabaseKey // Usar service role key para operaciones de storage
);

export default class StorageService {
  constructor() {
    this.bucketName = 'fotos-usuarios';
  }


  /**
   * Sube un archivo a Supabase Storage
   * @param {Object} file - Archivo desde multer (req.file)
   * @param {string} folder - Carpeta donde guardar (ej: 'perfil', 'plantas')
   * @param {number} userId - ID del usuario
   * @returns {Promise<string>} URL pública del archivo
   */
  async uploadFile(file, folder, userId) {
    try {
      if (!file) {
        throw new Error('No se recibió ningún archivo');
      }

      // Validar tipo de archivo
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      // Verificar si Supabase está configurado correctamente
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('⚠️ Supabase no está configurado, usando URL de placeholder');
        return `https://via.placeholder.com/300x300/15A266/FFFFFF?text=${folder}`;
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      const fileName = `${folder}/${userId}_${timestamp}.${extension}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Error subiendo archivo a Supabase:', error);
        throw new Error(`Error al subir archivo: ${error.message}`);
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;

    } catch (error) {
      console.error('Error en StorageService.uploadFile:', error);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Supabase Storage
   * @param {string} fileName - Nombre del archivo a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async deleteFile(fileName) {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

      if (error) {
        console.error('Error eliminando archivo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en StorageService.deleteFile:', error);
      return false;
    }
  }

  /**
   * Extrae el nombre del archivo desde una URL de Supabase
   * @param {string} url - URL pública del archivo
   * @returns {string} Nombre del archivo
   */
  extractFileNameFromUrl(url) {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName;
    } catch (error) {
      console.error('Error extrayendo nombre de archivo:', error);
      return null;
    }
  }
}
