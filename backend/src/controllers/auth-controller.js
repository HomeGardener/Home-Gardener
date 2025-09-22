import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthService from '../services/auth-service.js';
import authenticateToken from '../middlewares/auth.js';
import mailService from '../services/mail-service.js';

const router = Router();
const authService = new AuthService();



router.post('/register', (req, res) => {

    try {
      // Crear objeto con los datos del usuario - la imagen es opcional
      const userData = { 
        ...req.body, 
        imagen: req.file ? req.file.filename : null 
      };

      const { user, token } = await authService.register(userData);

      // Enviar correo de bienvenida (no bloquea la respuesta)
      mailService.sendWelcomeEmail(user).catch(error => {
        console.error('Error enviando correo de bienvenida:', error);
      });

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user,
        token
      });
    } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
      });
    }
  });


// Login
router.post('/login', async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.status(StatusCodes.OK).json({ 
      success: true,
      message: 'Login exitoso', 
      user, 
      token 
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 

    res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
    });
  }
});

// Perfil
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.ID);
    res.status(StatusCodes.OK).json({ 
      success: true,
      message: 'Perfil obtenido exitosamente', 
      user 
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 

    res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
    });  }
});

// Actualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.ID, req.body);
    res.status(StatusCodes.OK).json({ 
      success: true,
      message: 'Usuario actualizado exitosamente', 
      user 
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 

    res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
    });  }
});

export default router;

