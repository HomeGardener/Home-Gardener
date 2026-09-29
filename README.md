# Home Gardener

Aplicación móvil para administrar plantas y ambientes, consultar lecturas de sensores y llevar una agenda local de cuidados.

## Arquitectura

- `frontend/`: React Native y Expo; navegación con React Navigation.
- `backend/`: API REST con Express; servicios y repositorios PostgreSQL (`pg`).
- Supabase Storage: alojamiento opcional para fotos de perfil.
- `update-bd/`: comandos manuales para sincronizar catálogos de especies y enfermedades.

La app y la API usan JWT. La API consulta PostgreSQL; Supabase no sustituye esa conexión. El historial de chat y la agenda se guardan localmente, separados por usuario.

## Requisitos

- Node.js 18 o superior y npm.
- PostgreSQL con el esquema esperado por la API.
- Expo Go para probar en un teléfono, o un emulador Android/iOS.

El repositorio no contiene una migración canónica versionada para crear el esquema de producción. Verifica las tablas y tipos de tu base existente antes de ejecutar la API; no apliques SQL de prueba directamente sobre una base con datos.

## Backend

```sh
cd backend
npm install
```

Crea `backend/.env` a partir de `backend/env.example`. Configura `DB_URL` o todos los campos `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`, junto con `JWT_SECRET`. Las credenciales de Supabase solo son necesarias para subir imágenes. Si usas una clave service role, mantenla únicamente en el entorno del servidor.

```sh
npm run dev
```

La API inicia en `http://localhost:3000`. `GET /health` comprueba que el proceso responde; no comprueba la conexión a la base.

## Frontend

```sh
cd frontend
npm install
```

Copia `frontend/env.example` a `frontend/.env` y configura `EXPO_PUBLIC_API_URL`. Expo Go debe poder alcanzar esa dirección desde el teléfono: usa la IP local de la computadora en una red Wi-Fi, no `localhost`. Para el emulador Android suele usarse `http://10.0.2.2:3000`; para web o un simulador iOS local, `http://localhost:3000`.

```sh
npm start
```

Los comandos `npm run android`, `npm run ios` y `npm run web` también están disponibles dentro de `frontend/`.

## API disponible

Las rutas privadas requieren `Authorization: Bearer <token>`.

| Área | Rutas |
| --- | --- |
| Sesión | `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/auth/profile` |
| Plantas | `GET /api/plantas/tipos`, `GET /api/plantas/misPlantas`, `POST /api/plantas/agregar`, `PUT /api/plantas/modificarNombre`, `POST /api/plantas/actualizarFoto`, `DELETE /api/plantas/eliminar` |
| Ambientes | `POST /api/ambiente/agregar`, `GET /api/ambiente/listar`, `PUT /api/ambiente/editar/:id` |
| Sensores | `GET /api/sensores/datosSensores`, `GET /api/sensores/ultRiego`, `POST /api/sensores/subirDatosPlanta`, `POST /api/sensores/registrarUltRiego`, `PUT /api/sensores/conectarModulo`, `DELETE /api/sensores/desconectarModulo` |

Las lecturas aceptan humedad entre 0 y 100% y temperatura entre -40 y 85 °C. El envío de sensores requiere actualmente un JWT de usuario; no hay un protocolo de identidad para dispositivos IoT.

## Funciones pendientes de integración

El backend devuelve `501 Not Implemented` para pagos, recuperación de contraseña, envío de correos y recordatorios. No hay un controlador de bomba ni un endpoint que active físicamente el riego. El análisis de fotos y las respuestas del chatbot son demostrativos. No uses estas funciones para procesar compras ni automatizar riego real.

## Carga de catálogos

`update-bd/` es una herramienta CLI independiente, no una interfaz web. Sus comandos necesitan credenciales y servicios externos según la tarea:

```sh
cd update-bd
npm install
npm start -- especies
npm start -- enfermedades
```

Configura sus variables en `update-bd/.env`. La carga de especies requiere Supabase, `TREFLE_TOKEN` y un servidor Ollama con el modelo configurado. La carga de enfermedades requiere PostgreSQL y `PERENUAL_KEY`. Las escrituras de especies usan upsert para conservar las referencias existentes.

## Verificaciones del backend

```sh
cd backend
npm test
npm run check
```
