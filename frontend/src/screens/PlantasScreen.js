import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PlantasScreen({ navigation, baseUrl = process.env.EXPO_PUBLIC_API_URL }) {
  const [plantas, setPlantas] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({}); // { [ambienteId]: boolean }
  const [collapsedOrphans, setCollapsedOrphans] = useState(false); // para "Sin ambiente"

  const getToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de usuario');
    return token;
  };

  const fetchAmbientes = async () => {
    const token = await getToken();
    const res = await fetch(`${baseUrl}/api/ambiente/listar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'No se pudieron obtener los ambientes');
    }
    const data = await res.json();
    // Normalizo a {ID, Nombre}
    const list = (data.ambientes || []).map(a => ({
      ID: a.ID ?? a.Id ?? a.id,
      Nombre: a.Nombre ?? a.name ?? a.title ?? 'Ambiente',
    }));
    return list;
  };

  const fetchPlantas = async () => {
    const token = await getToken();
    const res = await fetch(`${baseUrl}/api/plantas/misPlantas`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'No se pudieron obtener las plantas');
    }
    const data = await res.json();
    // Normalizo plantas
    return data.map(planta => ({
      id: planta.ID,
      nombre: planta.Nombre,
      estado: planta.Tipo,
      // 👇 ajustá el nombre del campo de ambiente si tu API usa otro
      ambienteId: planta.IdAmbiente ?? planta.idAmbiente ?? planta.AmbienteID ?? null,
      imagen: planta.Foto ? { uri: planta.Foto } : require('../../assets/image1.png'),
    }));
  };

  const load = async () => {
    setLoading(true);
    try {
      const [ambs, pls] = await Promise.all([fetchAmbientes(), fetchPlantas()]);
      setAmbientes(ambs);
      setPlantas(pls);
      // Inicializa colapsados en false (abiertos)
      const initial = {};
      ambs.forEach(a => { if (a?.ID != null) initial[a.ID] = false; });
      setCollapsed(initial);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo cargar la información');
      setAmbientes([]);
      setPlantas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const confirmEliminar = (id, nombre) => {
    Alert.alert(
      'Eliminar planta',
      `¿Seguro que deseas eliminar "${nombre}"? Si tiene un módulo conectado, primero debes desconectarlo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleEliminar(id) },
      ]
    );
  };

  const handleEliminar = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/plantas/eliminar`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPlanta: Number(id) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo eliminar la planta');
      }
      setPlantas(prev => prev.filter(p => p.id !== id));
      Alert.alert('Éxito', 'Planta eliminada');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo eliminar la planta');
    }
  };

  // Agrupado por ambiente
  const grouped = (() => {
    const map = new Map();
    ambientes.forEach(a => map.set(a.ID, []));
    const orphans = [];
    plantas.forEach(p => {
      const ambId = p.ambienteId;
      if (ambId != null && map.has(ambId)) {
        map.get(ambId).push(p);
      } else {
        orphans.push(p);
      }
    });
    return { map, orphans };
  })();

  const renderPlantRow = (item) => (
    <View key={item.id} style={styles.fileRow}>
      <TouchableOpacity
        style={styles.fileLeft}
        onPress={() => navigation.navigate('InfoPlanta', { idPlanta: item.id })}
      >
        <Image source={item.imagen} style={styles.fileThumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.fileTitle} numberOfLines={1}>{item.nombre}</Text>
          <Text style={styles.fileMeta} numberOfLines={1}>{item.estado}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.fileActions}>
        <TouchableOpacity onPress={() => confirmEliminar(item.id, item.nombre)}>
          <MaterialCommunityIcons name="delete-outline" size={22} color="#D32F2F" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#22A45D" />
      </View>
    </View>
  );

  const renderFolder = (ambiente) => {
    const items = grouped.map.get(ambiente.ID) || [];
    const isCollapsed = collapsed[ambiente.ID] ?? false;

    return (
      <View key={ambiente.ID} style={styles.folderCard}>
        <TouchableOpacity
          style={styles.folderHeader}
          onPress={() => setCollapsed(prev => ({ ...prev, [ambiente.ID]: !isCollapsed }))}
          activeOpacity={0.8}
        >
          <View style={styles.folderLeft}>
            <MaterialCommunityIcons
              name={isCollapsed ? 'folder' : 'folder-open'}
              size={24}
              color="#F59E0B"
            />
            <Text style={styles.folderTitle} numberOfLines={1}>{ambiente.Nombre}</Text>
          </View>
          <View style={styles.folderRight}>
            <Text style={styles.folderCount}>{items.length}</Text>
            <MaterialCommunityIcons
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={22}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {!isCollapsed && (
          items.length > 0
            ? <View style={styles.filesWrap}>{items.map(renderPlantRow)}</View>
            : <Text style={styles.emptyFolder}>No hay plantas en este ambiente.</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22A45D" />
        <Text>Cargando ambientes y plantas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Plantas por Ambiente</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Carpeta por ambiente */}
        {ambientes.map(renderFolder)}

        {/* Carpeta “Sin ambiente” si corresponde */}
        {grouped.orphans.length > 0 && (
          <View style={styles.folderCard}>
            <TouchableOpacity
              style={styles.folderHeader}
              onPress={() => setCollapsedOrphans(prev => !prev)}
              activeOpacity={0.8}
            >
              <View style={styles.folderLeft}>
                <MaterialCommunityIcons
                  name={collapsedOrphans ? 'folder' : 'folder-open'}
                  size={24}
                  color="#64748B"
                />
                <Text style={styles.folderTitle} numberOfLines={1}>Sin ambiente</Text>
              </View>
              <View style={styles.folderRight}>
                <Text style={styles.folderCount}>{grouped.orphans.length}</Text>
                <MaterialCommunityIcons
                  name={collapsedOrphans ? 'chevron-down' : 'chevron-up'}
                  size={22}
                  color="#666"
                />
              </View>
            </TouchableOpacity>

            {!collapsedOrphans && (
              <View style={styles.filesWrap}>
                {grouped.orphans.map(renderPlantRow)}
              </View>
            )}
          </View>
        )}

        {/* Botones de acción */}
        <TouchableOpacity
          style={styles.botonAgregarPlanta}
          onPress={() => navigation.navigate('AgregarPlanta')}
        >
          <Text style={styles.textoBoton}>Agregar planta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonAgregarAmbiente}
          onPress={() => navigation.navigate('AgregarAmbiente')}
        >
          <Text style={styles.textoBoton}>Agregar ambiente</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6FAF0' },
  titulo: {
    fontSize: 22,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },

  // Folder (Ambiente)
  folderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  folderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  folderTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  folderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  folderCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    fontWeight: '700',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },

  // Files (Plantas)
  filesWrap: { marginTop: 10, gap: 10 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
  },
  fileLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#D9D9D9' },
  fileTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  fileMeta: { fontSize: 12, color: '#6B7280' },
  fileActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Buttons
  botonAgregarPlanta: {
    backgroundColor: '#22A45D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  botonAgregarAmbiente: {
    backgroundColor: '#1E8449',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6FAF0',
  },
});
