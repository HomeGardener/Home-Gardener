
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
      const nombreTraducido = await this.traducirNombre(nombre, "inglés");
      console.log(`${nombre} nombreTraducido: `+nombreTraducido);
      //Para obtener datos de foliage, fuit_or_seed, flower y growth hay que tener el id de la planta --> primero obtener id y luego buscar por especie
      
      // 1. Buscar la planta
        const resBusqueda = await fetch(`https://trefle.io/api/v1/plants/search?token=${process.env.TREFLE_TOKEN}&q=${nombreTraducido}`);
        const jsonBusqueda = await resBusqueda.json();

    //console.log("Resultado de búsqueda:", JSON.stringify(jsonBusqueda, null, 2));

      // 2. Validar si encontró algo
        if (!jsonBusqueda.data || jsonBusqueda.data.length === 0) {
          throw new Error(`No se encontró la planta "${nombreTraducido}" en Trefle`);
        }

        const plantaEncontrada = jsonBusqueda.data[0]; // tomo la primera coincidencia
       // console.log("Planta encontrada:", plantaEncontrada);

      // 3. Consultar especie por id
        const resDetalle = await fetch(`https://trefle.io/api/v1/species/${plantaEncontrada.id}?token=${process.env.TREFLE_TOKEN}` );

        const jsonDetalle = await resDetalle.json();

        //console.log("Detalle:", JSON.stringify(jsonDetalle, null, 2));
        console.log(`✅ Detalle para ${nombre} obtenido`);
      return jsonDetalle;


    } catch (err) {
      console.error(`❌ Error con ${nombre}:`, err.message);

      return null;
    }
  }

async traducirNombre(speciesText, lenguajeDestino = "es") {
  //Agregar traduc en abse a lista palabras registradas
  
  // pedir traducción por LLM
  try {
    const prompt = `
    Traduce el siguiente nombre de planta al idioma "${lenguajeDestino}". 
    IMPORTANTE:
    - Devuelve SOLO la traducción.
    - No expliques nada.
    - No incluyas el idioma, ni paréntesis, ni signos de igual.
    - No incluyas el nombre original.
    - Solo una palabra o frase corta.

    Nombre: "${speciesText}"

    Respuesta:
    `;
    const out = await ollamaLLM.complete({ prompt, temperature: 0.0 });
    const text = (out?.text || "").trim();
    // limpiar
    let limpio = text
      .replace(/=.*/g, "")       // borra todo lo que esté después de "="
      .replace(/\(.+\)/g, "")    // borra cualquier "(algo)"
      .replace(/["']/g, "")      // borra comillas
      .trim();

    return limpio;
    } catch (err) {
        console.error("[traducirNombre] ", err.message);
        return speciesText;
      }
}

async seleccionarDatosYArmar(apiResponse) {
  // apiResponse es algo como: { data: { ...infoPlanta } }
  const info = apiResponse?.data;

  if (!info) {
    throw new Error("Respuesta inválida de Trefle: falta apiResponse.data");
  }

  const growth = info.growth ?? {};

  // Helpers para deg_c, mm, cm
  const celsius = (obj) => obj?.deg_c ?? null;
  const milimetros = (obj) => obj?.mm ?? null;
  const centimetros = (obj) => obj?.cm ?? null;

  const contenidoGuia = `
        Luz: ${growth.light ?? "?"}/10
        Meses de crecimiento: ${growth.growth_months ?? "?"}
        Meses en los que salen los frutos: ${growth.fruit_months ?? "?"}
        Cuánto espacio necesita para desarrollarse: ${centimetros(growth.spread) ?? "?"} cm
        Espacio mínimo para las raíces: ${centimetros(growth.minimum_root_depth) ?? "?"} cm
        Días que tarda en crecer (hasta la cosecha): ${growth.days_to_harvest ?? "?"}
        Descripción del crecimiento: ${growth.description ?? "?"}
        PH máximo aceptable: ${growth.ph_maximum ?? "?"}
        PH mínimo aceptable: ${growth.ph_minimum ?? "?"}
        Precipitación mínima: ${milimetros(growth.minimum_precipitation) ?? "?"} mm
        Precipitación máxima: ${milimetros(growth.maximum_precipitation) ?? "?"} mm
  `.trim();
  console.log("contenidoGuia: "+contenidoGuia);

  const nombreTraducido = await this.traducirNombre(info.common_name);
  console.log(`nombreTraducido en seleccionarDatosYArmar para ${info.common_name} (common_name provisto a spanish): `+nombreTraducido);

  return {
    nombre: nombreTraducido,
    nombreCientifico: info.scientific_name,

    tempMin: celsius(growth.minimum_temperature),
    tempMax: celsius(growth.maximum_temperature),

    humedadAtmos: growth.atmospheric_humidity ?? null,
    humedadSuelo: growth.soil_humidity ?? null,

    contenidoGuia
  };
}

  async eliminarRegistroExistente(nombreBD) {
        const response = await this.supabase
      .from("TipoEspecifico")
      .delete()
      .eq("Nombre", nombreBD)
        if (response.error) {
          console.error(`❌ Error al eliminar registro existente de ${nombreBD}: ${response.error.message}`);
        }
  }

  async insertarEnSupabase(datos, nombreBD) {
    console.log(">>> Datos a insertar:", datos);
    console.log(">>> Insertando registro con Nombre=", JSON.stringify(nombreBD.toLowerCase()));


    await this.eliminarRegistroExistente(nombreBD);

    const insertObject = {
      Nombre: nombreBD.toLowerCase(),
      Info: datos.contenidoGuia ?? null,
      TempMinIdeal: datos.tempMin ?? null,
      TempMaxIdeal: datos.tempMax ?? null,
      HumedadAtmosferica: datos.humedadAtmos ?? null,
      HumedadDelSuelo: datos.humedadSuelo ?? null,
      NombreCientifico: datos.nombreCientifico ?? null,
    };

    const { data, error } = await this.supabase
      .from("TipoEspecifico")
      .insert(insertObject)
      .eq("Nombre", nombreBD)
      .select("ID")
      .maybeSingle();

    if (error) {
      console.error(`❌ Error al insertar ${nombreBD} TipoEspecifico: ${error.message}`);
      return;
    }
          console.log("Datos actualizados en Supabase para "+nombreBD);

  }

  async run() {
   console.log("🌿 Cargando especies de huerta...");
    const especies = await this.obtenerEspeciesDesdeBD();
    if(especies){
      console.log("Entra al if");
      especies.forEach(async (nombre) => {
        console.log("Especie ahora: "+nombre);

        const datosCompletosPlanta = await this.obtenerDatosPlanta(nombre);
        if(datosCompletosPlanta){
          const datosSeleccionadosPlanta = await this.seleccionarDatosYArmar(datosCompletosPlanta);
          console.log("Datos seleccionados para "+nombre+": ", datosSeleccionadosPlanta);
          if (datosSeleccionadosPlanta) await this.insertarEnSupabase(datosSeleccionadosPlanta, nombre);

        }else{
          console.log(`❌ No se obtuvieron datos para la planta: ${nombre}`);
        }
    //  });
    //}

  
    console.log("✅ Carga completa.");
  });
    }
  }
}
