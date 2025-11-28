import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import dotenv from "dotenv";
import pg from "pg";
import natural from "natural";

dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: 5432,
});


const ollamaLLM = new Ollama({
  model: process.env.OLLAMA_MODEL || "mistral:7b",
  temperature: 0.25, // determinista para diagnóstico
  timeout: 60000,
});


const SPECIES_LEX = {
  frutilla: "strawberry",
  fresa: "strawberry",
  tomate: "tomato",
  lechuga: "lettuce",
  pimiento: "pepper",
  morron: "pepper",
  berenjena: "eggplant",
  zapallo: "squash",
  calabaza: "squash",
  pepino: "cucumber",
  albahaca: "basil",
  menta: "mint",
  oregano: "oregano",
  palta: "avocado",
  uva: "grape",
  manzana: "apple",
  pera: "pear",
  naranja: "orange",
  limon: "lemon",
  zanahoria: "carrot",
  cebolla: "onion",
  ajo: "garlic",
  espinaca: "spinach",
  brocoli: "broccoli",
  coliflor: "cauliflower",
  cereza: "cherry",
  durazno: "peach",
  melocoton: "peach", 
  ciruela: "plum",
  repollo: "cabbage",
  repollitos: "brussels sprouts",  
  limonero: "lemon",
  naranjo: "orange",
  manzano: "apple",
  peral: "pear",
  duraznero: "peach",
  parra: "grape", 
  
};


