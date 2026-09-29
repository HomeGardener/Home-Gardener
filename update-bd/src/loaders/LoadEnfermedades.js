import axios from "axios";
import { Pool } from "pg";


export class EnfermedadesLoader {
  constructor() {
    this.pool = new Pool({
      ...(process.env.DB_URL ? {
        connectionString: process.env.DB_URL,
        ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' },
      } : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || process.env.DB_password,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 5432),
      }),
    });
  }

  async upsertEnfermedad({ nombre, nombreCientifico, descripcion, solucion, especies, fuente, foto }) {
    const client = await this.pool.connect();
    try {
      const cleanSpecies = Array.isArray(especies) ? especies.filter(Boolean) : [];
      const cleanDescriptions = Array.isArray(descripcion) ? descripcion.filter(Boolean) : [];
      const cleanSolutions = Array.isArray(solucion) ? solucion.filter(Boolean) : [];
      const { rows } = await client.query(
        `SELECT * FROM "Enfermedad" 
        WHERE LOWER("Nombre") = LOWER($1) 
            OR ($2 <> '' AND LOWER("NombreCientifico") = LOWER($2))`,
        [nombre, nombreCientifico || '']
      );

      if (rows.length > 0) {
        const enfermedad = rows[0];

        const nuevasFuentes = [...new Set([...(enfermedad.Fuente || []), fuente].filter(Boolean))];
        const nuevasDescripciones = [...new Set([...(enfermedad.Descripcion || []), ...cleanDescriptions])];
        const nuevasSoluciones = [...new Set([...(enfermedad.Solucion || []), ...cleanSolutions])];
        const nuevasEspecies = [...new Set([...(enfermedad.EspeciesComunes || []), ...cleanSpecies])];

        await client.query(
          `UPDATE "Enfermedad"
          SET "Fuente"=$1, 
              "Descripcion"=$2, 
              "Solucion"=$3, 
              "EspeciesComunes"=$4, 
              "Foto"=$5
          WHERE "ID"=$6`,
          [
            nuevasFuentes,
            nuevasDescripciones,
            nuevasSoluciones,
            nuevasEspecies,
            foto || enfermedad.Foto,
            enfermedad.ID
          ]
        );

        console.log(`🔄 Actualizada: ${nombre}`);
      } 

      else {
        await client.query(
          `INSERT INTO "Enfermedad"
          ("Fuente","Nombre","Descripcion","Solucion","EspeciesComunes","NombreCientifico","Foto")
          VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            [fuente],
            nombre,
            cleanDescriptions,
            cleanSolutions,
            cleanSpecies,
            nombreCientifico,
            foto
          ]
        );

        console.log(`✅ Insertada nueva enfermedad: ${nombre}`);
      }
    } catch (err) {
      throw new Error(`Error con ${nombre}: ${err.message}`, { cause: err });
    } finally {
      client.release();
    }
  }

  //Solo busca en página 1 (agregarle a la URL la página q se quiere agregar)
  async fetchPerenual() {
    console.log("Obteniendo datos desde Perenual...");
    const apiKey = process.env.PERENUAL_KEY;
    if (!apiKey) throw new Error('PERENUAL_KEY no está configurado');
    const { data } = await axios.get('https://perenual.com/api/pest-disease-list', {
      params: { key: apiKey, page: 1 },
      timeout: 15000,
    });
    if (!Array.isArray(data?.data)) throw new Error('Perenual devolvió una respuesta inválida');

    return data.data.map((item) => ({
      nombre: item.common_name || item.name,
      nombreCientifico: item.scientific_name || "",
      descripcion: (Array.isArray(item.description) ? item.description : []).map((description) => `${description.subtitle || ''} ${description.description || ''}`.trim()).filter(Boolean),
      solucion: (Array.isArray(item.solution) ? item.solution : []).map((solution) => `${solution.subtitle || ''} ${solution.description || ''}`.trim()).filter(Boolean),
      especies: Array.isArray(item.host) ? item.host : [],
      fuente: "perenual",
    }));
  }


  async run() {
    try {
      console.log("Iniciando sincronización de enfermedades...");
      const enfermedades = await this.fetchPerenual();
      let updated = 0;
      let failed = 0;
      for (const enfermedad of enfermedades) {
        try {
          await this.upsertEnfermedad(enfermedad);
          updated += 1;
        } catch (error) {
          failed += 1;
          console.error(error.message);
        }
      }
      const summary = { total: enfermedades.length, updated, failed };
      console.log(`Sincronización completada: ${updated}/${enfermedades.length}; ${failed} con errores.`);
      return summary;
    } finally {
      await this.pool.end();
    }
  }
}
