import axios from "axios";

const API_URL = "http://localhost:3001/api/chat";

export const sendMessage = async (mensaje, userId) => {
  const { data } = await axios.post(API_URL, { mensaje, userId });
  return data.respuesta;
};

export const getHistory = async (userId) => {
  const { data } = await axios.get(`http://localhost:3001/api/chat/history/${userId}`);
  return data;
};