function normalizeText(s = "") {
  return s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// simple bag-of-words cosine similarity
function cosineSimilarity(a, b) {
  if (!a) a = "";
  if (!b) b = "";
  const ta = normalizeText(a).split(" ").filter(Boolean);
  const tb = normalizeText(b).split(" ").filter(Boolean);
  const vocab = {};
  ta.forEach(t => (vocab[t] = (vocab[t] || 0)));
  tb.forEach(t => (vocab[t] = (vocab[t] || 0)));
  const va = [], vb = [];
  Object.keys(vocab).forEach((term) => {
    va.push(ta.filter(x => x === term).length);
    vb.push(tb.filter(x => x === term).length);
  });
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < va.length; i++) {
    dot += va[i] * vb[i];
    na += va[i] * va[i];
    nb += vb[i] * vb[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}


// Extrae especie y síntomas desde *un solo mensaje* en español.
// Devuelve { speciesText: string|null, symptomsText: string|null }
async function extractSpeciesAndSymptomsFromMessage(message) {
  // Pedimos al LLM que devuelva JSON estricto para parsear fácilmente.
  const prompt = `
Eres un extractor. Recibís un mensaje de un usuario en español que puede contener:
- nombre común de la planta (p. ej. "tomate", "mi planta de tomate")
- descripción de síntomas (p. ej. "las hojas tienen manchas blancas, están secas en los bordes")

Extrae exactamente dos campos y devolvelos en JSON:
{
  "species": "texto con el nombre común si existe, o null",
  "symptoms": "texto con los síntomas descritos, o null"
}

Si en el mensaje no hay especie explícita, pon "null" en species.
Si no hay síntomas claros, pon "null" en symptoms.

Mensaje: """${message}"""
Responde solamente con el JSON.
`.trim();
  console.log("Entra a extractSpeciesAndSymptomsFromMessage");
  try {
    
    const res = await ollamaLLM.complete({ prompt, temperature: 0.0 });
    const txt = (res?.text || "").trim();
    // intentar parsear JSON del texto producido (puede venir con texto adicional)
    const jsonStart = txt.indexOf("{");
    const jsonStr = jsonStart >= 0 ? txt.slice(jsonStart) : txt;
    const parsed = JSON.parse(jsonStr);
    return {
      speciesText: parsed.species ? parsed.species.trim() : null,
      symptomsText: parsed.symptoms ? parsed.symptoms.trim() : null,
    };
  } catch (err) {
    console.error("[extractSpeciesAndSymptomsFromMessage] error:", err.message);
    // fallback: buscar palabra de especie en diccionario
    const normalized = normalizeText(message);
    let found = null;
    for (const k of Object.keys(SPECIES_LEX)) {
      if (normalized.includes(normalizeText(k))) {
        found = k;
        break;
      }
    }
    return {
      speciesText: found,
      symptomsText: message // asumimos todo es síntomas si no podemos parsear
    };
  }
}

async function translateWithLLM(text, targetLang) {
  if (!text) return text;
  const prompt = `Traduce al ${targetLang} manteniendo el sentido. Texto:\n\n${text}`;
  try {
    const out = await ollamaLLM.complete({ prompt, temperature: 0.1 });
    return (out?.text || text).trim();
  } catch (err) {
    console.error("[translateWithLLM] ", err.message);
    return text;
  }
}

// Si la especie no está en el léxico, pedíle al LLM que la traduzca a inglés (solo nombre común)
async function translateSpeciesToEnglish(speciesText) {
  if (!speciesText) return null;
  // búsqueda en léxico
  const normalized = normalizeText(speciesText);
  for (const k of Object.keys(SPECIES_LEX)) {
    if (normalized.includes(normalizeText(k))) {
      return SPECIES_LEX[k];
    }
  }
  // fallback: pedir traducción por LLM
  try {
    const prompt = `Traduce al inglés el nombre común de esta planta, devolviendo solo la traducción corta (ej: 'tomato'):\n\n"${speciesText}"`;
    const out = await ollamaLLM.complete({ prompt, temperature: 0.0 });
    const text = (out?.text || "").trim();
    // limpiar
    return text.split("\n")[0].replace(/["']/g, "").trim();
  } catch (err) {
    console.error("[translateSpeciesToEnglish] ", err.message);
    return speciesText;
  }
}


async function obtenerEnfermedadesDeLaBD() {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT "Nombre", "Descripcion", "EspeciesComunes", "Solucion" FROM "Enfermedad"`);
    return res.rows.map(r => ({
      name: r.Nombre,
      description: Array.isArray(r.Descripcion) ? r.Descripcion.map(String) : [String(r.Descripcion || "")],
      especies_comunes: Array.isArray(r.EspeciesComunes) ? r.EspeciesComunes.map(String) : (r.EspeciesComunes ? [String(r.EspeciesComunes)] : []),
      solution: Array.isArray(r.Solucion) ? r.Solucion.map(String) : [String(r.Solucion || "")]
    }));
  } catch (err) {
    console.error("[obtenerEnfermedadesDeLaBD] error:", err.message);
    return [];
  } finally {
    client.release();
  }
}

/* ---------------------
   Evaluador de enfermedades
   - para cada enfermedad calcula:
     * specieMatch: 1 si la especie está en especies_comunes (comparación flexible)
     * bestDescSim: la mejor similitud entre síntomas del usuario y cada elemento de description
     * score compuesto: (w_species * specieMatch) + (w_desc * bestDescSim)
   - devuelve lista ordenada por score descendente
   --------------------- */
function speciesInList(speciesEnglish, especiesList) {
  if (!speciesEnglish) return false;
  const sNorm = normalizeText(speciesEnglish);
  for (const e of especiesList || []) {
    if (!e) continue;
    const en = normalizeText(e);
    if (en.includes(sNorm) || sNorm.includes(en)) return true;
  }
  return false;
}

function evaluateDiseases(diseases, symptomsEng, speciesEnglish) {
  const w_species = 0.45;
  const w_desc = 0.55;

  const results = diseases.map(d => {
    // especie
    const specieMatch = speciesInList(speciesEnglish, d.especies_comunes) ? 1 : 0;

    // mejor similitud entre symptomsEng y cada element de description
    let bestDescSim = 0;
    for (const descPart of d.description || []) {
      const sim = cosineSimilarity(descPart, symptomsEng);
      if (sim > bestDescSim) bestDescSim = sim;
    }

    // score compuesto
    const score = (w_species * specieMatch) + (w_desc * bestDescSim);

    return {
      id: d.id,
      name: d.name,
      description: d.description,
      solution: d.solution,
      especies_comunes: d.especies_comunes,
      specieMatch,
      bestDescSim,
      score
    };
  });

  // ordenar desc por score
  results.sort((a, b) => b.score - a.score);
  return results;
}

/* ---------------------
   Generador de pregunta aclaratoria (si hace falta)
   - Usa LLM para generar una pregunta específica entre dos enfermedades candidatas
   - Devuelve una pregunta en español que apunte a la diferencia
   --------------------- */
async function generateClarifyingQuestion(userSymptoms, candidateA, candidateB) {
  try {
    const prompt = `
Eres un asistente que formula una sola pregunta corta en español para distinguir entre dos posibles enfermedades de plantas basándote en:
- la descripción de la enfermedad A y B (texto libre, pueden incluir síntomas)
- lo que ya describió el usuario (síntomas)

Usuario dijo: """${userSymptoms}"""

Enfermedad A (${candidateA.name}) - extractos:
${candidateA.description.join("\n")}

Enfermedad B (${candidateB.name}) - extractos:
${candidateB.description.join("\n")}

Formulá una sola pregunta directa que ayude a distinguir A de B (ej.: "¿Las manchas son polvorientas y blancas o oscuras y hundidas?"). Responde SOLO con la pregunta en español.
`;
    const out = await ollamaLLM.complete({ prompt, temperature: 0.2 });
    return (out?.text || "").trim();
  } catch (err) {
    console.error("[generateClarifyingQuestion] ", err.message);
    // fallback generico
    return "¿Podrías describir el color y la textura de las manchas en las hojas (ej. blancas y polvorientas / marrones y hundidas)?";
  }
}


const diagnosePlantEnhanced = tool({
  name: "diagnosePlantEnhanced",
  description: "Diagnóstico avanzado: extrae especie y síntomas, compara con la BD y devuelve diagnóstico, probabilidades o pregunta aclaratoria.",
  parameters: {
    type: "object",
    properties: {
      message: { type: "string", description: "Mensaje del usuario en español" }
    },
    required: ["message"]
  },

  execute: async ({ message }) => {
    // 1) extraer especie y sintomas (en español)
    const { speciesText, symptomsText } = await extractSpeciesAndSymptomsFromMessage(message);
    console.log("[diagnosePlantEnhanced] extracted: : especie" +  speciesText + "síntomas" + symptomsText);
    // Si no sacamos síntomas, pedir que el usuario describa
    if (!symptomsText) {
      return "No pude identificar síntomas en tu mensaje. ¿Podés describir qué ves en la planta (color de hojas, manchas, textura, pérdidas de hojas, crecimiento lento, etc.)?";
    }

    if(!speciesText){
      return "No pude identificar la especie de planta en tu mensaje. ¿Podés decirme qué planta es (nombre común)?";
    }
    // 2) traducir síntomas a inglés (para comparar con BD en inglés)
    const symptomsEng = await translateWithLLM(symptomsText, "inglés");
    console.log("[diagnosePlantEnhanced] rta - lo q tiene symptomsEng:", symptomsEng);

    // 3) determinar especie en inglés (léxico o LLM)
    let speciesEnglish = null;
    if (speciesText) {
      speciesEnglish = await translateSpeciesToEnglish(speciesText);
    }
    console.log("[diagnosePlantEnhanced] especie en inglés:", speciesEnglish);

    // 4) obtener enfermedades de la BD
    const enfermedades = await obtenerEnfermedadesDeLaBD();
    if (!enfermedades || enfermedades.length === 0) {
      return "No hay enfermedades cargadas en la base de datos del sistema. Contactá al administrador.";
    }
    console.log("[diagnosePlantEnhanced] enfermedades cargadas de la BD:", enfermedades.length);

    // 5) evaluar enfermedades
    const evaluated = evaluateDiseases(enfermedades, symptomsEng, speciesEnglish);
    console.log("Luego de evaluar enfermedades");

    // 6) lógica de decisión / umbrales
    const best = evaluated[0];
    const second = evaluated[1] || null;

    // Si la mejor score es muy baja -> pedir más info (no inventar)
    if (best.score < 0.25 && !(best.specieMatch === 1 && best.bestDescSim > 0.15)) {
      return "Con la información actual no puedo identificar con confianza una enfermedad. ¿Podés indicar: color de las manchas (blancas, amarillas, marrones, negras), si son polvorientas o hundidas, y si afecta hojas nuevas o viejas?";
    }

    //Si el primero y el segundo están muy parejos -> pedir aclaración
    if (second && (best.score - second.score) < 0.12) {
      if (best.specieMatch === 1 && second.specieMatch === 0) {
        // priorizar best pero informar segunda opción
        const raw = `
La enfermedad más probable es **${best.name}** (la especie que mencionaste aparece en la lista de especies comunes de esta enfermedad).
Probabilidad relativa (puntaje): ${ (best.score).toFixed(3) } vs ${ (second.score).toFixed(3) } para ${second.name}.

Extractos de la descripción (más relevantes):
- ${ (best.description[0]||"").slice(0,250) }
- ${ (second.description[0]||"").slice(0,250) }

Si querés, puedo decirte pasos concretos para la primera o explicarte cómo distinguir exactamente entre ambas.
        `;
        const respEs = await translateWithLLM(raw, "español"); // raw ya contiene español en partes, pero mantenemos consistencia
        return respEs;
      } else {
        // generar pregunta aclaratoria usando LLM
        const question = await generateClarifyingQuestion(symptomsText, best, second);
        return `Hay al menos dos enfermedades que podrían coincidir:\n- ${best.name}\n- ${second.name}\n\nPara elegir entre ellas: ${question}`;
      }
    }

    //Si hay un ganador claro
    const rawFinal = `
Enfermedad más probable: **${best.name}**

Por qué: puntaje ${best.score.toFixed(3)} (similitud con descripción: ${best.bestDescSim.toFixed(3)}${best.specieMatch ? ", especie listada en especies_comunes" : ""})

Extractos relevantes de la descripción:
${best.description.slice(0,3).join("\n\n")}

Soluciones (extracto):
${best.solution.slice(0,5).join("\n\n")}
    `;

    const finalEs = await translateWithLLM(rawFinal, "español");
    return finalEs;
  }
});


const systemPrompt = `
Sos un asistente experto en diagnóstico de enfermedades de plantas.
Tu flujo:
1) Extraer especie (nombre común) y síntomas desde el mensaje del usuario.
2) Llamar a la tool diagnosePlantEnhanced (solo cuando tengas al menos síntomas).
3) No inventar diagnósticos si la evidencia es insuficiente; pedir aclaraciones específicas.
`;

export const elAgente = agent({
  llm: ollamaLLM,
  tools: [diagnosePlantEnhanced],
  systemPrompt,
  verbose: true,
  maxSteps: 3,
});
