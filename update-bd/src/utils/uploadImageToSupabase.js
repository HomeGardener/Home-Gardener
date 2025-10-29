import multer from "multer";
import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";


//const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Configura multer para guardar archivos temporalmente en disco
 * (para luego subirlos a Supabase)
 * Crea automáticamente las carpetas necesarias.
 */
export const uploadFile = (fieldName, folder = "uploads") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `photo_${Date.now()}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten archivos de imagen"), false);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  }).single(fieldName);
};

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError || error.message.includes("imagen")) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || "Error al subir archivo",
    });
  }
  next(error);
};
/**
 * Sube una imagen desde una URL al bucket "Fotos" de Supabase,
 * dentro de una carpeta específica (ej: "tipoEspecifico" o "enfermedades").
 * Crea la carpeta si no existe.
 */
export async function uploadImageToSupabase(imageUrl, folder = "general") {
  try {
    if (!imageUrl) return null;

    const supabase = createClient(process.env.SUPABASE_URL,  process.env.SUPABASE_KEY);

    // Descargar imagen como buffer
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(response.data);
    const ext = path.extname(imageUrl) || ".jpg";
    const fileName = `${folder}/${Date.now()}${ext}`;

    // Subir al bucket
    const { error } = await supabase.storage
      .from("Fotos")
      .upload(fileName, fileBuffer, {
        contentType: response.headers["content-type"] || "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("❌ Error al subir imagen:", error.message);
      return null;
    }

    // Obtener URL pública
    const { data: publicUrl } = supabase.storage .from("Fotos").getPublicUrl(fileName);

    return publicUrl.publicUrl;
  } catch (err) {
    console.error("❌ Error en uploadImageToSupabase:", err.message);
    return null;
  }
}
