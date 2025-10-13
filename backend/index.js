import dotenv from 'dotenv';
dotenv.config();
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


// Validar variables de entorno críticas - usar valores por defecto para desarrollo
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'clave_supersecreta_para_desarrollo_123456789';
  console.log('⚠️ Usando JWT_SECRET por defecto para desarrollo');
}

if (!process.env.DB_URL && !process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USER = 'postgres';
  process.env.DB_PASSWORD = 'password';
  process.env.DB_NAME = 'home_gardener_db';
  console.log('⚠️ Usando configuración de base de datos por defecto para desarrollo');
}

console.log('✅ Variables de entorno configuradas correctamente');
console.log('🌱 Iniciando servidor Home Gardener...')
const app = express();

// Obtener el __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de CORS más segura
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:3000'] // Solo permitir origen específico en producción
    : '*', // Permitir todos en desarrollo
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
      riego: '/api/riego',
      health: '/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  // Manejar errores específicos de multer
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
  
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});