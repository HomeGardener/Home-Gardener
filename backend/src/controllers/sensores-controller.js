import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import authenticateToken from '../middlewares/auth.js';
import SensoresService from '../services/sensores-service.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const sensoresService = new SensoresService();
const sensoresLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' },
});

function sendSensorError(res, error, operation) {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  if (statusCode >= 500) console.error(`Error en ${operation}:`, error.message);
  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Error interno del servidor' : error.message,
  });
}

router.get('/datosSensores', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const result = await sensoresService.obtenerDatosSensores(Number(req.query.idPlanta), req.user.ID);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return sendSensorError(res, error, '/datosSensores');
  }
});

router.get('/ultRiego', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const result = await sensoresService.obtenerUltimoRiego(Number(req.query.idPlanta), req.user.ID);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return sendSensorError(res, error, '/ultRiego');
  }
});

router.put('/conectarModulo', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const { idPlanta, idModulo } = req.body || {};
    const result = await sensoresService.conectarModulo(Number(idPlanta), Number(idModulo), req.user.ID);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return sendSensorError(res, error, '/conectarModulo');
  }
});

router.delete('/desconectarModulo', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const result = await sensoresService.desconectarModulo(Number(req.body?.idPlanta), req.user.ID);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return sendSensorError(res, error, '/desconectarModulo');
  }
});

router.post('/subirDatosPlanta', authenticateToken, async (req, res) => {
  try {
    const result = await sensoresService.subirDatosPlanta({ ...(req.body || {}), idUsuario: req.user.ID });
    return res.status(result.status).json(result.data);
  } catch (error) {
    return sendSensorError(res, error, '/subirDatosPlanta');
  }
});

router.post('/registrarUltRiego', authenticateToken, async (req, res) => {
  try {
    const result = await sensoresService.registrarUltimoRiego({ ...(req.body || {}), idUsuario: req.user.ID });
    return res.status(result.status).json(result.data);
  } catch (error) {
    return sendSensorError(res, error, '/registrarUltRiego');
  }
});

export default router;
