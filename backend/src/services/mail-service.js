import { Mail } from 'meily';
import { env } from 'arrowy-env';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función helper para obtener la ruta de las plantillas
const templatePath = (filename) => join(__dirname, '../../templates', filename);

class MailService {
  constructor() {
    this.fromEmail = env('MAIL_FROM');
  }

  /**
   * Envía un correo de bienvenida al usuario registrado
   */
  async sendWelcomeEmail(user) {
    try {
      await Mail.from(this.fromEmail)
        .to(user.Email)
        .subject('¡Bienvenido a Home Gardener! 🌱')
        .html(templatePath('welcome.html'))
        .data({
          nombre: user.Nombre,
          email: user.Email
        })
        .onSuccess(info => console.log('✅ Correo de bienvenida enviado:', info.response))
        .onError(error => console.error('❌ Error enviando correo de bienvenida:', error))
        .send();

      return { success: true, message: 'Correo de bienvenida enviado' };
    } catch (error) {
      console.error('Error en sendWelcomeEmail:', error);
      return { success: false, message: 'Error enviando correo de bienvenida' };
    }
  }

  /**
   * Envía un correo de confirmación de compra del sistema de riego
   */
  async sendPurchaseConfirmation(user, plan) {
    try {
      await Mail.from(this.fromEmail)
        .to(user.Email)
        .subject(`¡Confirmación de compra - ${plan.name} 💧`)
        .html(templatePath('purchase-confirmation.html'))
        .data({
          nombre: user.Nombre,
          email: user.Email,
          plan: plan,
          fecha: new Date().toLocaleDateString('es-ES')
        })
        .onSuccess(info => console.log('✅ Correo de confirmación de compra enviado:', info.response))
        .onError(error => console.error('❌ Error enviando correo de compra:', error))
        .send();

      return { success: true, message: 'Correo de confirmación enviado' };
    } catch (error) {
      console.error('Error en sendPurchaseConfirmation:', error);
      return { success: false, message: 'Error enviando correo de confirmación' };
    }
  }

  /**
   * Envía un correo de recordatorio de riego
   */
  async sendWateringReminder(user, plant) {
    try {
      await Mail.from(this.fromEmail)
        .to(user.Email)
        .subject(`Recordatorio: Es hora de regar tu ${plant.nombre} 💧`)
        .html(templatePath('watering-reminder.html'))
        .data({
          nombre: user.Nombre,
          plantName: plant.nombre,
          lastWatered: plant.ultimo_riego,
          nextWatering: plant.proximo_riego
        })
        .onSuccess(info => console.log('✅ Recordatorio de riego enviado:', info.response))
        .onError(error => console.error('❌ Error enviando recordatorio:', error))
        .send();

      return { success: true, message: 'Recordatorio de riego enviado' };
    } catch (error) {
      console.error('Error en sendWateringReminder:', error);
      return { success: false, message: 'Error enviando recordatorio' };
    }
  }

  /**
   * Envía un correo de alerta de salud de la planta
   */
  async sendHealthAlert(user, plant, alertType) {
    try {
      await Mail.from(this.fromEmail)
        .to(user.Email)
        .subject(`🚨 Alerta: Tu ${plant.nombre} necesita atención`)
        .html(templatePath('health-alert.html'))
        .data({
          nombre: user.Nombre,
          plantName: plant.nombre,
          alertType: alertType,
          timestamp: new Date().toLocaleString('es-ES')
        })
        .onSuccess(info => console.log('✅ Alerta de salud enviada:', info.response))
        .onError(error => console.error('❌ Error enviando alerta:', error))
        .send();

      return { success: true, message: 'Alerta de salud enviada' };
    } catch (error) {
      console.error('Error en sendHealthAlert:', error);
      return { success: false, message: 'Error enviando alerta' };
    }
  }

  /**
   * Envía un correo personalizado con contenido HTML
   */
  async sendCustomEmail(to, subject, content, attachments = []) {
    try {
      await Mail.from(this.fromEmail)
        .to(to)
        .subject(subject)
        .content(content)
        .attachments(attachments)
        .onSuccess(info => console.log('✅ Correo personalizado enviado:', info.response))
        .onError(error => console.error('❌ Error enviando correo personalizado:', error))
        .send();

      return { success: true, message: 'Correo enviado correctamente' };
    } catch (error) {
      console.error('Error en sendCustomEmail:', error);
      return { success: false, message: 'Error enviando correo' };
    }
  }

  /**
   * Envía un correo de restablecimiento de contraseña
   */
  async sendPasswordReset(user, resetToken) {
    try {
      const resetUrl = `${env('FRONTEND_URL')}/reset-password?token=${resetToken}`;
      
      await Mail.from(this.fromEmail)
        .to(user.Email)
        .subject('Restablecer contraseña - Home Gardener')
        .html(templatePath('password-reset.html'))
        .data({
          nombre: user.Nombre,
          resetUrl: resetUrl,
          expirationTime: '24 horas'
        })
        .onSuccess(info => console.log('✅ Correo de restablecimiento enviado:', info.response))
        .onError(error => console.error('❌ Error enviando correo de restablecimiento:', error))
        .send();

      return { success: true, message: 'Correo de restablecimiento enviado' };
    } catch (error) {
      console.error('Error en sendPasswordReset:', error);
      return { success: false, message: 'Error enviando correo de restablecimiento' };
    }
  }
}

export default new MailService();
