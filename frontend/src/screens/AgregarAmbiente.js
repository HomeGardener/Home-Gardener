import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgregarAmbiente({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL  }) {
    const [nombre, setNombre] = useState('');
    const [temperatura, setTemperatura] = useState('');

    const handleAgregarAmbiente = async () => {
        if (!nombre || !temperatura) {
            Alert.alert('Error', 'Por favor complete todos los campos');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'No se encontró el token de usuario');
                return;
            }

            console.log('Token:', token);
            console.log('Sending data:', { nombre, temperatura });

            const response = await fetch(`${baseUrl}/api/ambiente/agregar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, temperatura }),
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response:', errorData);
                Alert.alert('Error', errorData.message || 'No se pudo agregar el ambiente');
                return;
            }

            const successData = await response.json();
            console.log('Success response:', successData);
            
            Alert.alert('Éxito', 'Ambiente agregado con éxito');
            navigation.navigate('Plantas'); // Navigate to the Plantas screen or any other screen
        } catch (error) {
            console.log('Error:', error);
            Alert.alert('Error', 'No se pudo conectar con el servidor');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Agregar Ambiente</Text>
            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
            />
            <TextInput
                placeholder="Temperatura"
                value={temperatura}
                onChangeText={setTemperatura}
                style={styles.input}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.botonAgregar} onPress={handleAgregarAmbiente}>
                <Text style={styles.textoBoton}>Agregar ambiente</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6FAF0',
        padding: 16,
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
