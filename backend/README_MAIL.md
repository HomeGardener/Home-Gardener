# Estado del correo

El envío de correo no está implementado en esta versión. Las rutas antiguas de compra, recordatorios, alertas, reset de contraseña y correo personalizado responden `501 Not Implemented`; no envían mensajes ni crean registros.

Antes de habilitarlo hace falta elegir un proveedor, añadir la configuración privada del servidor, diseñar tokens de recuperación de un solo uso con expiración y persistir las solicitudes. Un restablecimiento debe devolver una respuesta que no confirme si una dirección está registrada. El correo personalizado también necesita una autorización administrativa real, que hoy no existe en el modelo de usuario.
