import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'chat_messages_v1';

// Mensaje inicial del bot
const initialBotMsg = {
  id: 1,
  text: '¡Buen día! ¿En qué te puedo ayudar?',
  sender: 'bot',
  timestamp: new Date(),
};

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([initialBotMsg]);
  const [inputText, setInputText] = useState('');
  const [restoring, setRestoring] = useState(true);
  const scrollViewRef = useRef();

  const botResponses = [
    'Para cuidar tus plantas, asegúrate de regarlas regularmente pero sin exceso.',
    'La mayoría de las plantas necesitan luz solar indirecta durante 6-8 horas al día.',
    'Recomiendo fertilizar tus plantas cada 2-3 semanas durante la temporada de crecimiento.',
    'Si notas hojas amarillas, puede ser exceso de agua o falta de nutrientes.',
    'Para plantas de interior, mantén la temperatura entre 18-24°C.',
    '¿Podrías contarme más sobre el problema específico de tu planta?'
  ];

  // --- Cargar historial de mensajes
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const hydrated = parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
          setMessages(hydrated.length ? hydrated : [initialBotMsg]);
        }
      } catch (e) {
        setMessages([initialBotMsg]); // Fallback si no se puede recuperar el historial
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  // --- Guardar historial de mensajes cada vez que cambian
  useEffect(() => {
    if (restoring) return; // No sobreescribir mientras estamos restaurando
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: Date.now(), messages }])).catch(() => {});
  }, [messages, restoring]);

  // --- Scroll hacia abajo cada vez que se agregan mensajes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // --- Manejar el envío de mensajes
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleClearHistory = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setMessages([ { ...initialBotMsg, id: Date.now() } ]);
  };

  // --- Formatear la hora de los mensajes
  const formatTime = (date) => new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#15A266" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asistente de Jardinería</Text>
        <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.botBubble
              ]}
            >
              {message.sender === 'bot' && (
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }}
                  style={styles.botAvatar}
                />
              )}
              <View
                style={[
                  styles.messageContent,
                  message.sender === 'user' && styles.userMessageContent
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userText : styles.botText
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.sender === 'user' && styles.timestampUser
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              {message.sender === 'user' && (
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                  style={styles.userAvatar}
                />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={inputText.trim() === ''}>
            <Ionicons name="send" size={22} color={inputText.trim() === '' ? '#ccc' : '#15A266'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF8EE' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#15A266' },
  clearBtn: { padding: 6 },

  keyboardView: { flex: 1 },

  messagesContainer: { flex: 1, padding: 16 },
  messagesContent: { paddingBottom: 16 },

  messageBubble: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botBubble: { alignSelf: 'flex-start' },

  botAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  userAvatar: { width: 30, height: 30, borderRadius: 15, marginLeft: 8 },

  messageContent: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userMessageContent: { backgroundColor: '#15A266', borderColor: '#0F8E5C' },

  messageText: { fontSize: 16, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#333' },

  timestamp: { fontSize: 10, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  timestampUser: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 4, alignSelf: 'flex-end' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 110,
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
});
