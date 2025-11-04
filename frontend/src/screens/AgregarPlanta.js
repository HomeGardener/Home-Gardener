import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgregarPlanta({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [idAmbiente, setIdAmbiente] = useState('');
  const [tiposPlanta, setTiposPlanta] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de usuario');
          setLoading(false);
          return;
        }

        const tiposResponse = await fetch(`${baseUrl}/api/plantas/tipos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tiposResponse.ok) {
          const tiposData = await tiposResponse.json();
          setTiposPlanta(tiposData);
        }

        const ambientesResponse = await fetch(`${baseUrl}/api/ambiente/listar`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ambientesResponse.ok) {
          const ambientesData = await ambientesResponse.json();
          setAmbientes(ambientesData.ambientes || []);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAgregarPlanta = async () => {
    if (!nombre || !tipo || !idAmbiente) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de usuario');
        return;
      }

      const response = await fetch(`${baseUrl}/api/plantas/agregar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, tipo, idAmbiente }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'No se pudo agregar la planta');
        return;
      }

      Alert.alert('Éxito', 'Planta agregada con éxito');
      navigation.navigate('Plantas');
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#E6FAF0' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Agregar Planta</Text>

        <TextInput
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        {/* Dropdown tipo */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Tipo de Planta:</Text>
          <Picker
            selectedValue={tipo}
            style={styles.picker}
            onValueChange={(itemValue) => setTipo(itemValue)}
          >
            <Picker.Item label="Seleccione un tipo" value="" />
            {tiposPlanta.map((tipoItem, index) => (
              <Picker.Item
                key={index}
                label={tipoItem.Nombre}
                value={tipoItem.Nombre}
              />
            ))}
          </Picker>
        </View>

        {/* Dropdown ambiente */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Ambiente:</Text>
          <Picker
            selectedValue={idAmbiente}
            style={styles.picker}
            onValueChange={(itemValue) => setIdAmbiente(itemValue)}
          >
            <Picker.Item label="Seleccione un ambiente" value="" />
            {ambientes.map((ambiente) => (
              <Picker.Item
                key={ambiente.ID}
                label={ambiente.Nombre}
                value={ambiente.ID}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.botonAgregar} onPress={handleAgregarPlanta}>
          <Text style={styles.textoBoton}>Agregar planta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#E6FAF0',
    padding: 16,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#757575',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  botonAgregar: {
    backgroundColor: '#22A45D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
