/*
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import https from "https";
import { uploadImageToSupabase } from "../utils/uploadImageToSupabase.js";

export class HuertaSpeciesLoader {
  constructor() {
    this.supabase = createClient( process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    this.agent = new https.Agent({ rejectUnauthorized: false });    
  }
  async obtenerEspeciesDesdeBD() {
    console.log("Obteniendo especies desde la base de datos");
    const { data, error } = await this.supabase
      .from("TipoEspecifico")
      .select("Nombre");

    if (error) {
      console.error("❌ Error al consultar especies:", error.message);
      return [];
    }

    const nombres = data.map((e) => e.Nombre).filter(Boolean);
    console.log(`✅ Se encontraron ${nombres.length} especies.`);
    return nombres;
  }

  async obtenerDatosPlanta(nombre) {
    try {
      const searchUrl = `https://trefle.io/api/v1/plants/search?token=${process.env.TOKEN_TREFLE}&q=${encodeURIComponent(nombre)}`;
      const res = await axios.get(searchUrl, { httpsAgent: this.agent });
      const planta = res.data.data[0];

      if (!planta) {
        console.warn(`⚠️ No se encontró información para: ${nombre}`);
        return null;
      }

      const detailUrl = `https://trefle.io/api/v1/plants/${planta.slug}?token=${process.env.TOKEN_TREFLE}`;
      const detalle = await axios.get(detailUrl, { httpsAgent: this.agent });
      const d = detalle.data.data;
      const g = d.main_species?.growth || {};

      const fotoUrl = planta.image_url ? await uploadImageToSupabase(planta.image_url, "tipoEspecifico") : null;

      const contenidoGuia = `
        Luz: ${g.light ?? "?"}/10
        Humedad: ${g.atmospheric_humidity ?? "?"}/10
        Crecimiento: ${g.growth_rate ?? "?"}
        Días hasta cosecha: ${g.days_to_harvest ?? "?"}
      `.trim();


      return {
        nombre: planta.common_name || planta.scientific_name || nombre,
        info: `Luz: ${g.light ?? "?"}/10 | Crecimiento: ${g.growth_rate ?? "?"}`,
        foto: fotoUrl,
        tempMin: g.minimum_temperature?.deg_c ?? null,
        tempMax: g.maximum_temperature?.deg_c ?? null,
        contenidoGuia
      };
    } catch (err) {
      console.error(`❌ Error con ${nombre}:`, err.message);
      return null;
    }
  }

  async insertarEnSupabase(datos) {
    const { data, error } = await this.supabase
      .from("TipoEspecifico")
      .insert({
        Nombre: datos.nombre,
        Info: datos.info,
        Foto: datos.foto,
        TempMinIdeal: datos.tempMin,
        TempMaxIdeal: datos.tempMax
      })
      .select("ID")
      .single();

    if (error) {
      console.error("❌ Error al insertar TipoEspecifico:", error.message);
      return;
    }

          
    const { error: guiaError } = await this.supabase
    .from("Guía")
    .insert({
      Título: `Guía de cultivo de ${datos.nombre}`,
      Contenido: datos.contenidoGuia,
      Multimedia: datos.foto,
      IdPlanta: idPlanta
    });

  if (guiaError) console.error("⚠️ Error al insertar Guía:", guiaError.message);
  else console.log(`✅ Insertado ${datos.nombre} con guía`);


    const idPlanta = data.ID;
  }

  async run() {
    console.log("🌿 Cargando especies de huerta...");
    const especies = await this.obtenerEspeciesDesdeBD();
    if(!especies){
      for (const nombre of this.especies) {
      const datos = await this.obtenerDatosPlanta(nombre);
      if (datos) await this.insertarEnSupabase(datos);
    }
    console.log("✅ Carga completa.");
  }
}
}

*/
import fetch from "node-fetch";

const YOUR_TREFLE_TOKEN = "usr-S19mKaCg5AfRHjyg_bx6_CIO6x2M8B7ZsxKJyIyHLgM"

export class HuertaSpeciesLoader {


async ObtenerDatosDeLaAPI () {
  const response = await fetch(`https://trefle.io/api/v1/plants/search?token=${YOUR_TREFLE_TOKEN}`);
  const json = await response.json();
  console.log(json);
}
}