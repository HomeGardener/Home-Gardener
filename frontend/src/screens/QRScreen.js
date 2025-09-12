import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function QRScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  const requestCameraPermission = async () => {
    try {
      const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      }
      if (status !== 'granted' && canAskAgain) {
        const { status: reqStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const granted = reqStatus === 'granted';
        setHasPermission(granted);
        return granted;
      }
      setHasPermission(false);
      return false;
    } catch (e) {
      setHasPermission(false);
      return false;
    }
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const takePicture = async () => {
    const permitted = await requestCameraPermission();
    if (!permitted) {
      Alert.alert('Permisos', 'Se necesita permiso para acceder a la cámara');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const pickImage = async () => {
    const permitted = await requestMediaLibraryPermission();
    if (!permitted) {
      Alert.alert('Permisos', 'Se necesita permiso para acceder a la galería');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const analyzeImage = () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Por favor selecciona una imagen primero');
      return;
    }

    Alert.alert(
      'Análisis de Planta',
      'La imagen ha sido procesada. En una implementación real, aquí se mostrarían los resultados del análisis de la planta.',
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('Análisis completado para:', selectedImage.uri);
          }
        }
      ]
    );
  };

  const clearImage = () => {
    setSelectedImage(null);
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
        <Text style={styles.headerTitle}>Análisis de Plantas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instrucciones */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="camera-outline" size={48} color="#15A266" />
          <Text style={styles.instructionsTitle}>Analiza tu planta</Text>
          <Text style={styles.instructionsText}>
            Toma una foto o selecciona una imagen de tu planta para obtener información detallada sobre su estado de salud, tipo de planta y recomendaciones de cuidado.
          </Text>
        </View>

        {/* Imagen seleccionada */}
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.actionButton} onPress={analyzeImage}>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Analizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={clearImage}>
                <Ionicons name="trash" size={20} color="#15A266" />
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={80} color="#ccc" />
            <Text style={styles.placeholderText}>No hay imagen seleccionada</Text>
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={takePicture}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Tomar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#15A266" />
            <Text style={styles.secondaryButtonText}>Seleccionar de Galería</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Consejos para mejores resultados:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#15A266" />
              <Text style={styles.tipText}>Asegúrate de que la planta esté bien iluminada</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#15A266" />
              <Text style={styles.tipText}>Enfoca las hojas y el tallo principal</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#15A266" />
              <Text style={styles.tipText}>Evita sombras y reflejos</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#15A266" />
              <Text style={styles.tipText}>Mantén la cámara estable</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#15A266',
    marginTop: 12,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  selectedImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 16,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15A266',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#15A266',
  },
  secondaryButtonText: {
    color: '#15A266',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.7,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15A266',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#15A266',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});
