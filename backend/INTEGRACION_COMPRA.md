# 🔗 Integración Frontend-Backend para Compras

## 📋 Resumen de la Implementación

La funcionalidad de compra de sistemas de riego ahora está completamente integrada entre el frontend y backend.

## 🏗️ Arquitectura de la Integración

### Frontend (React Native)
```
ComprarSistemaRiego.js
├── riegoService.js (servicio API)
├── Estado de carga (loading)
├── Manejo de errores
└── Alertas de confirmación
```

### Backend (Node.js + Express)
```
riego-controller.js
├── /api/riego/confirmar-compra
├── Validación de autenticación
├── mail-service.js
└── Plantillas HTML de correo
```

## 🔄 Flujo de Compra

1. **Usuario selecciona plan** en `ComprarSistemaRiego.js`
2. **Presiona "Comprar Ahora"** → Se activa `handlePurchase()`
3. **Frontend envía petición** a `/api/riego/confirmar-compra`
4. **Backend valida token** de autenticación
5. **Backend procesa compra** y envía correo de confirmación
6. **Frontend recibe respuesta** y muestra alerta de éxito/error

## 📱 Frontend - Cambios Implementados

### 1. Servicio de Riego (`riegoService.js`)
```javascript
import { createAPI } from './api';

const api = createAPI();

export const riegoService = {
  async confirmarCompra(planId) {
    const response = await api.post('/api/riego/confirmar-compra', {
      planId
    });
    return response.data;
  }
  // ... otros métodos
};
```

### 2. Pantalla de Compra Actualizada
```javascript
// Estados agregados
const [loading, setLoading] = useState(false);

// Función de compra actualizada
const handlePurchase = async (plan) => {
  setLoading(true);
  try {
    const result = await riegoService.confirmarCompra(plan.id);
    // Manejo de respuesta exitosa
  } catch (error) {
    // Manejo de errores
  } finally {
    setLoading(false);
  }
};

// Botón con indicador de carga
<TouchableOpacity disabled={!selectedPlan || loading}>
  {loading ? (
    <ActivityIndicator color="#fff" size="small" />
  ) : (
    <Text>Comprar Ahora</Text>
  )}
</TouchableOpacity>
```

## 🖥️ Backend - Endpoints Implementados

### POST `/api/riego/confirmar-compra`
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "planId": "premium"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Compra confirmada exitosamente",
  "plan": {
    "name": "Plan Premium",
    "price": "$149.99",
    "features": ["..."]
  },
  "mailSent": true,
  "mailMessage": "Correo de confirmación enviado"
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "message": "Plan no válido"
}
```

## 📧 Sistema de Correos

### Correo de Confirmación de Compra
- **Plantilla:** `purchase-confirmation.html`
- **Datos incluidos:**
  - Nombre del usuario
  - Detalles del plan comprado
  - Características incluidas
  - Próximos pasos
  - Información de contacto

### Otros Correos Disponibles
- **Bienvenida:** Al registrarse
- **Recordatorio de riego:** Programado
- **Alerta de salud:** Cuando hay problemas
- **Restablecimiento de contraseña:** Recuperación de cuenta

## 🔐 Seguridad

### Autenticación
- Todos los endpoints requieren token JWT válido
- Token se envía automáticamente desde AsyncStorage
- Validación en middleware `authenticateToken`

### Validación de Datos
- Validación de `planId` en el backend
- Planes disponibles: `basico`, `premium`, `profesional`
- Manejo de errores robusto

## 🧪 Pruebas Realizadas

### ✅ Backend
- [x] Endpoint responde correctamente
- [x] Autenticación requerida
- [x] Validación de datos
- [x] Envío de correos (configuración pendiente)

### ✅ Frontend
- [x] Servicio API configurado
- [x] Manejo de estados de carga
- [x] Manejo de errores
- [x] Interfaz de usuario actualizada

## 🚀 Cómo Probar

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```

### 2. Iniciar Frontend
```bash
cd frontend
npm start
```

### 3. Probar Compra
1. Iniciar sesión en la app
2. Ir a Perfil → Sistema de riego → Comprar
3. Seleccionar un plan
4. Presionar "Comprar Ahora"
5. Verificar que se muestra el indicador de carga
6. Verificar la respuesta (éxito o error)

## ⚙️ Configuración Pendiente

### Variables de Entorno (.env)
```env
# Agregar al archivo .env del backend
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password_aqui
```

### Para Gmail:
1. Habilitar verificación en 2 pasos
2. Generar contraseña de aplicación
3. Usar esa contraseña en `MAIL_PASSWORD`

## 🔧 Próximas Mejoras

- [ ] Guardar compras en base de datos
- [ ] Sistema de pagos real
- [ ] Tracking de pedidos
- [ ] Notificaciones push
- [ ] Historial de compras
- [ ] Cancelación de pedidos

## 📝 Notas Importantes

- Los correos se envían de forma asíncrona (no bloquean la respuesta)
- El frontend maneja errores de conexión y del servidor
- La autenticación es requerida para todas las operaciones
- Los planes están hardcodeados en el backend (se pueden mover a BD)
