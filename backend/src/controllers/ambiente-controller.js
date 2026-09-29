import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import AmbienteService from '../services/ambiente-service.js';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const ambienteService = new AmbienteService();

// Agregar ambiente
router.post('/agregar', authenticateToken, async (req, res) => {
  try {
    const idUsuario = req.user.ID;
    const result = await ambienteService.agregar({ ...req.body, idUsuario });
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Ambiente agregado exitosamente',
      ambienteId: result.ID,
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    if (statusCode >= 500) console.error('Error agregando ambiente:', error.message);
    return res.status(statusCode).json({ success: false, message: statusCode >= 500 ? 'Error interno del servidor' : error.message });
  }
});

// Listar ambientes
router.get('/listar', authenticateToken, async (req, res) => {
  try {
    const idUsuario = req.user.ID;
    const ambientes = await ambienteService.listar(idUsuario);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ambientes obtenidos correctamente',
      ambientes
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    if (statusCode >= 500) console.error('Error listando ambientes:', error.message);
    return res.status(statusCode).json({ success: false, message: statusCode >= 500 ? 'Error interno del servidor' : error.message });
  }
});

// Editar ambiente
router.put('/editar/:id', authenticateToken, async (req, res) => {
  try {
    const idUsuario = req.user.ID;
    const ambiente = await ambienteService.editar(req.params.id, { ...req.body, idUsuario });
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ambiente actualizado exitosamente',
      ambiente
    });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    if (statusCode >= 500) console.error('Error editando ambiente:', error.message);
    return res.status(statusCode).json({ success: false, message: statusCode >= 500 ? 'Error interno del servidor' : error.message });
  }
});

export default router;
