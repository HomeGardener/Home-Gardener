// Rutas para gestión de plantas y módulos
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import authenticateToken from '../middlewares/auth.js';
import SensoresService from '../services/sensores-service.js';
import rateLimit from 'express-rate-limit';

// Rate limiter: max 100 requests per 15 minutes per IP
const sensoresLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, 
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const router = Router();
const sensoresService = new SensoresService();

// Obtener datos de sensores
router.get('/datosSensores', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const idPlanta = Number(req.query.idPlanta);
    const idUsuario = req.user.ID;
    const result = await sensoresService.obtenerDatosSensores(idPlanta, idUsuario);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error en /datosSensores:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

// Obtener último riego
router.get('/ultRiego', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const idPlanta = Number(req.query.idPlanta);
    const idUsuario = req.user.ID;
    const result = await sensoresService.obtenerUltimoRiego(idPlanta, idUsuario);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error en /ultRiego:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

// Conectar módulo
router.put('/conectarModulo', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const { idPlanta, idModulo } = req.body;
    const result = await sensoresService.conectarModulo(Number(idPlanta), Number(idModulo));
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error en /conectarModulo:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

// Desconectar módulo
router.delete('/desconectarModulo', authenticateToken, sensoresLimiter, async (req, res) => {
  try {
    const { idPlanta } = req.body;
    const idUsuario = req.user.ID;
    const result = await sensoresService.desconectarModulo(Number(idPlanta), idUsuario);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error en /desconectarModulo:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

// Subir datos de planta
router.post('/subirDatosPlanta', authenticateToken, async (req, res) => {
  try {
    const { idPlanta, temperatura, humedad, fecha } = req.body;
    const idUsuario = req.user.ID;
    const result = await sensoresService.subirDatosPlanta({ idPlanta, temperatura, humedad, fecha, idUsuario });
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error en /subirDatosPlanta:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

// Registrar último riego
router.post('/registrarUltRiego', authenticateToken, async (req, res) => {
  try {
    const { idPlanta, fecha, duracionRiego } = req.body;
    const idUsuario = req.user.ID;
    const result = await sensoresService.registrarUltimoRiego({ idPlanta, fecha, duracionRiego, idUsuario });
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error en /registrarUltRiego:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

export default router;




/*
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

// Función helper para validar que el usuario sea dueño de la planta a través del ambiente
async function validarPropietario(idPlanta, idUsuario) {
  const checkQuery = `
    SELECT p."ID"
    FROM "Planta" p
    JOIN "Ambiente" a ON p."IdAmbiente" = a."ID"
    WHERE p."ID" = $1 AND a."IdUsuario" = $2
  `;
  const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
  return checkResult.rows.length > 0;
}

// ----------------------
// Obtener datos de sensores
// ----------------------
router.get('/datosSensores', authenticateToken, async (req, res) => {
  const idPlanta = Number(req.query.idPlanta);
  if (!Number.isInteger(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }

  try {
    const idUsuario = req.user.ID;
    if (!(await validarPropietario(idPlanta, idUsuario))) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }

    const query = `
      SELECT "Temperatura", "HumedadDsp", "Fecha"
      FROM "Registro"
      WHERE "IdPlanta" = $1
      ORDER BY "Fecha" DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [idPlanta]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay mediciones para esta planta' });
    }

    res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /datosSensores:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ----------------------
// Obtener último riego
// ----------------------
router.get('/ultRiego', authenticateToken, async (req, res) => {
  const idPlanta = Number(req.query.idPlanta);
  if (!Number.isInteger(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }

  try {
    const idUsuario = req.user.ID;
    if (!(await validarPropietario(idPlanta, idUsuario))) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }

    const query = `
      SELECT MAX("Fecha") AS "UltimaFechaRiego" 
      FROM "Registro"
      WHERE "DuracionRiego" IS NOT NULL AND "IdPlanta" = $1
    `;
    const result = await pool.query(query, [idPlanta]);

    if (result.rows.length === 0 || !result.rows[0].UltimaFechaRiego) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay registros de riego para esta planta' });
    }

    res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /ultRiego:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ----------------------
// Conectar módulo
// ----------------------
router.put('/conectarModulo', authenticateToken, async (req, res) => {
  const { idPlanta, idModulo } = req.body;
  if (!Number.isInteger(idPlanta) || !Number.isInteger(idModulo)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Los parámetros son obligatorios y deben ser numéricos' });
  }

  try {
    const checkModulo = await pool.query('SELECT "ID" FROM "Modulo" WHERE "ID" = $1', [idModulo]);
    if (checkModulo.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No se encuentra el módulo' });
    }

    const query = 'UPDATE "Modulo" SET "IdPlanta" = $2 WHERE "ID" = $1 RETURNING "ID"';
    const result = await pool.query(query, [idModulo, idPlanta]);

    res.status(StatusCodes.OK).json({ message: 'Módulo conectado exitosamente', id: result.rows[0].ID });
  } catch (error) {
    console.error('Error en /conectarModulo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ----------------------
// Desconectar módulo
// ----------------------
router.delete('/desconectarModulo', authenticateToken, async (req, res) => {
  const { idPlanta } = req.body;
  if (!Number.isInteger(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }

  try {
    const idUsuario = req.user.ID;
    if (!(await validarPropietario(idPlanta, idUsuario))) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    const checkModuloResult = await pool.query('SELECT "ID" FROM "Modulo" WHERE "IdPlanta" = $1', [idPlanta]);
    if (checkModuloResult.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay un módulo conectado a esta planta' });
    }

    const updateQuery = 'UPDATE "Modulo" SET "IdPlanta" = NULL WHERE "IdPlanta" = $1 RETURNING "ID"';
    const result = await pool.query(updateQuery, [idPlanta]);

    res.status(StatusCodes.OK).json({ message: 'Módulo desconectado exitosamente', ids: result.rows.map(r => r.ID) });
  } catch (error) {
    console.error('Error en /desconectarModulo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ----------------------
// Subir datos de planta
// ----------------------
router.post('/subirDatosPlanta', authenticateToken, async (req, res) => {
  const { idPlanta, temperatura, humedad, fecha } = req.body;
  if (!Number.isInteger(idPlanta) || typeof temperatura !== 'number' || typeof humedad !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Parámetros inválidos' });
  }

  try {
    const idUsuario = req.user.ID;
    if (!(await validarPropietario(idPlanta, idUsuario))) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    const humedadInt = Math.round(humedad);

    const lastQuery = `
      SELECT "HumedadDsp"
      FROM "Registro"
      WHERE "IdPlanta" = $1 AND "HumedadDsp" IS NOT NULL
      ORDER BY "Fecha" DESC
      LIMIT 1
    `;
    const lastResult = await pool.query(lastQuery, [idPlanta]);
    const humedadAntes = lastResult.rows.length > 0 ? lastResult.rows[0].HumedadDsp : 0;

    const insertQuery = `
      INSERT INTO "Registro" ("IdPlanta", "Temperatura", "HumedadDsp", "Fecha", "HumedadAntes")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const fechaInsertar = fecha ? new Date(fecha) : new Date();
    const result = await pool.query(insertQuery, [idPlanta, temperatura, humedadInt, fechaInsertar, humedadAntes]);

    res.status(StatusCodes.CREATED).json({ message: 'Datos subidos correctamente', registro: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Ya existe un registro de datos para esta planta en esa fecha.' });
    }
    console.error('Error en /subirDatosPlanta:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ----------------------
// Registrar último riego
// ----------------------
router.post('/registrarUltRiego', authenticateToken, async (req, res) => {
  const { idPlanta, fecha, duracionRiego } = req.body;
  if (!Number.isInteger(idPlanta) || typeof duracionRiego !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Parámetros inválidos' });
  }

  try {
    const idUsuario = req.user.ID;
    if (!(await validarPropietario(idPlanta, idUsuario))) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    const insertQuery = `
      INSERT INTO "Registro" ("IdPlanta", "Fecha", "DuracionRiego", "HumedadAntes")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const fechaInsertar = fecha ? new Date(fecha) : new Date();
    const result = await pool.query(insertQuery, [idPlanta, fechaInsertar, duracionRiego, 0]);

    res.status(StatusCodes.CREATED).json({ message: 'Riego registrado correctamente', registro: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Ya existe un registro de riego para esta planta en esa fecha.' });
    }
    console.error('Error en /registrarUltRiego:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

export default router;

*/