import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { uploadFile, saveToSupabase } from '../middlewares/upload.js';

export default class StorageService {
    async uploadFile (file, carpeta, userID){
        
        //Validar archivo
        if (!req.file) {
            return res
              .status(StatusCodes.BAD_REQUEST)
              .send('No se recibió el archivo. Usa el campo "image".');
          }

        const nombre = uploadFile(file, carpeta); //qué devuelve?
        const url = saveToSupabase(); 


          if(url){
            const saved = await db.saveUserProfilePic(userId, fileUrl);
            if (!saved) {
              // 4. Si falla la BD → eliminar archivo del bucket
              await supabase.storage.from(bucket).remove([fileName]);
              throw new Error('Error guardando en la BD, archivo eliminado del bucket');
            }
          }
        
  
        return fileUrl;
      } catch (err) {
        console.error('Error en uploadFile:', err.message);
        throw err;
      }
      
    }
};
