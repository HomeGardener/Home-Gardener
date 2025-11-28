// src/navigation/AppNavigator.js
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
  HistorialDeChats
} from '../screens';

import withLayout from '../utils/withLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const Stack = createNativeStackNavigator();

// Envolvemos cada screen con Layout
const HomeWithLayout                 = withLayout(HomeScreen);
const PlantasWithLayout              = withLayout(PlantasScreen);
const AgregarPlantaWithLayout        = withLayout(AgregarPlanta);
const AgregarAmbienteWithLayout      = withLayout(AgregarAmbiente);
const QRWithLayout                   = withLayout(QRScreen);
const InfoWithLayout                 = withLayout(InfoScreen);
const PerfilWithLayout               = withLayout(PerfilScreen);
const EditarPerfilWithLayout         = withLayout(EditarPerfilScreen);
const InfoPlantaWithLayout           = withLayout(InfoPlantaScreen);
const ChatbotWithLayout              = withLayout(ChatbotScreen);
const InfoSistemaRiegoWithLayout     = withLayout(InfoSistemaRiego);
const ComprarSistemaRiegoWithLayout  = withLayout(ComprarSistemaRiego);
const HistorialDeChatsWithLayout     = withLayout(HistorialDeChats);

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      {/* Rutas públicas */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Bienvenido" component={BienvenidoScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Rutas protegidas */}
      <Stack.Screen name="Home">
        {(props) => (
          <ProtectedRoute>
            <HomeWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Plantas">
        {(props) => (
          <ProtectedRoute>
            <PlantasWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="AgregarPlanta">
        {(props) => (
          <ProtectedRoute>
            <AgregarPlantaWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="AgregarAmbiente">
        {(props) => (
          <ProtectedRoute>
            <AgregarAmbienteWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="QR">
        {(props) => (
          <ProtectedRoute>
            <QRWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Info">
        {(props) => (
          <ProtectedRoute>
            <InfoWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Perfil">
        {(props) => (
          <ProtectedRoute>
            <PerfilWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="EditarPerfil">
        {(props) => (
          <ProtectedRoute>
            <EditarPerfilWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="InfoPlanta">
        {(props) => (
          <ProtectedRoute>
            <InfoPlantaWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Chatbot">
        {(props) => (
          <ProtectedRoute>
            <ChatbotWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="HistorialDeChats">
        {(props) => (
          <ProtectedRoute>
            <HistorialDeChatsWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="InfoSistemaRiego">
        {(props) => (
          <ProtectedRoute>
            <InfoSistemaRiegoWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="ComprarSistemaRiego">
        {(props) => (
          <ProtectedRoute>
            <ComprarSistemaRiegoWithLayout {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
