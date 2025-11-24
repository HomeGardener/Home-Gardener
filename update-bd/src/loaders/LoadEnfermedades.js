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
    console.log("Nombre:" + nombre);
    console.log("nombreCientifico:" + nombreCientifico);
    console.log("descripcion:" + descripcion);
    console.log("solucion:" + solucion);
    console.log("especies:" + especies);
    console.log("fuente:" + fuente);

    try {
      const { rows } = await client.query(
        `SELECT * FROM "Enfermedad" 
        WHERE LOWER("Nombre") = LOWER($1) 
            OR LOWER("NombreCientifico") = LOWER($2)`,
        [nombre, nombreCientifico]
      );

      if (rows.length > 0) {
        const enfermedad = rows[0];

        const nuevasFuentes = enfermedad.Fuente?.includes(fuente)
          ? enfermedad.Fuente
          : [...(enfermedad.Fuente || []), fuente];

       const nuevasDescripciones = descripcion && descripcion.length > 0
  ? [ ...(enfermedad.Descripcion || []), ...descripcion ]
  : enfermedad.Descripcion;

const nuevasSoluciones = solucion && solucion.length > 0
  ? [ ...(enfermedad.Solucion || []), ...solucion ]
  : enfermedad.Solucion;

  //Para q no guarde especies repetidas
    let especiesFiltradas = especies.filter(especie => !enfermedad.EspeciesComunes?.includes(especie));

        const nuevasEspecies =  [
          ...(enfermedad.EspeciesComunes || []),
          ...(especiesFiltradas || [])
        ];

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
            descripcion,
            solucion,
            especies,
            nombreCientifico,
            foto
          ]
        );

        console.log(`✅ Insertada nueva enfermedad: ${nombre}`);
      }
    } catch (err) {
      console.error(`❌ Error con ${nombre}:`, err.message);
    } finally {
      client.release();
    }
  }

  //Solo busca en página 1 (agregarle a la URL la página q se quiere agregar)
  async fetchPerenual() {
    console.log("🌱 Obteniendo datos desde Perenual...");
    const apiKey = process.env.PERENUAL_KEY;
    const url = `https://perenual.com/api/pest-disease-list?key=${apiKey}&page=1`;
    let { data } = await axios.get(url);
    
    return data.data.map((item) => ({
      nombre: item.common_name || item.name,
      nombreCientifico: item.scientific_name || "",
      descripcion: item.description.map((descripcion) => `${descripcion.subtitle} ${descripcion.description}`) || "",
      solucion: item.solution.map((soluc) => `${soluc.subtitle} ${soluc.description}`)  || "",
      especies: item.host ? item.host : [],
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
