# 📧 Sistema de Correos - Home Gardener

Este documento describe la implementación del sistema de correos electrónicos usando el paquete **Meily** en la aplicación Home Gardener.

## 🚀 Instalación y Configuración

### Dependencias Instaladas
```bash
npm install meily arrowy-env
```

### Variables de Entorno Requeridas
Agregar al archivo `.env`:

```env
# Configuración de correo electrónico (Meily)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password_aqui
```

### Configuración para Gmail
1. Habilitar la verificación en 2 pasos en tu cuenta de Google
2. Generar una "Contraseña de aplicación" específica
3. Usar esa contraseña en `MAIL_PASSWORD`

## 📁 Estructura de Archivos

```
backend/
├── src/
│   └── services/
│       └── mail-service.js          # Servicio principal de correos
├── templates/                       # Plantillas HTML
│   ├── welcome.html                 # Correo de bienvenida
│   ├── purchase-confirmation.html   # Confirmación de compra
│   ├── watering-reminder.html       # Recordatorio de riego
│   ├── health-alert.html           # Alerta de salud
│   └── password-reset.html         # Restablecimiento de contraseña
└── src/controllers/
    └── riego-controller.js         # Endpoints para funcionalidades de correo
```

## 🛠️ Servicio de Correos (mail-service.js)

### Métodos Disponibles

#### 1. `sendWelcomeEmail(user)`
Envía correo de bienvenida al registrarse.
```javascript
await mailService.sendWelcomeEmail(user);
```

#### 2. `sendPurchaseConfirmation(user, plan)`
Confirma la compra de un sistema de riego.
```javascript
const plan = {
  name: 'Plan Premium',
  price: '$149.99',
  features: ['Sensor avanzado', 'WiFi', 'Hasta 12 plantas']
};
await mailService.sendPurchaseConfirmation(user, plan);
```

#### 3. `sendWateringReminder(user, plant)`
Recordatorio de riego para plantas.
```javascript
const plant = {
  nombre: 'Rosa',
  ultimo_riego: '2025-01-15',
  proximo_riego: '2025-01-17'
};
await mailService.sendWateringReminder(user, plant);
```

#### 4. `sendHealthAlert(user, plant, alertType)`
Alerta de problemas de salud en plantas.
```javascript
await mailService.sendHealthAlert(user, plant, 'Sequía extrema');
```

#### 5. `sendPasswordReset(user, resetToken)`
Restablecimiento de contraseña.
```javascript
await mailService.sendPasswordReset(user, 'token_seguro');
```

#### 6. `sendCustomEmail(to, subject, content, attachments)`
Correo personalizado.
```javascript
await mailService.sendCustomEmail(
  'usuario@email.com',
  'Asunto personalizado',
  '<h1>Contenido HTML</h1>',
  [{ filename: 'documento.pdf', path: './ruta/documento.pdf' }]
);
```

## 🌐 Endpoints de la API

### POST `/api/riego/confirmar-compra`
Confirma la compra de un sistema de riego.

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

**Respuesta:**
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

### POST `/api/riego/recordatorio-riego`
Envía recordatorio de riego.

**Body:**
```json
{
  "plantId": 1,
  "plantName": "Rosa",
  "lastWatered": "2025-01-15",
  "nextWatering": "2025-01-17"
}
```

### POST `/api/riego/alerta-salud`
Envía alerta de salud de planta.

**Body:**
```json
{
  "plantId": 1,
  "plantName": "Rosa",
  "alertType": "Sequía extrema"
}
```

### POST `/api/riego/solicitar-reset-password`
Solicita restablecimiento de contraseña.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

### POST `/api/riego/correo-personalizado`
Envía correo personalizado (requiere autenticación).

**Body:**
```json
{
  "to": "destinatario@email.com",
  "subject": "Asunto del correo",
  "content": "<h1>Contenido HTML</h1>",
  "attachments": []
}
```

## 🎨 Plantillas HTML

Las plantillas utilizan **Handlebars** para renderizar contenido dinámico:

### Variables Disponibles por Plantilla

#### welcome.html
- `{{nombre}}` - Nombre del usuario
- `{{email}}` - Email del usuario

#### purchase-confirmation.html
- `{{nombre}}` - Nombre del usuario
- `{{email}}` - Email del usuario
- `{{fecha}}` - Fecha de compra
- `{{plan.name}}` - Nombre del plan
- `{{plan.price}}` - Precio del plan
- `{{plan.features}}` - Array de características

#### watering-reminder.html
- `{{nombre}}` - Nombre del usuario
- `{{plantName}}` - Nombre de la planta
- `{{lastWatered}}` - Último riego
- `{{nextWatering}}` - Próximo riego

#### health-alert.html
- `{{nombre}}` - Nombre del usuario
- `{{plantName}}` - Nombre de la planta
- `{{alertType}}` - Tipo de alerta
- `{{timestamp}}` - Fecha y hora de detección

#### password-reset.html
- `{{nombre}}` - Nombre del usuario
- `{{resetUrl}}` - URL para restablecer contraseña
- `{{expirationTime}}` - Tiempo de expiración

## 🔧 Integración Automática

### Registro de Usuario
El correo de bienvenida se envía automáticamente al registrarse:
```javascript
// En auth-controller.js
const { user, token } = await authService.register(userData);

// Enviar correo de bienvenida (no bloquea la respuesta)
mailService.sendWelcomeEmail(user).catch(error => {
  console.error('Error enviando correo de bienvenida:', error);
});
```

## 🚨 Manejo de Errores

El servicio incluye manejo de errores robusto:
- Los errores se registran en consola
- Los envíos fallidos no afectan la funcionalidad principal
- Respuestas informativas sobre el estado del envío

## 📝 Logs y Monitoreo

Los correos incluyen logging automático:
- ✅ Envíos exitosos: `console.log('✅ Correo enviado:', info.response)`
- ❌ Errores: `console.error('❌ Error enviando correo:', error)`

## 🔒 Seguridad

- Validación de tokens JWT para endpoints protegidos
- Validación de datos de entrada
- Manejo seguro de errores (sin exposición de información sensible)
- Tokens de restablecimiento con expiración

## 🎯 Casos de Uso

1. **Registro de usuario** → Correo de bienvenida automático
2. **Compra de sistema de riego** → Confirmación de compra
3. **Recordatorios programados** → Notificaciones de riego
4. **Alertas de salud** → Notificaciones de problemas
5. **Recuperación de cuenta** → Restablecimiento de contraseña
6. **Comunicación personalizada** → Correos administrativos

## 🚀 Próximas Mejoras

- [ ] Programación de correos automáticos con cron jobs
- [ ] Integración con base de datos para guardar historial de correos
- [ ] Plantillas personalizables por usuario
- [ ] Análisis de apertura y clics
- [ ] Soporte para múltiples idiomas
- [ ] Queue de correos para alta concurrencia
