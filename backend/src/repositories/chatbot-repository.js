import { supabase } from "../supabase.js";

export const chatbotRepository = {
  async getMessagesByUser(userId) {
    const { data, error } = await supabase
      .from("MensajeChatbot")
      .select("*")
      .eq("IdUsuario", userId)
      .order("Hora", { ascending: true });

    if (error) throw error;
    return data;
  },

  async saveMessage({ userId, contenido, remitenteEsUsuario, idPlanta, multimedia }) {
    const { data, error } = await supabase
      .from("MensajeChatbot")
      .insert({
        IdUsuario: userId,
        Contenido: contenido,
        RemitenteEsUsuario: remitenteEsUsuario,
        IdPlanta: idPlanta ?? null,
        Multimedia: multimedia ?? null,
        Hora: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
