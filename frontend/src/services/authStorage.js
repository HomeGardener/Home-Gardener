import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export async function getAuthToken() {
  if (Platform.OS === 'web') return AsyncStorage.getItem('token');

  const secureToken = await SecureStore.getItemAsync('token');
  if (secureToken) return secureToken;

  const legacyToken = await AsyncStorage.getItem('token');
  if (legacyToken) {
    await SecureStore.setItemAsync('token', legacyToken);
    await AsyncStorage.removeItem('token');
  }
  return legacyToken;
}

export async function setAuthToken(token) {
  if (Platform.OS === 'web') return AsyncStorage.setItem('token', token);
  await SecureStore.setItemAsync('token', token);
  await AsyncStorage.removeItem('token');
}

export async function removeAuthToken() {
  if (Platform.OS === 'web') return AsyncStorage.removeItem('token');
  await Promise.all([
    SecureStore.deleteItemAsync('token'),
    AsyncStorage.removeItem('token'),
  ]);
}
