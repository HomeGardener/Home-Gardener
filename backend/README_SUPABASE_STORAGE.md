# Configuración de Supabase Storage para Home Gardener

## 📋 Requisitos Previos

1. Tener una cuenta de Supabase
2. Crear un proyecto en Supabase
3. Obtener las claves de API

## 🔧 Configuración del Bucket

### 1. Crear el Bucket en Supabase

1. Ve a tu dashboard de Supabase
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket**
4. Configura el bucket con los siguientes parámetros:
   - **Name**: `fotos-usuarios`
   - **Public bucket**: ✅ Activado (para acceso público a las imágenes)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

### 2. Configurar Políticas de Seguridad (RLS)

Ve a **Authentication > Policies** y crea las siguientes políticas:

```sql
-- Política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de imágenes" ON storage.objects
FOR SELECT USING (bucket_id = 'fotos-usuarios');

-- Política para permitir subida de archivos a usuarios autenticados
CREATE POLICY "Permitir subida de imágenes a usuarios autenticados" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'fotos-usuarios' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir actualización de archivos propios
CREATE POLICY "Permitir actualización de archivos propios" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'fotos-usuarios' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```env
# Configuración de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## 📁 Estructura de Archivos

El sistema organiza las imágenes de la siguiente manera:

```
fotos-usuarios/
├── perfil/
│   ├── 1_1703123456789.jpg
│   ├── 2_1703123456790.png
│   └── ...
└── plantas/
    ├── 1_1703123456791.jpg
    ├── 2_1703123456792.png
    └── ...
```

## 🔄 Flujo de Subida de Imágenes

1. **Cliente** envía imagen con campo `imagen` usando `multipart/form-data`
2. **Multer** procesa y valida el archivo (máximo 5MB, solo imágenes)
3. **StorageService** sube el archivo a Supabase Storage
4. **Base de Datos** guarda la URL pública de la imagen
5. **Cliente** recibe la URL para mostrar la imagen

## 🛠️ Endpoints Disponibles

### Registro con Imagen
```http
POST /api/auth/register
Content-Type: multipart/form-data

{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "direccion": "Calle 123",
  "imagen": [archivo de imagen]
}
```

### Actualizar Perfil con Imagen
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "nombre": "Juan Pérez Actualizado",
  "imagen": [nueva imagen]
}
```

## 🔍 Troubleshooting

### Error: "Bucket not found"
- Verifica que el bucket `fotos-usuarios` existe en Supabase
- Confirma que el nombre del bucket coincide exactamente

### Error: "Insufficient permissions"
- Verifica que las políticas RLS están configuradas correctamente
- Confirma que estás usando el `SERVICE_ROLE_KEY` en el backend

### Error: "File too large"
- Verifica que el archivo no exceda 5MB
- Confirma que el límite del bucket en Supabase permite archivos de ese tamaño

### Error: "Invalid file type"
- Solo se permiten archivos de imagen (jpg, png, gif, etc.)
- Verifica que el archivo tenga una extensión válida

## 📝 Notas Importantes

- Las imágenes se almacenan con nombres únicos basados en timestamp
- El formato es: `{folder}/{userId}_{timestamp}.{extension}`
- Las URLs públicas se generan automáticamente por Supabase
- No se sobrescriben archivos existentes (upsert: false)
