
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Ollama } from "@llamaindex/ollama";
const ollamaLLM = new Ollama({
  model: process.env.OLLAMA_MODEL || "mistral:7b",
  temperature: 0.25,
  timeout: 60000,
});



export class HuertaSpeciesLoader {
  constructor() { 
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      throw new Error('SUPABASE_URL y SUPABASE_KEY son obligatorios para cargar especies');
    }
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }

  async obtenerEspeciesDesdeBD() {
    console.log("Obteniendo especies desde la base de datos");
    const { data, error } = await this.supabase
      .from("TipoEspecifico")
      .select("Nombre");

    if (error) {
      throw new Error(`Error al consultar especies: ${error.message}`);
    }

    const nombres = data.map((e) => e.Nombre).filter(Boolean);
    console.log(`✅ Se encontraron ${nombres.length} especies.`);
    return nombres;
  }

  async obtenerDatosPlanta(nombre) {
    console.log(`Obteniendo datos para la planta: ${nombre}`);
    try {
      if (!process.env.TREFLE_TOKEN) throw new Error('TREFLE_TOKEN no está configurado');
      const nombreTraducido = await this.traducirNombre(nombre, "inglés");
      const searchUrl = new URL('https://trefle.io/api/v1/plants/search');
      searchUrl.searchParams.set('token', process.env.TREFLE_TOKEN);
      searchUrl.searchParams.set('q', nombreTraducido || nombre);
      const resBusqueda = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
      if (!resBusqueda.ok) throw new Error(`Trefle devolvió HTTP ${resBusqueda.status}`);
      const jsonBusqueda = await resBusqueda.json();
      const plantaEncontrada = jsonBusqueda.data?.[0];
      if (!plantaEncontrada?.id) throw new Error(`No se encontró la planta "${nombreTraducido}" en Trefle`);

      const detailUrl = new URL(`https://trefle.io/api/v1/species/${plantaEncontrada.id}`);
      detailUrl.searchParams.set('token', process.env.TREFLE_TOKEN);
      const resDetalle = await fetch(detailUrl, { signal: AbortSignal.timeout(15000) });
      if (!resDetalle.ok) throw new Error(`Trefle devolvió HTTP ${resDetalle.status}`);
      const jsonDetalle = await resDetalle.json();
      console.log(`Detalle para ${nombre} obtenido`);
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

  // Helpers para convertir las unidades opcionales devueltas por Trefle.
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

  const nombreTraducido = await this.traducirNombre(info.common_name || info.scientific_name);
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

  async insertarEnSupabase(datos, nombreBD) {
    const insertObject = {
      Nombre: nombreBD.trim(),
      Info: datos.contenidoGuia ?? null,
      TempMinIdeal: datos.tempMin ?? null,
      TempMaxIdeal: datos.tempMax ?? null,
      HumedadAtmosferica: datos.humedadAtmos ?? null,
      HumedadDelSuelo: datos.humedadSuelo ?? null,
      NombreCientifico: datos.nombreCientifico ?? null,
    };

    const { data, error } = await this.supabase
      .from("TipoEspecifico")
      .upsert(insertObject, { onConflict: 'Nombre' })
      .select("ID")
      .single();

    if (error) {
      throw new Error(`Error guardando ${nombreBD}: ${error.message}`);
    }
    return data;
  }

  async run() {
    console.log("Cargando especies de huerta...");
    const especies = await this.obtenerEspeciesDesdeBD();
    let updated = 0;
    let failed = 0;
    for (const nombre of especies) {
      try {
        const data = await this.obtenerDatosPlanta(nombre);
        if (!data) {
          failed += 1;
          continue;
        }
        const selected = await this.seleccionarDatosYArmar(data);
        await this.insertarEnSupabase(selected, nombre);
        updated += 1;
      } catch (error) {
        failed += 1;
        console.error(`No se pudo actualizar ${nombre}:`, error.message);
      }
    }
    const summary = { total: especies.length, updated, failed };
    console.log(`Carga completa: ${updated}/${especies.length} especies actualizadas; ${failed} con errores.`);
    return summary;
  }
}
