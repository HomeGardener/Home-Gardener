import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PlantasScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL }) {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ambientesCount, setAmbientesCount] = useState(0); // 👈 cantidad de ambientes del usuario

  const getToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de usuario');
    return token;
  };

  const fetchAmbientes = async () => {
    const token = await getToken();
    const res = await fetch(`${baseUrl}/api/ambiente/listar`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'No se pudieron obtener los ambientes');
    }
    const data = await res.json();
    const list = data?.ambientes || [];
    setAmbientesCount(Array.isArray(list) ? list.length : 0);
  };

  const fetchPlantas = async () => {
    const token = await getToken();
    const response = await fetch(`${baseUrl}/api/plantas/misPlantas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      Alert.alert('Error', errorData.message || 'No se pudieron obtener las plantas');
      setPlantas([]);
      return;
    }
    const data = await response.json();
    setPlantas(
      data.map((planta) => ({
        id: planta.ID,
        nombre: planta.Nombre,
        estado: planta.Tipo,
        imagen: planta.Foto ? { uri: planta.Foto } : require('../../assets/image1.png'),
      }))
    );
  };

  const load = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAmbientes(), fetchPlantas()]);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo cargar la información');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const confirmEliminar = (id, nombre) => {
    Alert.alert(
      'Eliminar planta',
      `¿Seguro que deseas eliminar "${nombre}"? Si tiene un módulo conectado, primero debes desconectarlo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleEliminar(id) },
      ]
    );
  };

  const handleEliminar = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/plantas/eliminar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(id) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo eliminar la planta');
      }
      setPlantas((prev) => prev.filter((p) => p.id !== id));
      Alert.alert('Éxito', 'Planta eliminada');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo eliminar la planta');
    }
  };

  const handleAgregarPlantaPress = () => {
    if (ambientesCount <= 0) {
      Alert.alert(
        'Primero creá un ambiente',
        'Para agregar una planta necesitás tener al menos un ambiente creado.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Crear ambiente', onPress: () => navigation.navigate('AgregarAmbiente') },
        ]
      );
      return;
    }
    navigation.navigate('AgregarPlanta');
  };

  const renderPlanta = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => navigation.navigate('InfoPlanta', { idPlanta: item.id })}
      >
        <Image source={item.imagen} style={styles.imagen} />
        <View style={styles.textContainer}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.estado}>{item.estado}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => confirmEliminar(item.id, item.nombre)}>
        <MaterialCommunityIcons name="delete-outline" size={24} color="#D32F2F" />
      </TouchableOpacity>
      <MaterialCommunityIcons name="arrow-right-circle-outline" size={24} color="#22A45D" style={{ marginLeft: 8 }} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22A45D" />
        <Text>Cargando plantas...</Text>
      </View>
    );
  }

  const canCreatePlant = ambientesCount > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Plantas</Text>

      <FlatList
        data={plantas}
        renderItem={renderPlanta}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text>No tienes plantas registradas.</Text>}
      />

      <TouchableOpacity
        style={[styles.botonAgregarPlanta, !canCreatePlant && styles.botonDeshabilitado]}
        onPress={handleAgregarPlantaPress}
        disabled={!canCreatePlant}
      >
        <Text style={styles.textoBoton}>
          {canCreatePlant ? 'Agregar planta' : 'Crear un ambiente primero'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonAgregarAmbiente}
        onPress={() => navigation.navigate('AgregarAmbiente')}
      >
        <Text style={styles.textoBoton}>Agregar ambiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FAF0',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    marginBottom: 10,
  },
  lista: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  imagen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  nombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  estado: {
    fontSize: 12,
    color: '#888888',
  },
  botonAgregarPlanta: {
    backgroundColor: '#22A45D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  botonDeshabilitado: {
    backgroundColor: '#8BCDB3', // verde apagado
  },
  botonAgregarAmbiente: {
    backgroundColor: '#1E8449',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6FAF0',
  },
});
