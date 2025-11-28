# 🌱 Home Gardener

Aplicación móvil para la gestión inteligente de plantas y jardines domésticos.

## 🚀 Características

- **Gestión de Plantas**: Agregar, editar y monitorear el estado de tus plantas
- **Control de Ambientes**: Crear y gestionar diferentes espacios de cultivo
- **Monitoreo de Sensores**: Seguimiento en tiempo real de temperatura y humedad
- **Sistema de Riego**: Control automático del riego de las plantas
- **ChatBot Inteligente**: Asistente virtual para consejos de jardinería
- **Autenticación Segura**: Sistema de login y registro con JWT

## 🏗️ Arquitectura

- **Frontend**: React Native con Expo
- **Backend**: Node.js con Express
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Subida de Archivos**: Multer

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL
- Expo CLI (para desarrollo móvil)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Eldubo/Home-Gardener.git
cd Home-Gardener
```

### 2. Configurar el Backend

```bash
cd backend
npm install

# Copiar archivo de variables de entorno
cp env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Variables de entorno requeridas:**
- `JWT_SECRET`: Clave secreta para JWT
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Configuración de PostgreSQL
- `PORT`: Puerto del servidor (por defecto 3000)

### 3. Configurar la Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE home_gardener_db;

-- Ejecutar scripts de migración (si existen)
-- psql -d home_gardener_db -f migrations/001_initial_schema.sql
```

### 4. Configurar el Frontend

```bash
cd ../frontend
npm install

# Copiar archivo de variables de entorno
cp env.example .env

# Editar .env con la URL de tu API
nano .env
```

**Variables de entorno requeridas:**
- `EXPO_PUBLIC_API_URL`: URL de tu API backend

## 🚀 Ejecutar la Aplicación

### Backend

```bash
cd backend

# Desarrollo
npm run dev

# Producción
npm start
```

### Frontend

```bash
cd frontend

# Iniciar Expo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## 📱 Uso de la Aplicación

1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Agregar Ambiente**: Define espacios de cultivo con temperatura
3. **Agregar Plantas**: Asigna plantas a ambientes específicos
4. **Monitoreo**: Revisa el estado de tus plantas y sensores
5. **ChatBot**: Obtén consejos de jardinería personalizados

## 🔒 Seguridad

- Autenticación JWT con expiración
- Validación de entrada en todos los endpoints
- CORS configurado para producción
- Subida de archivos con validación de tipo y tamaño
- Manejo seguro de contraseñas con bcrypt

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos exista

### Error de JWT
- Verifica que `JWT_SECRET` esté configurado
- Confirma que el token no haya expirado

### Error de CORS
- En desarrollo, CORS permite todos los orígenes
- En producción, configura `FRONTEND_URL` correctamente

## 📝 Scripts Disponibles

### Backend
- `npm start`: Iniciar servidor de producción
- `npm run dev`: Iniciar servidor de desarrollo con nodemon
- `npm run clean`: Limpiar node_modules
- `npm run reinstall`: Reinstalar dependencias

### Frontend
- `npm start`: Iniciar Expo
- `npm run android`: Ejecutar en Android
- `npm run ios`: Ejecutar en iOS
- `npm run web`: Ejecutar en web

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Eldubo](https://github.com/Eldubo)
- **Froentend developer**: [tomi954](https://github.com/tomi954)
- **Proyect leader**: [Lola-Nieto](https://github.com/Lola-Nieto)

## 📞 Soporte

Si tienes problemas o preguntas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

---

**🌱 ¡Haz que tu jardín sea inteligente con Home Gardener! 🌱**

 
