import { chatbotService } from "../services/chatbot-service.js";
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import authenticateToken from '../middlewares/auth.js';

const router = Router();

router.post('/enviarMensaje', authenticateToken, (req, res) => {

    const { mensaje, userId } = req.body;

    if (!mensaje || typeof mensaje !== "string") {
      return res.status(BAD_REQUEST).json({ error: "Mensaje inválido" });
    }

    try {
      const respuesta = chatbotService.processMessage(userId, mensaje);
      res.json({ respuesta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

router.post('/history', authenticateToken, (req, res) => {

    const userId  = req.user.ID;
    try {
      const history = chatbotService.getHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Error obteniendo historial" });
    }
  });
