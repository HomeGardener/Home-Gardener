import { chatbotRepository } from "../repositories/chatbot-repository.js";
import { elAgente } from "../utils/agent.js";

export const chatbotService = {
  async getHistory(userId) {
    return await chatbotRepository.getMessagesByUser(userId);
  },

  async processMessage(userId, mensaje) {
    // 1 — Guardar mensaje del usuario
    await chatbotRepository.saveMessage({
      userId,
      contenido: mensaje,
      remitenteEsUsuario: true,
    });

    // 2 — Llamar a tu agente (IA)
    let respuesta = await elAgente.run(mensaje);

    if (typeof respuesta === "object" && respuesta?.data?.result) {
      respuesta = respuesta.data.result;
    }
    if (typeof respuesta !== "string") {
      respuesta = JSON.stringify(respuesta);
    }

    // 3 — Guardar respuesta del bot
    await chatbotRepository.saveMessage({
      userId,
      contenido: respuesta,
      remitenteEsUsuario: false,
    });

    return respuesta;
  },
};
