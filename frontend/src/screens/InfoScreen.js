import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function InfoScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('fertilizantes');

  const tabs = [
    { id: 'fertilizantes', title: 'Fertilizantes', icon: 'leaf' },
    { id: 'riego', title: 'Riego', icon: 'water' },
    { id: 'luz', title: 'Luz', icon: 'sunny' },
    { id: 'plagas', title: 'Plagas', icon: 'bug' },
    { id: 'poda', title: 'Poda', icon: 'cut' }
  ];

  const renderFertilizantes = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Tipos de Fertilizantes</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="leaf" size={24} color="#15A266" />
          <Text style={styles.cardTitle}>Fertilizantes Orgánicos</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Compost casero: Rico en nutrientes, mejora la estructura del suelo{'\n'}
          • Humus de lombriz: Alto contenido en nitrógeno{'\n'}
          • Estiércol: Excelente para plantas de exterior{'\n'}
          • Ceniza de madera: Fuente de potasio y fósforo
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="flask" size={24} color="#FF6B35" />
          <Text style={styles.cardTitle}>Fertilizantes Químicos</Text>
        </View>
        <Text style={styles.cardDescription}>
          • NPK 20-20-20: Balanceado para uso general{'\n'}
          • NPK 10-30-20: Alto en fósforo para floración{'\n'}
          • NPK 30-10-10: Alto en nitrógeno para crecimiento{'\n'}
          • Fertilizantes líquidos: Absorción rápida
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={24} color="#4A90E2" />
          <Text style={styles.cardTitle}>Frecuencia de Aplicación</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Plantas de interior: Cada 2-4 semanas en primavera/verano{'\n'}
          • Plantas de exterior: Cada 4-6 semanas{'\n'}
          • Plantas en floración: Cada 2 semanas{'\n'}
          • En invierno: Reducir o suspender la fertilización
        </Text>
      </View>
    </View>
  );

  const renderRiego = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Guía de Riego</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="water" size={24} color="#4A90E2" />
          <Text style={styles.cardTitle}>Frecuencia de Riego</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Plantas suculentas: Cada 7-14 días{'\n'}
          • Plantas tropicales: Cada 3-5 días{'\n'}
          • Plantas de interior: Cada 5-7 días{'\n'}
          • Plantas de exterior: Según clima y estación
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="thermometer" size={24} color="#FF6B35" />
          <Text style={styles.cardTitle}>Temperatura del Agua</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Usar agua a temperatura ambiente{'\n'}
          • Evitar agua muy fría o muy caliente{'\n'}
          • Dejar reposar el agua del grifo 24h{'\n'}
          • Usar agua de lluvia cuando sea posible
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="warning" size={24} color="#FF6B35" />
          <Text style={styles.cardTitle}>Señales de Problemas</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Hojas amarillas: Exceso de riego{'\n'}
          • Hojas secas y crujientes: Falta de agua{'\n'}
          • Hojas caídas: Riego irregular{'\n'}
          • Raíces podridas: Drenaje insuficiente
        </Text>
      </View>
    </View>
  );

  const renderLuz = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Necesidades de Luz</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="sunny" size={24} color="#FFD700" />
          <Text style={styles.cardTitle}>Luz Directa</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Plantas: Cactus, suculentas, geranios{'\n'}
          • Horas: 6-8 horas diarias{'\n'}
          • Ubicación: Ventanas sur o suroeste{'\n'}
          • Precauciones: Evitar quemaduras en verano
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="partly-sunny" size={24} color="#FFA500" />
          <Text style={styles.cardTitle}>Luz Indirecta</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Plantas: Ficus, monstera, potos{'\n'}
          • Horas: 4-6 horas diarias{'\n'}
          • Ubicación: Cerca de ventanas con cortinas{'\n'}
          • Ideal para: La mayoría de plantas de interior
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="moon" size={24} color="#4A90E2" />
          <Text style={styles.cardTitle}>Luz Baja</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Plantas: Sansevieria, zamioculcas, aglaonema{'\n'}
          • Horas: 2-4 horas diarias{'\n'}
          • Ubicación: Lejos de ventanas{'\n'}
          • Perfectas para: Oficinas y espacios oscuros
        </Text>
      </View>
    </View>
  );

  const renderPlagas = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Control de Plagas</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="bug" size={24} color="#8B4513" />
          <Text style={styles.cardTitle}>Plagas Comunes</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Pulgones: Pequeños insectos verdes o negros{'\n'}
          • Arañas rojas: Telarañas finas en las hojas{'\n'}
          • Cochinillas: Manchas blancas algodonosas{'\n'}
          • Mosca blanca: Pequeñas moscas blancas
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#15A266" />
          <Text style={styles.cardTitle}>Tratamientos Naturales</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Jabón potásico: Diluir en agua y pulverizar{'\n'}
          • Aceite de neem: Insecticida natural{'\n'}
          • Alcohol isopropílico: Para cochinillas{'\n'}
          • Agua con ajo: Repelente natural
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="eye" size={24} color="#4A90E2" />
          <Text style={styles.cardTitle}>Prevención</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Revisar plantas regularmente{'\n'}
          • Mantener buena ventilación{'\n'}
          • Evitar exceso de humedad{'\n'}
          • Aislar plantas infectadas
        </Text>
      </View>
    </View>
  );

  const renderPoda = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Técnicas de Poda</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="cut" size={24} color="#8B4513" />
          <Text style={styles.cardTitle}>Cuándo Podar</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Plantas de interior: Todo el año{'\n'}
          • Plantas de exterior: Finales de invierno{'\n'}
          • Plantas en flor: Después de la floración{'\n'}
          • Evitar: Durante floración activa
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="construct" size={24} color="#FF6B35" />
          <Text style={styles.cardTitle}>Herramientas Necesarias</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Tijeras de podar: Para ramas delgadas{'\n'}
          • Tijeras de jardín: Para hojas y tallos{'\n'}
          • Sierra de podar: Para ramas gruesas{'\n'}
          • Desinfectante: Para limpiar herramientas
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#15A266" />
          <Text style={styles.cardTitle}>Técnicas Básicas</Text>
        </View>
        <Text style={styles.cardDescription}>
          • Cortar justo por encima de un nudo{'\n'}
          • Eliminar ramas muertas o enfermas{'\n'}
          • Mantener la forma natural de la planta{'\n'}
          • Desinfectar herramientas entre cortes
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'fertilizantes':
        return renderFertilizantes();
      case 'riego':
        return renderRiego();
      case 'luz':
        return renderLuz();
      case 'plagas':
        return renderPlagas();
      case 'poda':
        return renderPoda();
      default:
        return renderFertilizantes();
    }
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
        <Text style={styles.headerTitle}>Guía de Cuidados</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={18}                                   // ← antes 20
              color={activeTab === tab.id ? '#fff' : '#15A266'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 3,
  },
  backButton: { padding: 6 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15A266',
    letterSpacing: 0.5,
  },
  headerSpacer: { width: 32 },

  /* TABS */
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabsContent: {
    paddingHorizontal: 12,    // ← antes 16
    paddingVertical: 6,       // ← antes 10/12
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,    // ← antes 16
    paddingVertical: 6,       // ← antes 8
    marginRight: 8,           // ← antes 10/12
    borderRadius: 16,         // ← antes 25
    backgroundColor: '#F3F4F6',
    gap: 6,                   // ← antes 8
    elevation: 0,             // sin sombra para que se vea más fino
  },
  activeTab: {
    backgroundColor: '#15A266',
  },
  tabText: {
    fontSize: 14,             // ← antes 15
    fontWeight: '600',
    color: '#15A266',
  },
  activeTabText: { color: '#fff' },
  

  /* SCROLL PRINCIPAL */
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingVertical: 24 },

  /* SECCIÓN */
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15A266',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  /* CARD DE INFORMACIÓN */
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  cardDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 23,
  },
});
