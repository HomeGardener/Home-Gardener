// /auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
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
  greenDark: '#0F7C4E',
  danger: '#EF4444',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }
    setLoading(true);
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (sbError) {
      setError(sbError.message);
    } else {
      Alert.alert(
        'Correo enviado',
        'Revisá tu email para cambiar la contraseña.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);

  return (
    <View style={s.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={s.card}>
          <Text style={s.title}>Recuperar contraseña</Text>
          <Text style={s.subtitle}>
            Ingresá tu correo y te enviaremos un enlace para restablecerla.
          </Text>

          <View style={[
            s.inputWrap,
            email.length > 0 && !isEmailValid && { borderColor: COLORS.danger }
          ]}>
            <TextInput
              placeholder="tuemail@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={s.input}
              editable={!loading}
            />
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[s.btnPrimary, (loading || !isEmailValid) && s.btnDisabled]}
            onPress={handleResetPassword}
            disabled={loading || !isEmailValid}
            activeOpacity={0.9}
          >
            <Text style={s.btnPrimaryText}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={s.btnSecondaryText}>Volver a iniciar sesión</Text>
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
  inputWrap: {
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
  },
  error: {
    marginTop: 8,
    color: COLORS.danger,
    textAlign: 'center',
    fontSize: 13,
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
  btnDisabled: {
    backgroundColor: '#8BCDB3',
  },
  btnSecondary: {
    marginTop: 10,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: COLORS.green,
    fontWeight: '700',
    fontSize: 15,
  },
});
