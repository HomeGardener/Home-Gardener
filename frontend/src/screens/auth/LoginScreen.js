// src/screens/LoginScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAPI } from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL }) {

  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  const validatePassword = (pwd) =>
    pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Email y contraseña son obligatorios');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Formato de email inválido');
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra y un número');
      setLoading(false);
      return;
    }

    try {

      const { data } = await api.post('/api/auth/login', { email, password });
      
      // Usar el contexto de autenticación para hacer login
      const success = await login(data.user, data.token);
      
      if (success) {
        Alert.alert('Bienvenido', `Hola, ${data.user?.Nombre || 'usuario'}!`);
        navigation.navigate('Home');
      } else {
        setError('Error al iniciar sesión. Por favor intenta nuevamente.');
      }

    } catch (e) {
      let errorMessage = 'Error en el login';
      
      if (e.response) {
        // El servidor respondió con un código de error
        errorMessage = e.response.data?.message || 
                      e.response.data?.error || 
                      `Error del servidor: ${e.response.status}`;
      } else if (e.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        // Algo pasó al configurar la solicitud
        errorMessage = e.message || 'Error desconocido al realizar la solicitud';
      }
      
      setError(errorMessage);
      console.log('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EAF8EE" }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Botón de volver */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* === Card centrada === */}
          <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Iniciar sesión</Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#777"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Contraseña"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.passwordInput}
                  placeholderTextColor="#777"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {error && <Text style={styles.error}>{error}</Text>}
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Cargando...' : 'Ingresar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>No tienes una cuenta? Regístrate</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    padding: 8,
    zIndex: 1,
  },
  card: {
    height: height * 0.4, // 60% del alto de pantalla
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#15A266',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,

    // distribución interna
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#1a1a1a',
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 14,
    height: 48,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: '#1a1a1a',
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  error: {
    color: '#fff',
    backgroundColor: '#D32F2F',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    textAlign: 'center',
    fontSize: 15,
  },
  footer: {
    marginTop: 10,
  },
  button: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D5C3C',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
  registerButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0D5C3C',
    borderRadius: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
