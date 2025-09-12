import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../services/api';

export default function InfoPlanta({ route, navigation }) {
  const { idPlanta } = route.params;
  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const fetchInfoPlanta = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de usuario');
          setLoading(false);
          return;
        }
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/plantas/getInfoPlanta?idPlanta=${idPlanta}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'No se pudo obtener la información de la planta');
          setPlanta(null);
        } else {
          const data = await response.json();
          setPlanta(data);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
        setPlanta(null);
      }
      setLoading(false);
    };

    fetchInfoPlanta();
  }, [idPlanta]);

  const confirmDisconnect = () => {
    if (!planta?.idModulo) {
      Alert.alert('Info', 'La planta no tiene un módulo conectado');
      return;
    }
    Alert.alert(
      'Desconectar módulo',
      '¿Seguro que deseas desconectar el módulo de esta planta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desconectar', style: 'destructive', onPress: handleDisconnect },
      ]
    );
  };

  const handleDisconnect = async () => {
    try {
      setWorking(true);
      const token = await AsyncStorage.getItem('token');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/sensores/desconectarModulo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(idPlanta) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo desconectar el módulo');
      }
      setPlanta((prev) => ({ ...prev, idModulo: null }));
      Alert.alert('Éxito', 'Módulo desconectado');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo desconectar el módulo');
    } finally {
      setWorking(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar planta',
      '¿Seguro que deseas eliminar la planta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    try {
      setWorking(true);
      const token = await AsyncStorage.getItem('token');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/plantas/eliminar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(idPlanta) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo eliminar la planta');
      }
      Alert.alert('Éxito', 'Planta eliminada');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo eliminar la planta');
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22A45D" />
        <Text>Cargando información...</Text>
      </View>
    );
  }

  if (!planta) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró información de la planta.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{planta.nombre}</Text>
      <Image
        source={
          planta.foto
            ? { uri: planta.foto }
            : require('../../assets/image1.png')
        }
        style={styles.imagen}
      />
      <Text style={styles.label}>Tipo:</Text>
      <Text style={styles.valor}>{planta.tipo}</Text>
      <Text style={styles.label}>Ambiente:</Text>
      <Text style={styles.valor}>{planta.ambiente}</Text>
      <Text style={styles.label}>ID Planta:</Text>
      <Text style={styles.valor}>{planta.idPlanta}</Text>
      {planta.idModulo && (
        <>
          <Text style={styles.label}>ID Módulo:</Text>
          <Text style={styles.valor}>{planta.idModulo}</Text>
        </>
      )}
      <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
        <TouchableOpacity disabled={working} onPress={confirmDisconnect} style={[styles.actionBtn, { backgroundColor: '#F5F5F5' }]}>
          <Text style={[styles.actionText, { color: '#333' }]}>Desconectar módulo</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={working} onPress={confirmDelete} style={[styles.actionBtn, { backgroundColor: '#D32F2F' }]}>
          <Text style={[styles.actionText, { color: '#fff' }]}>Eliminar planta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FAF0',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22A45D',
    marginBottom: 16,
    textAlign: 'center',
  },
  imagen: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D9D9D9',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginTop: 10,
  },
  valor: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6FAF0',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});