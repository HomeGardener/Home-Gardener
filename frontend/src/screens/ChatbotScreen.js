import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import { sendMessage, getHistory } from "../api/chatbot";

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef();

  useEffect(() => {
    (async () => {
      const historial = await getHistory(userId);

      const parsed = historial.map(m => ({
        id: m.ID,
        sender: m.RemitenteEsUsuario ? "user" : "bot",
        text: m.Contenido,
        timestamp: m.Hora
      }));

      setMessages(parsed);
    })();
  }, []);

  const handleSend = async () => {
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const respuesta = await sendMessage(inputText, userId);

    const botMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: respuesta,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setInputText("");
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scrollViewRef} style={{ padding: 16 }}>
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} formatTime={formatTime} />
        ))}
      </ScrollView>
      <ChatInput inputText={inputText} setInputText={setInputText} onSend={handleSend} />
    </View>
  );
}
