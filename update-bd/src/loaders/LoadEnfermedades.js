import axios from "axios";
import * as cheerio from "cheerio";
import { Pool } from "pg";
import { uploadImageToSupabase } from "../utils/uploadImageToSupabase.js";


export class EnfermedadesLoader {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: 5432,
    });
  }

  async upsertEnfermedad({ nombre, nombreCientifico, descripcion, solucion, especies, fuente, foto }) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM "Enfermedad" WHERE LOWER("Nombre") = LOWER($1) OR LOWER("NombreCientifico") = LOWER($2)`,
        [nombre, nombreCientifico]
      );

      if (rows.length > 0) {
        const enfermedad = rows[0];
        const nuevasFuentes = Array.from(new Set([...(enfermedad.Fuente || []), fuente]));
        const nuevasDescripciones = Array.from(new Set([...(enfermedad.Descripcion || []), descripcion]));
        const nuevasSoluciones = Array.from(new Set([...(enfermedad.Solucion || []), solucion]));
        const nuevasEspecies = Array.from(new Set([...(enfermedad.EspeciesComunes || []), ...especies]));
        const nuevaFoto = foto || enfermedad.Foto || null;

        await client.query(
          `UPDATE "Enfermedad"
           SET "Fuente"=$1, "Descripcion"=$2, "Solucion"=$3, "EspeciesComunes"=$4, "Foto"=$5
           WHERE "ID"=$6`,
          [nuevasFuentes, nuevasDescripciones, nuevasSoluciones, nuevasEspecies, nuevaFoto, enfermedad.ID]
        );

        console.log(`🔄 Actualizada: ${nombre}`);
      } else {
        await client.query(
          `INSERT INTO "Enfermedad" ("Fuente","Nombre","Descripcion","Solucion","EspeciesComunes","NombreCientifico","Foto")
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [[fuente], nombre, [descripcion], [solucion], especies, nombreCientifico, foto]
        );
        console.log(`✅ Insertada nueva enfermedad: ${nombre}`);
      }
    } catch (err) {
      console.error(`❌ Error con ${nombre}:`, err.message);
    } finally {
      client.release();
    }
  }

    
  async fetchPerenual() {
    console.log("🌱 Obteniendo datos desde Perenual...");
    const apiKey = process.env.PERENUAL_KEY;
    const url = `https://perenual.com/api/pest-disease-list?key=${apiKey}`;
    const { data } = await axios.get(url);

    return data.data.map((item) => ({
      nombre: item.common_name || item.name,
      nombreCientifico: item.scientific_name || "",
      descripcion: item.description || "",
      solucion: item.solution || "",
      especies: item.hosts ? item.hosts.map((h) => h.name) : [],
      fuente: "perenual",
      // foto: null,
    }));
  }


  async run() {
    console.log("🚀 Iniciando sincronización de enfermedades...");
    const enfermedades = await this.fetchPerenual();
    for (const e of enfermedades) await this.upsertEnfermedad(e);
    console.log("✅ Sincronización completada.");
    process.exit();
  }
}
