import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../services/api';

const ENDPOINTS = {
  medir: '/api/sensores/medir',        // <-- ajusta si usás otro path (ej: '/api/sensores/forzarMedicion')
  regar: '/api/riego/regar',           // <-- ajusta si usás otro path (ej: '/api/sensores/regar')
  desconectarModulo: '/api/sensores/desconectarModulo',
  eliminarPlanta: '/api/plantas/eliminar',
  getInfo: '/api/plantas/getInfoPlanta',
};

export default function InfoPlanta({ route, navigation }) {
  const { idPlanta } = route.params;

  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [watering, setWatering] = useState(false);

  const numberOrNull = (v) =>
    v === null || v === undefined || v === '' || Number.isNaN(Number(v))
      ? null
      : Number(v);

  const fetchInfoPlanta = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de usuario');
        setPlanta(null);
        setLoading(false);
        return;
      }
      const baseUrl = getApiBaseUrl();
      const response = await fetch(
        `${baseUrl}${ENDPOINTS.getInfo}?idPlanta=${idPlanta}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert(
          'Error',
          errorData.message || 'No se pudo obtener la información de la planta'
        );
        setPlanta(null);
      } else {
        const data = await response.json();
        setPlanta(data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
      setPlanta(null);
    }
    setLoading(false);
  }, [idPlanta]);

  useEffect(() => {
    fetchInfoPlanta();
  }, [fetchInfoPlanta]);

  // ---------- Descripciones “humanas” ----------
  function describeHumidity(h) {
    if (h === null) return { label: 'Sin datos', hint: '—', tone: '#9E9E9E', pct: 0 };
    if (h < 30) return { label: 'Baja', hint: 'Riego recomendado', tone: '#EF6C00', pct: Math.max(5, h) };
    if (h <= 60) return { label: 'Óptima', hint: 'Nivel correcto', tone: '#22A45D', pct: h };
    return { label: 'Alta', hint: 'Evitar exceso de agua', tone: '#0288D1', pct: Math.min(100, h) };
  }

  function describeTemp(t) {
    if (t === null) return { label: 'Sin datos', hint: '—', tone: '#9E9E9E' };
    if (t < 15) return { label: 'Fría', hint: 'Cuidar del frío', tone: '#0288D1' };
    if (t <= 28) return { label: 'Confort', hint: 'Ideal', tone: '#22A45D' };
    return { label: 'Caliente', hint: 'Vigilar ventilación', tone: '#EF6C00' };
  }

  const formatDate = (isoLike) => {
    if (!isoLike) return '—';
    try {
      const d = new Date(isoLike);
      const dd = d.toLocaleString();
      return dd || '—';
    } catch {
      return '—';
    }
  };

  const confirmDisconnect = () => {
    if (!planta?.idModulo) {
      Alert.alert('Info', 'La planta no tiene un módulo conectado');
      return;
    }
    Alert.alert('Desconectar módulo', '¿Seguro que deseas desconectar el módulo de esta planta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desconectar', style: 'destructive', onPress: handleDisconnect },
    ]);
  };

  const handleDisconnect = async () => {
    try {
      setWorking(true);
      const token = await AsyncStorage.getItem('token');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${ENDPOINTS.desconectarModulo}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(idPlanta) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo desconectar el módulo');
      }
      setPlanta((prev) => ({ ...prev, idModulo: null }));
      Alert.alert('Éxito', 'Módulo desconectado');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo desconectar el módulo');
    } finally {
      setWorking(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar planta',
      '¿Seguro que deseas eliminar la planta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    try {
      setWorking(true);
      const token = await AsyncStorage.getItem('token');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${ENDPOINTS.eliminarPlanta}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(idPlanta) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo eliminar la planta');
      }
      Alert.alert('Éxito', 'Planta eliminada');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo eliminar la planta');
    } finally {
      setWorking(false);
    }
  };

  // ---------- Acciones principales ----------
  const requestMeasurement = async () => {
    try {
      setMeasuring(true);
      const token = await AsyncStorage.getItem('token');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${ENDPOINTS.medir}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(idPlanta) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo pedir la medición');
      }
      Alert.alert('Listo', 'Medición solicitada. Actualizando datos…');
      await fetchInfoPlanta();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo pedir la medición');
    } finally {
      setMeasuring(false);
    }
  };

  const requestWatering = async () => {
    try {
      setWatering(true);
      const token = await AsyncStorage.getItem('token');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${ENDPOINTS.regar}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(idPlanta) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo iniciar el riego');
      }
      Alert.alert('Listo', 'Riego iniciado. Actualizando datos…');
      await fetchInfoPlanta();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo iniciar el riego');
    } finally {
      setWatering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22A45D" />
        <Text style={{ marginTop: 8 }}>Cargando información…</Text>
      </View>
    );
  }

  if (!planta) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró información de la planta.</Text>
      </View>
    );
  }

  const humedad = numberOrNull(planta.humedad ?? planta.humedadPorc);
  const temperatura = numberOrNull(planta.temperatura ?? planta.temp);
  const hDesc = describeHumidity(humedad);
  const tDesc = describeTemp(temperatura);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.card}>
        <Text style={styles.titulo}>{planta.nombre}</Text>

        <Image
          source={planta.foto ? { uri: planta.foto } : require('../../assets/image1.png')}
          style={styles.imagen}
        />

        <View style={styles.badgesRow}>
          <Chip text={`Tipo: ${planta.tipo ?? '—'}`} />
          <Chip text={`Ambiente: ${planta.ambiente ?? '—'}`} />
          <Chip
            text={planta.idModulo ? 'Módulo: Conectado' : 'Módulo: Desconectado'}
            tone={planta.idModulo ? '#22A45D' : '#9E9E9E'}
          />
        </View>

        <View style={styles.metaRow}>
          <MetaItem label="ID Planta" value={String(planta.idPlanta)} />
          {planta.idModulo ? <MetaItem label="ID Módulo" value={String(planta.idModulo)} /> : null}
          <MetaItem label="Última medición" value={formatDate(planta.ultimaMedicion || planta.updatedAt)} />
        </View>
      </View>

      {/* Metrics Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Estado actual</Text>

        {/* Humedad */}
        <View style={styles.metricRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.metricLabel}>Humedad</Text>
            <Text style={[styles.metricValue, { color: hDesc.tone }]}>
              {humedad !== null ? `${humedad}% — ${hDesc.label}` : 'Sin datos'}
            </Text>
            <Text style={styles.metricHint}>{hDesc.hint}</Text>
            <Bar value={hDesc.pct} tone={hDesc.tone} />
          </View>
        </View>

        {/* Temperatura */}
        <View style={[styles.metricRow, { marginTop: 14 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.metricLabel}>Temperatura</Text>
            <Text style={[styles.metricValue, { color: tDesc.tone }]}>
              {temperatura !== null ? `${temperatura}°C — ${tDesc.label}` : 'Sin datos'}
            </Text>
            <Text style={styles.metricHint}>{tDesc.hint}</Text>
          </View>
        </View>
      </View>

      {/* Primary Actions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Acciones</Text>

        <View style={styles.actionsRow}>
          <PrimaryButton
            label="Pedir medición"
            onPress={requestMeasurement}
            disabled={measuring}
            loading={measuring}
          />
          <PrimaryOutlineButton
            label="Regar ahora"
            onPress={requestWatering}
            disabled={watering}
            loading={watering}
          />
        </View>

        {/* Maintenance actions */}
        <View style={[styles.actionsRow, { marginTop: 12 }]}>
          <NeutralButton
            label="Desconectar módulo"
            onPress={confirmDisconnect}
            disabled={working}
          />
          <DangerButton
            label="Eliminar planta"
            onPress={confirmDelete}
            disabled={working}
          />
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- UI helpers ---------- */
function Chip({ text, tone = '#607D8B' }) {
  return (
    <View style={[styles.chip, { borderColor: tone, backgroundColor: '#F7FAF8' }]}>
      <Text style={[styles.chipText, { color: tone }]}>{text}</Text>
    </View>
  );
}

function MetaItem({ label, value }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value ?? '—'}</Text>
    </View>
  );
}

function Bar({ value = 0, tone = '#22A45D' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: tone }]} />
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, loading }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, styles.btnPrimary, disabled && styles.btnDisabled]}
    >
      {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnPrimaryText}>{label}</Text>}
    </TouchableOpacity>
  );
}

function PrimaryOutlineButton({ label, onPress, disabled, loading }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, styles.btnOutline, disabled && styles.btnDisabled]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#22A45D" />
      ) : (
        <Text style={styles.btnOutlineText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

function NeutralButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, styles.btnNeutral, disabled && styles.btnDisabled]}
    >
      <Text style={styles.btnNeutralText}>{label}</Text>
    </TouchableOpacity>
  );
}

function DangerButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, styles.btnDanger, disabled && styles.btnDisabled]}
    >
      <Text style={styles.btnDangerText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    backgroundColor: '#F5FFF9', // fondo suave verdoso
  },
  container: {
    flex: 1,
    backgroundColor: '#F5FFF9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FFF9',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },

  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2E27',
    textAlign: 'center',
    marginBottom: 12,
  },
  imagen: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 12,
  },

  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  metaItem: {
    alignItems: 'center',
    minWidth: 110,
  },
  metaLabel: {
    fontSize: 12,
    color: '#607D8B',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2E27',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2E27',
    marginBottom: 10,
  },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 13,
    color: '#607D8B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricHint: {
    fontSize: 12,
    color: '#7E8B87',
    marginBottom: 8,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#E8F2EC',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 999,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimary: {
    backgroundColor: '#22A45D',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: '#22A45D',
    backgroundColor: '#fff',
  },
  btnOutlineText: {
    color: '#22A45D',
    fontSize: 14,
    fontWeight: '700',
  },
  btnNeutral: {
    backgroundColor: '#F1F5F4',
  },
  btnNeutralText: {
    color: '#1A2E27',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDanger: {
    backgroundColor: '#D32F2F',
  },
  btnDangerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
