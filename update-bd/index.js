import dotenv from "dotenv";
dotenv.config();

import { EnfermedadesLoader } from "./src/loaders/LoadEnfermedades.js";
import { HuertaSpeciesLoader } from "./src/loaders/LoadHuertaSpecies.js";

async function main() {
  const action = process.argv[2]; // argumento del comando, ej: "especies" o "enfermedades"

  if (!action) {
    console.log("❗ Uso: npm start <accion>");
    console.log("   Acciones disponibles:");
    console.log("   - especies       Cargar especies de huerta");
    console.log("   - enfermedades   Sincronizar enfermedades");
    process.exit(1);
  }

  switch (action) {
    case "especies":
      console.log("🌱 Ejecutando carga de especies...");
      const speciesLoader = new HuertaSpeciesLoader();
      await speciesLoader.ObtenerDatosDeLaAPI();
      break;

    case "enfermedades":
      console.log("🧫 Ejecutando carga de enfermedades...");
      const enfermedadesLoader = new EnfermedadesLoader();
      await enfermedadesLoader.run();
      break;

    default:
      console.log(`❌ Acción desconocida: ${action}`);
      console.log("   Usa: npm start especies | npm start enfermedades");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("💥 Error general:", err);
  process.exit(1);
});
