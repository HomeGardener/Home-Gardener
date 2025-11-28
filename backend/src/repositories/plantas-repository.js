
import { Pool } from 'pg';
import DB_config from '../configs/db_configs.js';

const pool = new Pool(DB_config);

export default class plantaRepository {
    async verificarTipo(tipo) {
    const query = `SELECT "Nombre" FROM "TipoEspecifico" WHERE "Nombre" = $1`;
    const result = await pool.query(query, [tipo]);
    return result.rows;
  }

  async verificarAmbiente(idAmbiente, idUsuario) {
    const query = `SELECT "Nombre" FROM "Ambiente" WHERE "ID" = $1 AND "IdUsuario" = $2`;
    const result = await pool.query(query, [idAmbiente, idUsuario]);
    return result.rows;
  }

  async insertarPlanta(nombre, tipo, idAmbiente)  {
    const query = `INSERT INTO "Planta" ("Nombre", "Tipo", "IdAmbiente") 
                   VALUES ($1, $2, $3) RETURNING "ID"`;
    const result = await pool.query(query, [nombre, tipo, idAmbiente]);
    return result.rows[0];
  }

  async validarPropietario(idPlanta, idUsuario) {
    const query = `
      SELECT p."ID"
      FROM "Planta" p
      JOIN "Ambiente" a ON p."IdAmbiente" = a."ID"
      WHERE p."ID" = $1 AND a."IdUsuario" = $2
    `;
    const result = await pool.query(query, [idPlanta, idUsuario]);
    return result.rows.length > 0;
  }
  
  async verificarExistencia(idPlanta, idUsuario) {
    const query = `
      SELECT "P"."ID"
      FROM "Planta" AS "P"
      INNER JOIN "Ambiente" AS "A" ON "P"."IdAmbiente" = "A"."ID"
      WHERE "P"."ID" = $1 AND "A"."IdUsuario" = $2
    `;
    const result = await pool.query(query, [idPlanta, idUsuario]);
    return result.rows;
  }

  async verificarModulo(idPlanta) {
    const query = `SELECT "ID" FROM "Modulo" WHERE "IdPlanta" = $1`;
    const result = await pool.query(query, [idPlanta]);
    return result.rows;
  }

  async eliminarPlanta (idPlanta) {
    await pool.query(`DELETE FROM "Planta" WHERE "ID" = $1`, [idPlanta]);
  }

  async actualizarFoto (foto, idPlanta) {
    const query = `UPDATE "Planta" SET "Foto" = $1 WHERE "ID" = $2 
                   RETURNING "ID", "Foto"`;
    const result = await pool.query(query, [foto, idPlanta]);
    return result.rows[0];
  }

  async listarPlantas(idUsuario)  {
    const query = `
      SELECT "P"."ID", "P"."Nombre", "P"."Tipo", "P"."Foto", "A"."Nombre" AS "Ambiente"
      FROM "Planta" AS "P"
      INNER JOIN "Ambiente" AS "A" ON "P"."IdAmbiente" = "A"."ID"
      WHERE "A"."IdUsuario" = $1
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows;
  }

  async modificarNombre (nuevoNombre, idPlanta) {
    await pool.query(`UPDATE "Planta" SET "Nombre" = $1 WHERE "ID" = $2`, [nuevoNombre, idPlanta]);
  }
};

