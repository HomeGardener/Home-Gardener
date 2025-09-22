import multer from 'multer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const uploadFile = (fieldName) => {
  const storage = multer.memoryStorage(); // guardar en memoria

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  };

  return multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }).single(fieldName);
};

// Middleware para subir a Supabase después de multer
export const saveToSupabase = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const ext = path.extname(req.file.originalname);
    const fileName = `user_${Date.now()}${ext}`;
    const bucket = 'Fotos'; // nombre del bucket en Supabase

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al subir archivo a Supabase' });
    }

    // Obtener URL pública (si el bucket es público)
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    req.fileUrl = publicUrl.publicUrl; // la podés usar en el siguiente middleware
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error inesperado al subir archivo' });
  }
};
