import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { uploadFile, saveToSupabase } from '../middlewares/upload.js';

export default class StorageService {
    async uploadFile (file, carpeta){
        
        //Validar archivo
        if (!req.file) {
            return res
              .status(StatusCodes.BAD_REQUEST)
              .send('No se recibió el archivo. Usa el campo "image".');
          }

        const url = uploadFile(file, carpeta);
      
    }
};
