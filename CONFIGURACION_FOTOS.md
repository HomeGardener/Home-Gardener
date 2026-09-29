# Fotos de perfil

El frontend puede enviar una imagen en el registro o la edición del perfil. El backend acepta JPG, PNG y WebP de hasta 5 MB y guarda la URL pública devuelta por Supabase en `Usuario.Foto`.

## Configuración en Supabase

1. Crea el bucket `Fotos`, o define otro con `SUPABASE_BUCKET` en `backend/.env`.
2. Si el frontend va a mostrar las URLs devueltas por `getPublicUrl`, configura el bucket como público. No hagas públicos datos privados.
3. El backend busca primero `SUPABASE_SERVICE_ROLE_KEY` y, como alternativa, `SUPABASE_KEY`. La service role key permite saltar RLS: guárdala solo en el servidor y no la incluyas en Expo ni en `EXPO_PUBLIC_*`.

Si utilizas la anon key como `SUPABASE_KEY`, el bucket y las políticas deben permitir la subida realizada por el backend. El JWT propio de Home Gardener no es un JWT de Supabase Auth; una política `auth.role() = 'authenticated'` no autentica por sí misma a los usuarios de esta aplicación.

## Variables privadas del backend

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
SUPABASE_BUCKET=Fotos
```

No compartas el archivo `.env` ni pegues sus valores en reportes. Si una clave privada se expuso públicamente, rótala en Supabase.

## Almacenamiento

Las imágenes se guardan con una ruta `perfil/<user-id>/<uuid>.<extensión>`. El UUID evita sobrescrituras entre cargas. Si falla la carga durante un registro con foto, el alta se cancela; sin Supabase configurado, los registros sin imagen siguen disponibles.

Para validar la configuración, inicia el backend, crea una cuenta de prueba con foto y comprueba que `Usuario.Foto` contiene una URL pública válida. La API no elimina automáticamente la imagen anterior al reemplazarla, así que las sustituciones repetidas pueden dejar objetos antiguos en Storage.
