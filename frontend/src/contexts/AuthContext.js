import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken, setAuthToken, removeAuthToken } from '../services/authStorage';

const AuthContext = createContext();

const safeUser = (user) => user && ({
  ID: user.ID,
  Nombre: user.Nombre,
  Email: user.Email,
  Direccion: user.Direccion,
  Foto: user.Foto ?? null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await getAuthToken();
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        const parsedUser = safeUser(JSON.parse(storedUser));
        if (!parsedUser?.ID) throw new Error('Datos de usuario guardados inválidos');
        await AsyncStorage.setItem('userData', JSON.stringify(parsedUser));
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        await removeAuthToken();
        await AsyncStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await removeAuthToken().catch(() => {});
      await AsyncStorage.removeItem('userData').catch(() => {});
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, token) => {
    try {
      const storedUser = safeUser(userData);
      await setAuthToken(token);
      await AsyncStorage.setItem('userData', JSON.stringify(storedUser));
      
      setToken(token);
      setUser(storedUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const register = async (userData, token) => {
    try {
      const storedUser = safeUser(userData);
      await setAuthToken(token);
      await AsyncStorage.setItem('userData', JSON.stringify(storedUser));
      
      setToken(token);
      setUser(storedUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Error during register:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await removeAuthToken();
      await AsyncStorage.removeItem('userData');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  const updateUser = async (newUserData) => {
    try {
      const storedUser = safeUser(newUserData);
      await AsyncStorage.setItem('userData', JSON.stringify(storedUser));
      setUser(storedUser);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
