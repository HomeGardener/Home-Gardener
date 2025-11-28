import { createAPI } from './api';

const api = createAPI();

export const riegoService = {
  /**
   * Confirma la compra de un sistema de riego
   */
  async confirmarCompra(planId) {
    try {
      const response = await api.post('/api/riego/confirmar-compra', {
        planId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error confirmando compra:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al confirmar la compra'
      };
    }
  },

  /**
   * Envía un recordatorio de riego
   */
  async enviarRecordatorioRiego(plantData) {
    try {
      const response = await api.post('/api/riego/recordatorio-riego', plantData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al enviar recordatorio'
      };
    }
  },

  /**
   * Envía una alerta de salud
   */
  async enviarAlertaSalud(plantData) {
    try {
      const response = await api.post('/api/riego/alerta-salud', plantData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error enviando alerta:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al enviar alerta'
      };
    }
  },

  /**
   * Solicita restablecimiento de contraseña
   */
  async solicitarResetPassword(email) {
    try {
      const response = await api.post('/api/riego/solicitar-reset-password', {
        email
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error solicitando reset:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al solicitar restablecimiento'
      };
    }
  }
};
