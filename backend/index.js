import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment-timezone';
import { fileURLToPath } from 'url';
import path from 'path';

import AuthRoutes from './src/controllers/auth-controller.js';
import PlantasRoutes from './src/controllers/plantas-controller.js';
import SensoresRoutes from './src/controllers/sensores-controller.js';
import AmbienteRoutes from './src/controllers/ambiente-controller.js';
import RiegoRoutes from './src/controllers/riego-controller.js';


// Validar variables de entorno críticas
const hasDbUrl = !!process.env.DB_URL;
const hasDbParts = !!(process.env.DB_HOST && process.env.DB_USER && (process.env.DB_PASSWORD || process.env.DB_password) && process.env.DB_NAME);
const missing = [];
if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
if (!hasDbUrl && !hasDbParts) missing.push('DB_URL o (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');

if (missing.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missing);
  console.error('Por favor, configura las variables de entorno requeridas en tu archivo .env');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas correctamente');
console.log('🌱 Iniciando servidor Home Gardener...')
const app = express();

// Obtener el __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de CORS más segura
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: false,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Configura la carpeta 'uploads' para ser accesible públicamente
app.use('/backend/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/auth', AuthRoutes);
app.use('/api/plantas', PlantasRoutes);
app.use('/api/sensores', SensoresRoutes);
app.use('/api/ambiente', AmbienteRoutes);
app.use('/api/riego', RiegoRoutes);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  const timestamp = moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYY HH:mm:ss');
  res.status(StatusCodes.OK).json({
    status: 'OK',
    message: 'Servidor Home Gardener funcionando correctamente',
    timestamp: timestamp,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'API Home Gardener',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      plantas: '/api/plantas',
      sensores: '/api/sensores',
      ambiente: '/api/ambiente',
      riego: '/api/riego',
      health: '/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.type === 'entity.parse.failed' ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
  if (status >= 500) console.error('Error no manejado en la API:', error.message);
  return res.status(status).json({
    success: false,
    message: status === StatusCodes.BAD_REQUEST ? 'El cuerpo de la solicitud no es válido' : 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
