import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ImageBackground, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const PLANTS = [
  { id: 1, name: "Albahaca", note: "Fue regada a las 5:02", status: "ok" },
  { id: 2, name: "Tomate", note: "No recibe la suficiente cantidad de luz", status: "warn" },
  { id: 3, name: "Frutilla", note: "Recibe demasiada luz", status: "alert" },
];

const statusColor = {
  ok: "#2ecc71",
  warn: "#f1c40f",
  alert: "#ff6b6b",
};

export default function HomeScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL  }) {
  const { user, loading } = useAuth();

  if (loading) return <Text style={styles.loading}>Cargando...</Text>;

  if (!user) return <Text style={styles.error}>No hay datos de usuario</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header con imagen */}
      <View style={styles.headerWrap}>
        <ImageBackground
          style={styles.headerImage}
          imageStyle={styles.headerImageRadius}
          source={{
            uri: "https://picsum.photos/800/200",
          }}
        >
          <View style={styles.headerOverlay} />
        </ImageBackground>

        <View style={styles.logoCircle}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/7665/7665332.png",
            }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bienvenida */}
      <View style={styles.greetingBox}>
        <Text style={styles.greetingText}>Bienvenido/a a Home</Text>
        <Text style={styles.greetingText}>Gardener</Text>
        <Text style={styles.greetingName}>{user.Nombre}</Text>
      </View>

      {/* Lista de plantas */}
      <View style={styles.list}>
        {PLANTS.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{p.name}</Text>
              <Text
                style={[
                  styles.cardNote,
                  p.status === "ok" && { color: "#6c757d" },
                  p.status === "warn" && { color: "#d39e00" },
                  p.status === "alert" && { color: "#e35d6a" },
                ]}
                numberOfLines={2}
              >
                {p.note}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: statusColor[p.status] }]} />
          </View>
        ))}
      </View>

      {/* Botón para ChatBot */}
      <TouchableOpacity 
        style={styles.boton} 
        onPress={() => navigation.navigate('Chatbot')}
      >
        <Text style={styles.botonText}>Ir al ChatBot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf8ee" },
  loading: { textAlign: 'center', marginTop: 50 },
  error: { color: 'red', textAlign: 'center', marginTop: 50 },
  headerWrap: { position: "relative" },
  headerImage: { height: 160, width: "100%" },
  headerImageRadius: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.1)" },
  logoCircle: {
    position: "absolute",
    left: "50%",
    bottom: -32,
    transform: [{ translateX: -32 }],
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: { height: 40, width: 40 },
  greetingBox: { marginTop: 48, alignItems: "center" },
  greetingText: { fontSize: 22, color: "#555", fontWeight: "600" },
  greetingName: { fontSize: 24, color: "#111", fontWeight: "700", marginTop: 4 },
  list: { marginTop: 20, paddingHorizontal: 16, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardLeft: { flexShrink: 1, paddingRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cardNote: { fontSize: 13 },
  statusDot: { height: 20, width: 20, borderRadius: 10 },
  boton: {
    margin: 20,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#15A266",
    alignItems: "center",
  },
  botonText: { color: "#fff", fontWeight: "700" },
});