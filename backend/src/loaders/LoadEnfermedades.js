import axios from "axios";
import * as cheerio from "cheerio";
import { Pool } from "pg";
import dotenv from "dotenv";
import { uploadImageToSupabase } from "../utils/uploadImageToSupabase.js";

dotenv.config();

export class EnfermedadesLoader {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_password,
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
        const nuevasEspecies = Array.from(new Set([...(enfermedad.especiesComunes || []), ...especies]));
        const nuevaFoto = foto || enfermedad.Foto || null;

        await client.query(
          `UPDATE "Enfermedad"
           SET "Fuente"=$1, "Descripcion"=$2, "Solucion"=$3, "especiesComunes"=$4, "Foto"=$5
           WHERE "ID"=$6`,
          [nuevasFuentes, nuevasDescripciones, nuevasSoluciones, nuevasEspecies, nuevaFoto, enfermedad.ID]
        );

        console.log(`🔄 Actualizada: ${nombre}`);
      } else {
        await client.query(
          `INSERT INTO "Enfermedad" ("Fuente","Nombre","Descripcion","Solucion","especiesComunes","NombreCientifico","Foto")
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

  async fetchPlantwise() {
    console.log("🌿 Obteniendo datos desde Plantwise...");
    const baseUrl =
      "https://plantwiseplusknowledgebank.org/action/doSearch?SeriesKey=plantwise&PrimaryLanguageFacetField2=es";
    const { data } = await axios.get(baseUrl);
    const $ = cheerio.load(data);

    const links = [];
    $(".item-title a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.includes("/openurl"))
        links.push("https://plantwiseplusknowledgebank.org" + href);
    });

    const limit = 10;
    const articles = [];

    for (const link of links.slice(0, limit)) {
      try {
        const res = await axios.get(link);
        const $$ = cheerio.load(res.data);

        const title = $$("h1.article-title").text().trim();
        const [nombre, especie] = title.split(" - ").map((t) => t?.trim() || "");
        const descripcion = $$("h2:contains('Recognize the problem')")
          .nextUntil("h2")
          .text()
          .replace(/\s+/g, " ")
          .trim();
        const solucion = $$("h2:contains('Management')")
          .nextUntil("h2")
          .text()
          .replace(/\s+/g, " ")
          .trim();
        const fotoUrl = $$("img.article-image").attr("src");
        const fullUrl = fotoUrl?.startsWith("http")
          ? fotoUrl
          : fotoUrl
          ? "https://plantwiseplusknowledgebank.org" + fotoUrl
          : null;

        const foto = fullUrl ? await uploadImageToSupabase(fullUrl, "enfermedades") : null;

        articles.push({
          nombre: nombre || "Desconocido",
          nombreCientifico: especie || "",
          descripcion: descripcion || "Sin descripción disponible.",
          solucion: solucion || "Sin solución especificada.",
          especies: especie ? [especie] : [],
          fuente: "plantwiseplusknowledgebank",
          foto,
        });

        console.log(`📄 Extraído: ${nombre}`);
      } catch (err) {
        console.error("❌ Error extrayendo artículo:", link, err.message);
      }
    }

    return articles;
  }

  async run() {
    console.log("🚀 Iniciando sincronización de enfermedades...");
    const enfermedades = await this.fetchPlantwise();
    for (const e of enfermedades) await this.upsertEnfermedad(e);
    console.log("✅ Sincronización completada.");
    process.exit();
  }
}
