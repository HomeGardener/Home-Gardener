//Listar tipoEspecifico (para llamar a la hora de registrar nueva planta)


import { Router } from 'express';
import PlantaService from '../services/plantas-service.js';
import authenticateToken from '../middlewares/auth.js';
import { StatusCodes } from 'http-status-codes';


const router = Router();

const plantaService = new PlantaService();

// Agregar planta
router.post('/agregar', authenticateToken, async (req, res) => {
  try {
    const { nombre, tipo, idAmbiente } = req.body;
    const idUsuario = req.user.ID;
    const result = await plantaService.agregarPlanta({ nombre, tipo, idAmbiente: Number(idAmbiente), idUsuario });
    const mensaje = result.message || 'Planta creada con éxito';
    return res.status(result.status).json({ mensaje });

  }catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 
        res.status(statusCode).json({
            success: false,
            message: error.message,
            token: ''
        });
  }});

// Eliminar planta
router.delete('/eliminar', authenticateToken, async (req, res) => {
  try {
    const { idPlanta } = req.body;
    const idUsuario = req.user.ID;
    const result = await plantaService.eliminarPlanta({ idPlanta: Number(idPlanta), idUsuario });

    if (result.error) return res.status(result.status).json({ message: result.message });
    return res.status(result.status).json({ message: 'Planta eliminada' });
  } catch (err) {
    console.error('Error en /eliminar:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar foto
router.post('/actualizarFoto', authenticateToken, async (req, res) => {
  try {
    const { foto, idPlanta } = req.body;
    const idUsuario = req.user.ID;
    const result = await plantaService.actualizarFoto({ foto, idPlanta: Number(idPlanta), idUsuario });

    if (result.error) return res.status(result.status).json({ message: result.message });
    return res.status(result.status).json({ message: 'Foto actualizada', foto: result.data.Foto });
  } catch (err) {
    console.error('Error en /actualizarFoto:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Listar plantas
router.get('/misPlantas', authenticateToken, async (req, res) => {
  try {
    const idUsuario = req.user.ID;
    const result = await plantaService.listarPlantas(idUsuario);

    if (result.error) return res.status(result.status).json({ message: result.message });
    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error('Error en /misPlantas:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Modificar nombre
router.put('/modificarNombre', authenticateToken, async (req, res) => {
  try {
    const { idPlanta, nuevoNombre } = req.body;
    const idUsuario = req.user.ID;
    const result = await plantaService.modificarNombre({ idPlanta: Number(idPlanta), nuevoNombre, idUsuario });

    if (result.error) return res.status(result.status).json({ message: result.message });
    return res.status(result.status).json({ message: 'Nombre actualizado' });
  } catch (err) {
    console.error('Error en /modificarNombre:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;

