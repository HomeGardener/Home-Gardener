import DB_config from "../configs/db_configs"; // tu conexión a la base de datos
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool(DB_config);


export default class CommonRepository {
   
async getByField(tableName, field, dataFromField) {
        const query = `SELECT * FROM ${tableName} WHERE ${field} = $1`;
        const values = [dataFromField];

        const { rows } = await pool.query(query, values);
        return rows.length > 0 ? rows[0] : null;
    }
   
 async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);

        const columns = keys.join(", ");
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

        const query = `
            INSERT INTO ${table} (${columns})
            VALUES (${placeholders})
            RETURNING id;
        `;

        try {
            const result = await pool.query(query, values);
            return result.rows[0]?.id;  // Devuelve el id generado
        } catch (error) {
            console.error(`Error insertando en ${table}:`, error);
            throw error;
        }
    }

    async getById(tableName, id) {
        const query = `SELECT * FROM ${tableName} WHERE id = $1`;
        const values = [id];

        const { rows } = await pool.query(query, values);
        return rows.length > 0 ? rows[0] : null;
    }



}