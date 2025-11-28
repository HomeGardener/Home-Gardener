import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Notifications() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: '¡Riego automático activado!',
      message: 'Tu planta "Monstera" ha sido regada automáticamente',
      time: 'Hace 5 minutos',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'Temperatura alta detectada',
      message: 'La temperatura en tu jardín interior ha superado los 28°C',
      time: 'Hace 15 minutos',
      type: 'warning',
      read: false
    },
    {
      id: 3,
      title: 'Nueva planta agregada',
      message: 'Has agregado exitosamente "Cactus" a tu colección',
      time: 'Hace 1 hora',
      type: 'info',
      read: true
    },
    {
      id: 4,
      title: 'Recordatorio de fertilización',
      message: 'Es momento de fertilizar tu planta "Orquídea"',
      time: 'Hace 2 horas',
      type: 'reminder',
      read: true
    },
    {
      id: 5,
      title: 'Humedad baja',
      message: 'La humedad en el ambiente "Sala de estar" está por debajo del 40%',
      time: 'Hace 3 horas',
      type: 'warning',
      read: true
    },
    {
      id: 6,
      title: 'Sistema de ventilación activado',
      message: 'El ventilador se ha encendido automáticamente para regular la temperatura',
      time: 'Hace 4 horas',
      type: 'info',
      read: true
    },
    {
      id: 7,
      title: 'Nivel de agua bajo',
      message: 'El tanque de riego está al 20% de su capacidad',
      time: 'Hace 5 horas',
      type: 'warning',
      read: true
    },
    {
      id: 8,
      title: 'Planta floreciendo',
      message: '¡Tu "Orquídea" ha comenzado a florecer!',
      time: 'Hace 6 horas',
      type: 'success',
      read: true
    },
    {
      id: 9,
      title: 'Mantenimiento programado',
      message: 'Recordatorio: Revisar sensores de humedad mañana',
      time: 'Hace 1 día',
      type: 'reminder',
      read: true
    },
    {
      id: 10,
      title: 'Conexión restaurada',
      message: 'La conexión con el sensor "Temperatura" se ha restaurado',
      time: 'Hace 1 día',
      type: 'success',
      read: true
    }
  ]);

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      case 'reminder':
        return 'time';
      default:
        return 'notifications';
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      case 'reminder':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity 
        style={styles.notificationButton} 
        onPress={toggleExpanded}
        activeOpacity={0.7}
        pointerEvents="auto"
      >
        <Ionicons name="notifications" size={24} color="#fff" />
        {getUnreadCount() > 0 && (
          <View style={styles.badge} pointerEvents="none">
            <Text style={styles.badgeText}>{getUnreadCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.notificationsPanel} pointerEvents="auto">
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={toggleExpanded}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.notificationsList} 
            showsVerticalScrollIndicator={true}
            indicatorStyle="black"
            bounces={true}
            alwaysBounceVertical={false}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
          >
            {notifications.map((notification) => (
              <View 
                key={notification.id} 
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadItem
                ]}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons 
                    name={getIconByType(notification.type)} 
                    size={20} 
                    color={getColorByType(notification.type)} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  notificationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#a5d034',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationsPanel: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 320,
    maxHeight: 450,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationsList: {
    flex: 1,
    maxHeight: 350,
    minHeight: 200,
  },
  scrollContent: {
    paddingBottom: 15,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  unreadItem: {
    backgroundColor: '#f8f9fa',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a5d034',
    marginLeft: 8,
    marginTop: 6,
  },
}); 