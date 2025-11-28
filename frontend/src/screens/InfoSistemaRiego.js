import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function InfoSistemaRiego({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sistema de Riego Automático</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 ¿Qué es un sistema de riego automático?</Text>
        <Text style={styles.text}>
          Un sistema de riego automático es una solución tecnológica que permite mantener tus plantas 
          hidratadas de manera óptima sin necesidad de intervención manual constante.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💧 Beneficios</Text>
        <Text style={styles.text}>• Riego programado y preciso</Text>
        <Text style={styles.text}>• Ahorro de agua hasta un 30%</Text>
        <Text style={styles.text}>• Plantas más saludables</Text>
        <Text style={styles.text}>• Control remoto desde tu móvil</Text>
        <Text style={styles.text}>• Monitoreo de humedad del suelo</Text>
        <Text style={styles.text}>• Ideal para cuando viajas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Componentes incluidos</Text>
        <Text style={styles.text}>• Sensor de humedad del suelo</Text>
        <Text style={styles.text}>• Bomba de agua programable</Text>
        <Text style={styles.text}>• Tubos y goteros de riego</Text>
        <Text style={styles.text}>• Controlador WiFi</Text>
        <Text style={styles.text}>• Aplicación móvil</Text>
        <Text style={styles.text}>• Instalación guiada paso a paso</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Características de la app</Text>
        <Text style={styles.text}>• Programación de horarios de riego</Text>
        <Text style={styles.text}>• Monitoreo en tiempo real</Text>
        <Text style={styles.text}>• Alertas y notificaciones</Text>
        <Text style={styles.text}>• Historial de riego</Text>
        <Text style={styles.text}>• Integración con el clima local</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Compatibilidad</Text>
        <Text style={styles.text}>
          Compatible con plantas de interior y exterior. Perfecto para jardines pequeños, 
          balcones, terrazas y espacios urbanos.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => navigation.navigate('ComprarSistemaRiego')}
        >
          <Text style={styles.buyButtonText}>Ver opciones de compra</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver al perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#15A266',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#15A266',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  buyButton: {
    backgroundColor: '#15A266',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
