// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.7);

  useEffect(() => {
    // Animación de aparición y zoom suave
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Bienvenido');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image source={require('../../assets/image1.png')} style={styles.logo} />
        <Text style={styles.title}>Home Gardener</Text>
        <Text style={styles.slogan}>Watch them grow 🌿</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6FAF0', // verde claro suave
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#15A266',
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#16a34a',
    marginTop: 6,
  },
});
