import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigationState } from '@react-navigation/native';

export default function Footer({ navigation }) {
  // Obtener la ruta actual
  const currentRoute = useNavigationState(state => {
    if (state && state.routes && state.routes.length > 0) {
      return state.routes[state.index]?.name;
    }
    return null;
  });

  return (
    <View style={styles.footer}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Home')}
        style={[styles.tab, currentRoute === 'Home' && styles.activeTab]}
      >
        <Ionicons 
          name="home" 
          color={currentRoute === 'Home' ? '#a5d034' : '#000'} 
          size={24} 
        />
        <Text style={[styles.link, currentRoute === 'Home' && styles.activeLink]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Plantas')}
        style={[styles.tab, currentRoute === 'Plantas' && styles.activeTab]}
      >
        <Ionicons 
          name="leaf-outline" 
          color={currentRoute === 'Plantas' ? '#a5d034' : '#000'} 
          size={24} 
        />
        <Text style={[styles.link, currentRoute === 'Plantas' && styles.activeLink]}>Plantas</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('QR')}
        style={[styles.tab, currentRoute === 'QR' && styles.activeTab]}
      >
        <Ionicons 
          name="qr-code" 
          color={currentRoute === 'QR' ? '#a5d034' : '#000'} 
          size={24} 
        />
        <Text style={[styles.link, currentRoute === 'QR' && styles.activeLink]}>QR</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Info')}
        style={[styles.tab, currentRoute === 'Info' && styles.activeTab]}
      >
        <Feather 
          name="book" 
          color={currentRoute === 'Info' ? '#a5d034' : '#000'} 
          size={24} 
        />
        <Text style={[styles.link, currentRoute === 'Info' && styles.activeLink]}>Info</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Perfil')}
        style={[styles.tab, currentRoute === 'Perfil' && styles.activeTab]}
      >
        <Feather 
          name="user" 
          color={currentRoute === 'Perfil' ? '#a5d034' : '#000'} 
          size={24} 
        />
        <Text style={[styles.link, currentRoute === 'Perfil' && styles.activeLink]}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(165, 208, 52, 0.1)',
  },
  link: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 2,
  },
  activeLink: {
    color: '#a5d034',
  },
});
