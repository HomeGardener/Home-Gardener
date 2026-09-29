# Home Gardener API

Express API para autenticación, administración de plantas y ambientes, y lecturas de sensores. La persistencia usa PostgreSQL mediante `pg`.

## Configuración

```sh
npm install
```

Crea `.env` a partir de `env.example`. Se requiere `JWT_SECRET` y una conexión PostgreSQL mediante `DB_URL` o `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`. Las fotos de perfil necesitan `SUPABASE_URL`, `SUPABASE_KEY` y un bucket público, por defecto `Fotos`. Para subidas con políticas que lo requieran, configura `SUPABASE_SERVICE_ROLE_KEY` solo en el servidor.

```sh
npm run dev
npm start
```

`DB_password` se acepta como compatibilidad con instalaciones anteriores; utiliza `DB_PASSWORD` en configuraciones nuevas. Las conexiones `DB_URL` verifican certificados TLS por defecto. Solo define `DB_SSL_REJECT_UNAUTHORIZED=false` para un entorno privado que use certificados no confiables.

## Rutas

Las rutas privadas necesitan `Authorization: Bearer <token>`.

- `/api/auth`: registro, login y perfil.
- `/api/plantas`: tipos, listado propio y cambios/eliminación de plantas.
- `/api/ambiente`: alta, listado y edición de ambientes.
- `/api/sensores`: lecturas, registro de mediciones/riegos y conexión de módulos.
- `/health`: estado del proceso, sin comprobación de la base de datos.

La conexión de módulos comprueba la propiedad de la planta y hace los bloqueos en una transacción. Las mediciones validan humedad de 0 a 100% y temperatura de -40 a 85 °C. Estos límites deben revisarse si el hardware final requiere otro rango.

## Funciones aún no integradas

Las rutas de compra, reset de contraseña, email, recordatorios y alertas responden `501 Not Implemented`. No hay integración con una bomba de riego. El registro de un evento de riego guarda datos, pero no activa hardware.

## Pruebas y revisión de sintaxis

```sh
npm test
npm run check
```

La prueba usa el runner integrado de Node.js. No hay un linter configurado actualmente.
