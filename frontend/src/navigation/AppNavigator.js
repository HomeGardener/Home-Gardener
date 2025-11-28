import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  SplashScreen, 
  LoginScreen,
  RegisterScreen, 
  HomeScreen, 
  PlantasScreen, 
  AgregarPlanta, 
  AgregarAmbiente,
  QRScreen,
  InfoScreen, 
  PerfilScreen, 
  BienvenidoScreen, 
  ForgotPasswordScreen, 
  EditarPerfilScreen,
  InfoPlantaScreen,
  ChatbotScreen,
  InfoSistemaRiego,
  ComprarSistemaRiego,
} from '../screens'

import Layout from '../components/Layout';  
import withLayout from '../utils/withLayout';  // Importa el HOC
import ProtectedRoute from '../components/ProtectedRoute';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Bienvenido" component={BienvenidoScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      {/* Rutas protegidas que requieren autenticación */}
      <Stack.Screen 
        name="Chatbot" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <ChatbotScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="Home" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <HomeScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="Plantas" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <PlantasScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="AgregarPlanta" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <AgregarPlanta {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="AgregarAmbiente" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <AgregarAmbiente {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="QR" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <QRScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="Info" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <InfoScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="Perfil" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <PerfilScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="EditarPerfil" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <EditarPerfilScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="InfoPlanta" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <InfoPlantaScreen {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="InfoSistemaRiego" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <InfoSistemaRiego {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="ComprarSistemaRiego" 
        component={withLayout((props) => (
          <ProtectedRoute>
            <ComprarSistemaRiego {...props} />
          </ProtectedRoute>
        ))} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}
