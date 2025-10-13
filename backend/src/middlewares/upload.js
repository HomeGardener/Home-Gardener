import multer from 'multer';
import { StatusCodes } from 'http-status-codes';

/**
 * Configura multer para manejar archivos de imagen
 * @param {string} fieldName - Nombre del campo en el formulario
 * @returns {Function} Middleware de multer
 */
export const uploadFile = (fieldName) => {
  const storage = multer.memoryStorage(); // Guardar en memoria para luego subir a Supabase

  const fileFilter = (req, file, cb) => {
    // Validar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (jpg, png, gif, etc.)'), false);
    }
  };

  return multer({ 
    storage, 
    fileFilter,
    limits: { 
      fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
  }).single(fieldName);
};

/**
 * Middleware para validar que se subió un archivo (requerido)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'No se subió ningún archivo. Asegúrate de usar el campo correcto.',
      field: 'imagen'
    });
  }

  // Validar tamaño del archivo
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
    });
  }

  next();
};

/**
 * Middleware para validar archivo opcional
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const validateOptionalFile = (req, res, next) => {
  if (req.file) {
    // Validar tamaño del archivo solo si se subió uno
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
  }

  next();
};

/**
 * Middleware para manejar errores de multer
 * @param {Error} error - Error de multer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Campo de archivo inesperado. Usa el campo "imagen".'
      });
    }
  }

  if (error.message === 'Solo se permiten archivos de imagen (jpg, png, gif, etc.)') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};
