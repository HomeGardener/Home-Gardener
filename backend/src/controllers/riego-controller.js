import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import authenticateToken from '../middlewares/auth.js';

const router = Router();

// Endpoint para confirmar compra de sistema de riego
router.post('/confirmar-compra', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = req.user; // Obtenido del middleware de autenticación

    // Definir los planes disponibles
    const plans = {
      'basico': {
        id: 'basico',
        name: 'Plan Básico',
        price: '$89.99',
        description: 'Perfecto para empezar',
        features: [
          'Sensor de humedad básico',
          'Controlador simple',
          'Hasta 4 plantas',
          'Aplicación móvil',
          'Soporte por email'
        ]
      },
      'premium': {
        id: 'premium',
        name: 'Plan Premium',
        price: '$149.99',
        description: 'El más popular',
        features: [
          'Sensor de humedad avanzado',
          'Controlador WiFi',
          'Hasta 12 plantas',
          'Aplicación móvil completa',
          'Integración con clima',
          'Soporte prioritario',
          'Instalación incluida'
        ]
      },
      'profesional': {
        id: 'profesional',
        name: 'Plan Profesional',
        price: '$249.99',
        description: 'Para jardines grandes',
        features: [
          'Múltiples sensores',
          'Controlador inteligente',
          'Hasta 25 plantas',
          'Aplicación móvil premium',
          'Análisis de datos',
          'Soporte 24/7',
          'Instalación profesional',
          'Garantía extendida'
        ]
      }
    };

    // Validar que el plan existe
    if (!plans[planId]) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Plan no válido'
      });
    }

    const selectedPlan = plans[planId];

    // Aquí podrías guardar la compra en la base de datos
    // const compra = await guardarCompra(user.ID, selectedPlan);

    // Funcionalidad de correo de confirmación removida

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Compra confirmada exitosamente',
      plan: selectedPlan
    });

  } catch (error) {
    console.error('Error en confirmar-compra:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para enviar recordatorio de riego
router.post('/recordatorio-riego', authenticateToken, async (req, res) => {
  try {
    const { plantId, plantName, lastWatered, nextWatering } = req.body;
    const user = req.user;

    const plantData = {
      id: plantId,
      nombre: plantName,
      ultimo_riego: lastWatered,
      proximo_riego: nextWatering
    };

    // Funcionalidad de correo de recordatorio removida

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Recordatorio de riego procesado (funcionalidad de correo removida)'
    });

  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error enviando recordatorio'
    });
  }
});

// Endpoint para enviar alerta de salud
router.post('/alerta-salud', authenticateToken, async (req, res) => {
  try {
    const { plantId, plantName, alertType } = req.body;
    const user = req.user;

    const plantData = {
      id: plantId,
      nombre: plantName
    };

    // Funcionalidad de correo de alerta removida

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Alerta de salud procesada (funcionalidad de correo removida)'
    });

  } catch (error) {
    console.error('Error enviando alerta:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error enviando alerta'
    });
  }
});

// Endpoint para solicitar restablecimiento de contraseña
router.post('/solicitar-reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Aquí deberías verificar que el email existe en tu base de datos
    // y generar un token de restablecimiento
    const resetToken = 'token_generado_aqui'; // En producción, genera un token seguro
    
    // Simular datos del usuario (en producción, obtén de la base de datos)
    const user = {
      ID: 1,
      Nombre: 'Usuario',
      Email: email
    };

    // Funcionalidad de correo de restablecimiento removida

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Solicitud de restablecimiento procesada (funcionalidad de correo removida)'
    });

  } catch (error) {
    console.error('Error solicitando reset:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para enviar correo personalizado (solo para administradores)
router.post('/correo-personalizado', authenticateToken, async (req, res) => {
  try {
    const { to, subject, content, attachments } = req.body;
    
    // Aquí podrías verificar si el usuario es administrador
    // if (!req.user.esAdmin) { ... }

    // Funcionalidad de correo personalizado removida

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Solicitud de correo personalizado procesada (funcionalidad de correo removida)'
    });

  } catch (error) {
    console.error('Error enviando correo personalizado:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error enviando correo personalizado'
    });
  }
});

export default router;
