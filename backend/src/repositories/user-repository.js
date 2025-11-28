import { Pool } from 'pg';
import DB_config from '../configs/db_configs.js';

const pool = new Pool(DB_config);

export default class UserRepository {
    async findByEmail (email)  {
    const result = await pool.query(
      'SELECT "ID", "Nombre", "Email", "Password", "Direccion" FROM "Usuario" WHERE "Email" = $1',
      [email]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT "ID", "Nombre", "Email", "Direccion", "Foto" FROM "Usuario" WHERE "ID" = $1',
      [id]
    );
    return result.rows[0];
  }

  async emailExists(email) {
    const result = await pool.query(
      'SELECT "ID" FROM "Usuario" WHERE "Email" = $1',
      [email]
    );
    return result.rows.length > 0;
  }

  async create(nombre, email, password, direccion, imagen) {
    const query = `
      INSERT INTO "Usuario" ("Nombre", "Email", "Password", "Direccion", "Foto")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "ID", "Nombre", "Email", "Direccion", "Foto"
    `;
    const values = [nombre, email, password, direccion, imagen || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }  

  async update (id, fields){
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    const setQuery = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = [...Object.values(fields), id];

    const query = `UPDATE "Usuario" SET ${setQuery} WHERE "ID" = $${keys.length + 1} RETURNING "ID", "Nombre", "Email", "Direccion", "Foto"`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

