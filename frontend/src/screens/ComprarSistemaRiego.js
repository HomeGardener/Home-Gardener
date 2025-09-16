import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { riegoService } from '../services/riegoService';

export default function ComprarSistemaRiego({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'basico',
      name: 'Plan Básico',
      price: '$89.99',
      description: 'Perfecto para empezar',
      features: [
        'Sensor de humedad básico',
        'Controlador simple',
        'Hasta 4 plantas',
        'Aplicación móvil',
        'Soporte por email'
      ]
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: '$149.99',
      description: 'El más popular',
      features: [
        'Sensor de humedad avanzado',
        'Controlador WiFi',
        'Hasta 12 plantas',
        'Aplicación móvil completa',
        'Integración con clima',
        'Soporte prioritario',
        'Instalación incluida'
      ],
      popular: true
    },
    {
      id: 'profesional',
      name: 'Plan Profesional',
      price: '$249.99',
      description: 'Para jardines grandes',
      features: [
        'Múltiples sensores',
        'Controlador inteligente',
        'Hasta 25 plantas',
        'Aplicación móvil premium',
        'Análisis de datos',
        'Soporte 24/7',
        'Instalación profesional',
        'Garantía extendida'
      ]
    }
  ];

  const handlePurchase = async (plan) => {
    setLoading(true);
    
    try {
      const result = await riegoService.confirmarCompra(plan.id);
      
      if (result.success) {
        Alert.alert(
          '¡Compra realizada exitosamente!',
          `Has seleccionado el ${plan.name} por ${plan.price}. Recibirás un email con los detalles de tu pedido y las instrucciones de instalación.`,
          [
            {
              text: 'Continuar comprando',
              onPress: () => setSelectedPlan(null)
            },
            {
              text: 'Volver al perfil',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(
          'Error en la compra',
          result.error || 'Hubo un problema al procesar tu compra. Por favor, inténtalo de nuevo.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error en handlePurchase:', error);
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Elige tu Sistema de Riego</Text>
      <Text style={styles.subtitle}>Selecciona el plan que mejor se adapte a tus necesidades</Text>

      {plans.map((plan) => (
        <View 
          key={plan.id} 
          style={[
            styles.planCard, 
            plan.popular && styles.popularCard,
            selectedPlan === plan.id && styles.selectedCard
          ]}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Más Popular</Text>
            </View>
          )}
          
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.pricePeriod}>una vez</Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Incluye:</Text>
            {plan.features.map((feature, index) => (
              <Text key={index} style={styles.feature}>✓ {feature}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.selectButton,
              selectedPlan === plan.id && styles.selectedButton
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <Text style={[
              styles.selectButtonText,
              selectedPlan === plan.id && styles.selectedButtonText
            ]}>
              {selectedPlan === plan.id ? 'Seleccionado' : 'Seleccionar'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.purchaseContainer}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (!selectedPlan || loading) && styles.disabledButton
          ]}
          onPress={() => {
            if (selectedPlan && !loading) {
              const plan = plans.find(p => p.id === selectedPlan);
              handlePurchase(plan);
            }
          }}
          disabled={!selectedPlan || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.purchaseButtonText}>
              Comprar Ahora
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => navigation.navigate('InfoSistemaRiego')}
        >
          <Text style={styles.infoButtonText}>Ver más información</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver al perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#15A266',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  planCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  popularCard: {
    borderColor: '#15A266',
    transform: [{ scale: 1.02 }],
  },
  selectedCard: {
    borderColor: '#15A266',
    backgroundColor: '#f0f8f4',
  },
  popularBadge: {
    backgroundColor: '#15A266',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#15A266',
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#15A266',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  feature: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  selectButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#15A266',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedButtonText: {
    color: '#fff',
  },
  purchaseContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  purchaseButton: {
    backgroundColor: '#15A266',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
