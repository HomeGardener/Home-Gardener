import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import authenticateToken from '../middlewares/auth.js';

const router = Router();

function unavailable(res, feature) {
  return res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    message: `${feature} todavía no está disponible en esta versión`,
  });
}

router.post('/confirmar-compra', authenticateToken, (req, res) => unavailable(res, 'La compra'));
router.post('/recordatorio-riego', authenticateToken, (req, res) => unavailable(res, 'El envío de recordatorios'));
router.post('/alerta-salud', authenticateToken, (req, res) => unavailable(res, 'El envío de alertas'));
router.post('/solicitar-reset-password', (req, res) => unavailable(res, 'La recuperación de contraseña'));
router.post('/correo-personalizado', authenticateToken, (req, res) => unavailable(res, 'El envío de correos'));

export default router;
