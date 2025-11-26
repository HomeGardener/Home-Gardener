
import { createClient } from "@supabase/supabase-js";
import https from "https";
import { uploadImageToSupabase } from "../utils/uploadImageToSupabase.js";
import fetch from "node-fetch";

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
        //Para obtener datos de foliage, fuit_or_seed, flower y growth hay que tener el id de la planta
        const infoPlantaGral = await fetch(`https://trefle.io/api/v1/plants/search?token=${process.env.TREFLE_TOKEN}&q=${nombre}`);
        const planta = infoPlantaGral.data.data[0];

        const infoPlantaDetallada = await fetch(`https://trefle.io/api/v1/species/${planta.id}?token=${process.env.TREFLE_TOKEN}`);
        const json = await infoPlantaDetallada.json();
        console.log(json);
        return json;

    } catch (err) {
      console.error(`❌ Error con ${nombre}:`, err.message);
      return null;
    }
  }

  async seleccionarDatosYArmar(infoPlantaDetallada){
      //Growth: Humedad atmosférica (atmospheric_humidity) y del suelo (soil_humidity) aparte, temp min (minimum_temperature) y max (maximum_temperature) tmb
      //gral: Nombre cientifico tmb (scientific_name)
      const contenidoGuia = `
        Luz: ${infoPlantaDetallada.g.light ?? "?"}/10
        Meses de crecimiento: ${infoPlantaDetallada.g.growth_months ?? "?"}
        Meses en los que salen los frutos: ${infoPlantaDetallada.g.fruit_months ?? "?"}
        Cuánto espacio necesita para desarrollarse: ${infoPlantaDetallada.g.spread ?? "?"}
        Espacio mínimo para las raíces: ${infoPlantaDetallada.g.minimum_root_depth ?? "?"}
        Días hasta cosecha: ${infoPlantaDetallada.g.days_to_harvest ?? "?"}
        Descripción del crecimiento: ${infoPlantaDetallada.g.description ?? "?"}
        PH máximo aceptable: ${infoPlantaDetallada.g.ph_maximum ?? "?"}
        PH mínimo aceptable: ${infoPlantaDetallada.g.ph_minimum ?? "?"}
        Precipitación mínima: ${infoPlantaDetallada.g.minimum_precipitation ?? "?"}
        Precipitación máxima: ${infoPlantaDetallada.g.maximum_precipitation ?? "?"}
      `.trim();

      const nombreTraducido = traducirNombre(infoPlantaDetallada.common_name);
      return {
        nombre: nombreTraducido,
        nombreCientifico: infoPlantaDetallada.scientific_name, 
        tempMin: infoPlantaDetallada.growth.minimum_temperature?.deg_c ?? null,
        tempMax: infoPlantaDetallada.growth.maximum_temperature?.deg_c ?? null,
        humedadAtmos: infoPlantaDetallada.growth.atmospheric_humidity?.deg_c ?? null,
        humedadSuelo: infoPlantaDetallada.growth.soil_humidity?.deg_c ?? null, 
        contenidoGuia
      };
  }

  async insertarEnSupabase(datos, nombreBD) {
    const { data, error } = await this.supabase
      .from("TipoEspecifico")
      .insert({
        Nombre: nombreBD || datos.nombre,
        Info: datos.contenidoGuia,
        TempMinIdeal: datos.tempMin,
        TempMaxIdeal: datos.tempMax, 
        HumedadAtmosferica: humedadAtmos, 
        HumedadDelSuelo: humedadSuelo, 
        NombreCientifico: nombreCientifico,
      })
      .select("ID")
      .single();

    if (error) {
      console.error("❌ Error al insertar TipoEspecifico:", error.message);
      return;
    }
  }

  async run() {
    console.log("🌿 Cargando especies de huerta...");
    const especies = await this.obtenerEspeciesDesdeBD();
    if(!especies){
      for (const nombre of this.especies) {
      const datosCompletosPlanta = await this.obtenerDatosPlanta(nombre);
      const datosSeleccionadosPlanta = await this.seleccionarDatosYArmar(datosCompletosPlanta);
      if (datosSeleccionadosPlanta) await this.insertarEnSupabase(datosSeleccionadosPlanta, nombre);
    }
    console.log("✅ Carga completa.");
  }
}
}






