import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import AmbienteService from '../services/ambiente-service.js';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const ambienteService = new AmbienteService();

// Agregar ambiente
router.post('/agregar', authenticateToken, async (req, res) => {
  try {
    console.log('Received request to add ambiente:', req.body);
    const idUsuario = req.user.ID;
    console.log('User ID:', idUsuario);
    
    const result = await ambienteService.agregar({ ...req.body, idUsuario });
    console.log('Service result:', result);
    
    res.status(StatusCodes.CREATED).json({
      message: 'Ambiente agregado exitosamente',
      ambienteId: result.ID
    });
  } catch (error) {
    console.log('Error adding ambiente:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// Listar ambientes
router.get('/listar', authenticateToken, async (req, res) => {
  try {
    const idUsuario = req.user.ID;
    const ambientes = await ambienteService.listar(idUsuario);
    res.status(StatusCodes.OK).json({
      message: 'Ambientes obtenidos correctamente',
      ambientes
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// Editar ambiente
router.put('/editar/:id', authenticateToken, async (req, res) => {
  try {
    const idUsuario = req.user.ID;
    const ambiente = await ambienteService.editar(req.params.id, { ...req.body, idUsuario });
    res.status(StatusCodes.OK).json({
      message: 'Ambiente actualizado exitosamente',
      ambiente
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

export default router;
