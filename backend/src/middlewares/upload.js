import multer from 'multer';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (allowedImageTypes.has(file.mimetype)) return callback(null, true);
    callback(new Error('Formato de imagen no permitido'));
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 10,
    fieldSize: 16 * 1024,
    parts: 11,
    headerPairs: 100,
  },
});

function matchesImageSignature(file) {
  const { buffer, mimetype } = file;
  if (mimetype === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimetype === 'image/webp') return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

export const uploadFile = (fieldName) => {
  return (req, res, next) => {
    imageUpload.single(fieldName)(req, res, (error) => {
      if (error) {
        let message = 'La imagen debe ser JPG, PNG o WebP';
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') message = 'La imagen no puede superar los 5 MB';
          else if (['LIMIT_FIELD_COUNT', 'LIMIT_FIELD_VALUE', 'LIMIT_PART_COUNT'].includes(error.code)) {
            message = 'La solicitud incluye demasiados campos o datos';
          }
        }
        return res.status(400).json({
          success: false,
          message,
        });
      }
      if (req.file && !matchesImageSignature(req.file)) {
        return res.status(400).json({ success: false, message: 'El contenido del archivo no coincide con el formato de imagen' });
      }
      next();
    });
  };
};
