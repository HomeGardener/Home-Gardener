import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { getApiBaseUrl } from "../services/api";
import LogoutButton from "../components/LogoutButton";
import CalendarAgenda from "../components/CalendarAgenda";

export default function PerfilScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = React.useState(!user);
  const [imageError, setImageError] = React.useState(false);

  // Base de la API, saneada sin barra final
  const apiBase = React.useMemo(() => {
    const raw = baseUrl || getApiBaseUrl() || "";
    return raw.replace(/\/$/, "");
  }, [baseUrl]);

  const fetchProfile = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          await updateUser(data.user);
        }
      }
    } catch (e) {
      console.log("Error cargando perfil:", e?.message || e);
    } finally {
      setLoading(false);
    }
  }, [apiBase, updateUser]);

  React.useEffect(() => {
    if (!user) fetchProfile();
  }, [user, fetchProfile]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.full}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.title}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.full}>
        <View style={styles.center}>
          <Text style={styles.title}>No hay datos de usuario</Text>
        </View>
      </SafeAreaView>
    );
  }

  // URL de imagen segura
  const imageUrl =
    !imageError && user?.Foto
      ? `${apiBase}/backend/uploads/${encodeURIComponent(user.Foto)}`
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <SafeAreaView style={styles.full}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.imagen}
            onError={() => setImageError(true)}
          />
          <View style={{ alignItems: "center" }}>
            <Text style={styles.title}>Tu perfil</Text>
            <Text style={styles.subtitle}>Datos personales</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.text}><Text style={styles.label}>Nombre: </Text>{user?.Nombre || "-"}</Text>
          <Text style={styles.text}><Text style={styles.label}>Email: </Text>{user?.Email || "-"}</Text>
          <Text style={styles.text}><Text style={styles.label}>Dirección: </Text>{user?.Direccion || "-"}</Text>

          <TouchableOpacity
            style={styles.boton}
            onPress={() => navigation.navigate("EditarPerfil")}
          >
            <Text style={styles.botonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <LogoutButton navigation={navigation} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Agenda</Text>
          {/* Aseguramos alto mínimo para que se vea completa */}
          <View style={{ width: "100%", minHeight: 380 }}>
            <CalendarAgenda userId={user?.id_usuario || user?.id || "local"} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sistema de riego</Text>
          <Text style={styles.subtitle}>¿Quiere un sistema de riego?</Text>

          <TouchableOpacity
            style={styles.boton}
            onPress={() => navigation.navigate("InfoSistemaRiego")}
          >
            <Text style={styles.botonText}>Conoce más</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boton}
            onPress={() => navigation.navigate("ComprarSistemaRiego")}
          >
            <Text style={styles.botonText}>Comprar</Text>
          </TouchableOpacity>
        </View>

        {/* Espacio final para que nada quede cortado */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  headerCard: {
    width: "100%",
    backgroundColor: "#f5f7fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#fdfefe",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef2f7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold" },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8, alignSelf: "flex-start" },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 6 },
  text: { fontSize: 16, color: "#222" },
  label: { fontWeight: "600" },
  imagen: { width: 110, height: 110, borderRadius: 55, marginBottom: 8 },
  boton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#15A266",
    alignItems: "center",
    width: "100%",
  },
  botonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
