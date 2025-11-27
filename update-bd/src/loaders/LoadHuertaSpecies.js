
import { createClient } from "@supabase/supabase-js";
import https from "https";
import { Ollama } from "@llamaindex/ollama";
import dotenv from "dotenv";
import { uploadImageToSupabase } from "../utils/uploadImageToSupabase.js";
import fetch from "node-fetch";


  const ollamaLLM = new Ollama({
  model: process.env.OLLAMA_MODEL || "mistral:7b",
  temperature: 0.25, // determinista para diagnóstico
  timeout: 60000,
});

dotenv.config();



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
    console.log(`Obteniendo datos para la planta: ${nombre}`);
    try {
      //const nombreTraducido = await this.traducirNombre(nombre, "inglés");
      //console.log("nombreTraducido: "+nombreTraducido);
           //Para obtener datos de foliage, fuit_or_seed, flower y growth hay que tener el id de la planta --> primero obtener id y luego buscar por especie
       // const infoPlantaGral = await fetch(`https://trefle.io/api/v1/plants/search?token=${process.env.TREFLE_TOKEN}&q=${nombreTraducido}`);
           // 1. Buscar la planta
    //const resBusqueda = await fetch(`https://trefle.io/api/v1/plants/search?token=${process.env.TREFLE_TOKEN}&q=${nombre}`);
    const resBusqueda = await fetch(`https://trefle.io/api/v1/plants/search?token=${process.env.TREFLE_TOKEN}&q=tomato`);
    const jsonBusqueda = await resBusqueda.json();

    //console.log("Resultado de búsqueda:", JSON.stringify(jsonBusqueda, null, 2));

    // 2. Validar si encontró algo
    if (!jsonBusqueda.data || jsonBusqueda.data.length === 0) {
      //throw new Error(`No se encontró la planta "${nombre}" en Trefle`);
      throw new Error(`No se encontró la planta tomato en Trefle`);
    }

    const plantaEncontrada = jsonBusqueda.data[0]; // tomo la primera coincidencia
    //console.log("Planta encontrada:", plantaEncontrada);

    // 3. Consultar especie por id
    //const resDetalle = await fetch(`https://trefle.io/api/v1/species/${plantaEncontrada.id}?token=${process.env.TREFLE_TOKEN}` );
    const resDetalle = await fetch(`https://trefle.io/api/v1/species/${plantaEncontrada.id}?token=${process.env.TREFLE_TOKEN}` );

    const jsonDetalle = await resDetalle.json();

    //console.log("Detalle:", JSON.stringify(jsonDetalle, null, 2));

    return jsonDetalle;


    } catch (err) {
      //console.error(`❌ Error con ${nombre}:`, err.message);
      console.error(`❌ Error con tomato:`, err.message);

      return null;
    }
  }

async traducirNombre(speciesText, lenguajeDestino = "es") {
  //Agregar traduc en abse a lista palabras registradas
  
  // pedir traducción por LLM
  try {
    const prompt = `Traduce a ${lenguajeDestino} el nombre común de esta planta, devolviendo solo la traducción corta (ej: 'kiwi'):\n\n"${speciesText}"`;
    const out = await ollamaLLM.complete({ prompt, temperature: 0.0 });
    const text = (out?.text || "").trim();
    // limpiar
    return text.split("\n")[0].replace(/["']/g, "").trim();
  } catch (err) {
    console.error("[traducirNombre] ", err.message);
    return speciesText;
  }
}

  async seleccionarDatosYArmar(infoPlantaDetallada){
      //Growth: Humedad atmosférica (atmospheric_humidity) y del suelo (soil_humidity) aparte, temp min (minimum_temperature) y max (maximum_temperature) tmb
      //gral: Nombre cientifico tmb (scientific_name)
      const contenidoGuia = `
        Luz: ${infoPlantaDetallada.growth.light ?? "?"}/10
        Meses de crecimiento: ${infoPlantaDetallada.growth.growth_months ?? "?"}
        Meses en los que salen los frutos: ${infoPlantaDetallada.growth.fruit_months ?? "?"}
        Cuánto espacio necesita para desarrollarse: ${infoPlantaDetallada.growth.spread ?? "?"}
        Espacio mínimo para las raíces: ${infoPlantaDetallada.growth.minimum_root_depth ?? "?"}
        Días hasta cosecha: ${infoPlantaDetallada.growth.days_to_harvest ?? "?"}
        Descripción del crecimiento: ${infoPlantaDetallada.growth.description ?? "?"}
        PH máximo aceptable: ${infoPlantaDetallada.growth.ph_maximum ?? "?"}
        PH mínimo aceptable: ${infoPlantaDetallada.growth.ph_minimum ?? "?"}
        Precipitación mínima: ${infoPlantaDetallada.growth.minimum_precipitation ?? "?"}
        Precipitación máxima: ${infoPlantaDetallada.growth.maximum_precipitation ?? "?"}
      `.trim();
      console.log("contenidoGuia: "+contenidoGuia);
      const nombreTraducido = await this.traducirNombre(infoPlantaDetallada.common_name);
      console.log("nombreTraducido: "+nombreTraducido);

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
      console.log("Datos insertados en Supabase para "+nombreBD);
    if (error) {
      console.error("❌ Error al insertar TipoEspecifico:", error.message);
      return;
    }
  }

  async run() {
   console.log("🌿 Cargando especies de huerta...");
    const especies = await this.obtenerEspeciesDesdeBD();
    if(especies){
      console.log("Entra al if");
      especies.forEach(async (nombre) => {
        console.log("Especie ahora: "+nombre);  
    
        const datosCompletosPlanta = await this.obtenerDatosPlanta(nombre);
        const datosSeleccionadosPlanta = await this.seleccionarDatosYArmar(datosCompletosPlanta);
        if (datosSeleccionadosPlanta) await this.insertarEnSupabase(dateosSeleccionadosPlanta, nombre);
      });
    }

  
    console.log("✅ Carga completa.");
  }
}






