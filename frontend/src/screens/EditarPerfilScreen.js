import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getApiBaseUrl } from '../services/api';
import { getAuthToken } from '../services/authStorage';

const GREEN = '#15A266';
const LIGHT_BG = '#EAF8EE';

export default function EditarPerfilScreen({ navigation, user, baseUrl = getApiBaseUrl() }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [foto, setFoto] = useState(null);
  const [original, setOriginal] = useState(null);
  const { updateUser, user: authUser } = useAuth();

  useEffect(() => {
    const loadUser = async () => {
      setError(null);
      try {
        const current = authUser || user;
        if (current) {
          setNombre(current.Nombre || '');
          setEmail(current.Email || '');
          setDireccion(current.Direccion || '');
          setOriginal(current);
          setLoading(false);
          return;
        }

        const token = await getAuthToken();
        if (!token) {
          setLoading(false);
          setError('No hay sesión activa');
          return;
        }
        const apiBase = baseUrl || getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/auth/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const u = data?.user || {};
          setNombre(u.Nombre || '');
          setEmail(u.Email || '');
          setDireccion(u.Direccion || '');
          setOriginal(u);
        } else {
          setError('No se pudo cargar la información del usuario');
        }
      } catch (e) {
        setError(e?.message || 'No se pudo cargar la información del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [authUser, user, baseUrl]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setFoto(result.assets[0]);
    }
  };

  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  const handleUpdate = async () => {
    setError(null);
    if (!original) {
      setError('No hay datos de usuario para comparar');
      return;
    }

    const trimmedNombre = (nombre || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedDireccion = (direccion || '').trim();

    const changes = {};
    if (trimmedNombre && trimmedNombre !== (original.Nombre || '')) {
      changes.nombre = trimmedNombre;
    }
    if (trimmedEmail && trimmedEmail !== (original.Email || '')) {
      if (!validateEmail(trimmedEmail)) {
        setError('Formato de email inválido');
        return;
      }
      changes.email = trimmedEmail.toLowerCase();
    }
    if (trimmedDireccion && trimmedDireccion !== (original.Direccion || '')) {
      changes.direccion = trimmedDireccion;
    }

    if (Object.keys(changes).length === 0 && !foto) {
      Alert.alert('Sin cambios', 'No hay cambios para guardar');
      return;
    }

    try {
      setUpdating(true);
      const token = await getAuthToken();
      const apiBase = baseUrl || getApiBaseUrl();
      const body = foto ? new FormData() : JSON.stringify(changes);
      if (foto) {
        Object.entries(changes).forEach(([key, value]) => body.append(key, value));
        body.append('Foto', {
          uri: foto.uri,
          name: foto.fileName || 'perfil.jpg',
          type: foto.mimeType || 'image/jpeg',
        });
      }
      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(foto ? {} : { 'Content-Type': 'application/json' }),
        },
        body,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data?.user) await updateUser(data.user);

        Alert.alert('Éxito', 'Tus datos fueron actualizados correctamente');
        navigation.goBack();
      } else {
        setError(data?.message || 'No se pudo actualizar la información');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Ocurrió un error inesperado';
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loading}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {foto ? (
          <Image source={{ uri: foto.uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="camera" size={32} color="#555" />
          </View>
        )}
        <Text style={styles.avatarText}>Cambiar foto</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
        placeholderTextColor="#777"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#777"
      />

      <TextInput
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        style={styles.input}
        placeholderTextColor="#777"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={[styles.button, updating && { opacity: 0.7 }]} onPress={handleUpdate} disabled={updating}>
        <Text style={styles.buttonText}>{updating ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: LIGHT_BG },
  title: { fontSize: 24, fontWeight: '800', color: GREEN, textAlign: 'center', marginBottom: 16 },
  input: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  error: { color: '#D32F2F', marginBottom: 10, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: LIGHT_BG },
  loading: { marginTop: 10, fontSize: 16, color: '#555' },
  button: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  avatarContainer: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#555', marginTop: 6 },
});
