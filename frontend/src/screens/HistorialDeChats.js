import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STORAGE_KEY = 'chat_history';

export default function HistorialDeChats({ navigation }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Cargar los chats guardados desde AsyncStorage
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsedChats = JSON.parse(raw);
          setChats(parsedChats);
        }
      } catch (e) {
        console.error('Error al cargar los chats', e);
      }
    })();
  }, []);

  const viewChat = (chatId) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      navigation.navigate('Chatbot', { chatMessages: chat.messages });
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => viewChat(item.id)}>
      <View style={styles.chatItemLeft}>
        <Ionicons name="chatbox-ellipses" size={24} color="#15A266" />
        <Text style={styles.chatItemText}>
          Chat iniciado: {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <Ionicons name="arrow-forward" size={20} color="#15A266" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Chats</Text>
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
        />
      ) : (
        <Text>No hay chats guardados.</Text>
      )}

      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => navigation.navigate('Chatbot')}
      >
        <Text style={styles.newChatButtonText}>Iniciar Nuevo Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#15A266',
    textAlign: 'center',
    marginBottom: 20,
  },
  chatList: {
    marginBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  chatItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatItemText: {
    fontSize: 16,
    color: '#333',
  },
  newChatButton: {
    backgroundColor: '#15A266',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  newChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
