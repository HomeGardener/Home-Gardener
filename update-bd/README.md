# Actualizador de catálogos

Herramienta de línea de comandos para sincronizar catálogos en Supabase o PostgreSQL. No es una aplicación Vite.

## Instalación

```sh
npm install
```

Crea `update-bd/.env` con las variables necesarias. Para especies: `SUPABASE_URL`, `SUPABASE_KEY`, `TREFLE_TOKEN`, configuración de Ollama y `OLLAMA_MODEL` opcional. Para enfermedades: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` (o `DB_password` legado), `DB_NAME` y `PERENUAL_KEY`. También admite `DB_URL`.

Mantén las claves API y la clave privada de Supabase fuera del repositorio. Ollama debe estar ejecutándose y tener descargado el modelo elegido antes de sincronizar especies.

## Comandos

```sh
npm start -- especies
npm start -- enfermedades
```

También hay scripts directos: `npm run especies` y `npm run enfermedades`.

La carga de especies consulta cada nombre y hace upsert por `TipoEspecifico.Nombre`; no elimina previamente el registro que puede estar referenciado por plantas. Los servicios externos pueden limitar peticiones y devolver catálogos incompletos; revisa el resumen de elementos actualizados y fallidos.
