import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const STORAGE_KEY = 'chat_history';

export default function HistorialDeChats({ navigation }) {
  const [chats, setChats] = useState([]);

  // Cargar los chats cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      const loadChats = async () => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (!raw) {
            setChats([]);
            return;
          }
          const parsed = JSON.parse(raw);
          // Nos aseguramos de que sea un array
          setChats(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Error al cargar los chats', e);
          setChats([]);
        }
      };

      loadChats();
    }, [])
  );

  const viewChat = (chat) => {
    navigation.navigate('Chatbot', {
      chatId: chat.id,
      chatMessages: chat.messages,
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => viewChat(item)}>
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
