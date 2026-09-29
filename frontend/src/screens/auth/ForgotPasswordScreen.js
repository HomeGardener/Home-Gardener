// /auth/ForgotPasswordScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const COLORS = {
  bg: '#EAF8EE',
  card: '#FFFFFF',
  border: '#E7ECEF',
  text: '#1F2937',
  muted: '#6B7280',
  green: '#15A266',
};

export default function ForgotPasswordScreen({ navigation }) {
  return (
    <View style={s.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={s.card}>
          <Text style={s.title}>Recuperar contraseña</Text>
          <Text style={s.subtitle}>
            La recuperación de contraseña todavía no está disponible para estas cuentas. Volvé a iniciar sesión o contactá al administrador.
          </Text>

          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.9}
          >
            <Text style={s.btnPrimaryText}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  btnPrimary: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
