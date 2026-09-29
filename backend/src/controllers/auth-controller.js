import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import AuthService from '../services/auth-service.js';
import authenticateToken from '../middlewares/auth.js';
import { uploadFile } from '../middlewares/upload.js';

const router = Router();
const authService = new AuthService();
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
});

function sendAuthError(res, error) {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  if (statusCode >= 500) console.error('Fallo interno en autenticación:', error.message);
  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Error interno del servidor' : error.message,
  });
}

router.post('/register', credentialLimiter, uploadFile('Foto'), async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body || {}, req.file);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user,
      token,
    });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

router.post('/login', credentialLimiter, async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body || {});
    return res.status(StatusCodes.OK).json({ success: true, message: 'Login exitoso', user, token });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.ID);
    return res.status(StatusCodes.OK).json({ success: true, message: 'Perfil obtenido exitosamente', user });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

router.put('/profile', authenticateToken, uploadFile('Foto'), async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.ID, req.body || {}, req.file);
    return res.status(StatusCodes.OK).json({ success: true, message: 'Usuario actualizado exitosamente', user });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

export default router;
