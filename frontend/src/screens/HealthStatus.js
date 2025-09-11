import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { createAPI } from "../services/api";
import { getHealthStatus } from "../services/healthService";
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HealthStatus({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL }) {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  // Nueva instancia si cambia la URL
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);

  // Guardar el interval id para limpiar
  const intervalRef = useRef(null);

  const fetchOnce = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getHealthStatus(api);
      setHealth(data);
      setLastUpdated(new Date().toISOString());
    } catch (e) {
      setError(e?.message || "Fallo al consultar /health");
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnce(); // primera vez
    intervalRef.current = setInterval(fetchOnce, 10000); // cada 10s
    return () => clearInterval(intervalRef.current);
  }, [api]); // se reinicia si cambia la URL

  const getStatusColor = (status) => {
    if (status === 'ok' || status === 'healthy') return '#15A266';
    if (status === 'warning') return '#FFA500';
    return '#FF6B35';
  };

  const getStatusIcon = (status) => {
    if (status === 'ok' || status === 'healthy') return 'checkmark-circle';
    if (status === 'warning') return 'warning';
    return 'close-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estado del Servidor</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Base URL */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="server" size={24} color="#4A90E2" />
            <Text style={styles.cardTitle}>URL del Servidor</Text>
          </View>
          <Text style={styles.cardDescription}>{baseUrl}</Text>
        </View>

        {/* Estado de conexión */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#15A266" />
            <Text style={styles.loadingText}>Verificando conexión...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle" size={24} color="#FF6B35" />
              <Text style={styles.cardTitle}>Error de Conexión</Text>
            </View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {health && !loading && (
          <View style={styles.healthContainer}>
            {/* Status principal */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons 
                  name={getStatusIcon(health.status)} 
                  size={32} 
                  color={getStatusColor(health.status)} 
                />
                <Text style={styles.statusTitle}>Estado del Servidor</Text>
              </View>
              <Text style={[styles.statusText, { color: getStatusColor(health.status) }]}>
                {String(health.status).toUpperCase()}
              </Text>
            </View>

            {/* Detalles */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Información del Servidor</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mensaje:</Text>
                <Text style={styles.detailValue}>{health.message}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Timestamp:</Text>
                <Text style={styles.detailValue}>
                  {new Date(health.timestamp).toLocaleString('es-ES')}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Entorno:</Text>
                <Text style={styles.detailValue}>{health.environment}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Última actualización */}
        {lastUpdated && (
          <View style={styles.updateCard}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.updateText}>
              Última actualización: {new Date(lastUpdated).toLocaleString('es-ES')}
            </Text>
          </View>
        )}

        {/* Botón de actualización manual */}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchOnce}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.refreshButtonText}>Actualizar Estado</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'monospace',
  },
  healthContainer: {
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  updateText: {
    fontSize: 12,
    color: '#666',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15A266',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#15A266',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
