import { Pool } from 'pg';
import DB_config from '../configs/db_configs.js';

const pool = new Pool(DB_config);

export default class UserRepository {
    async findByEmail (email)  {
    const result = await pool.query(
      'SELECT "ID", "Nombre", "Email", "Password", "Direccion", "Foto" FROM "Usuario" WHERE "Email" = $1',
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
    const allowedColumns = new Map([
      ['Nombre', '"Nombre"'],
      ['Email', '"Email"'],
      ['Password', '"Password"'],
      ['Direccion', '"Direccion"'],
      ['Foto', '"Foto"'],
    ]);
    const entries = Object.entries(fields);
    if (entries.length === 0) return null;
    if (entries.some(([key]) => !allowedColumns.has(key))) {
      throw new Error('Campo de usuario no permitido');
    }

    const setQuery = entries.map(([key], i) => `${allowedColumns.get(key)} = $${i + 1}`).join(', ');
    const values = [...entries.map(([, value]) => value), id];

    const query = `UPDATE "Usuario" SET ${setQuery} WHERE "ID" = $${entries.length + 1} RETURNING "ID", "Nombre", "Email", "Direccion", "Foto"`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async deleteById(id) {
    await pool.query('DELETE FROM "Usuario" WHERE "ID" = $1', [id]);
  }
};

