#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

// Ejecutar usando
// node scripts\rename_files_from_x_to_numberSerie.js "E:\Archivos\Documents\devcode\1.TierraHuecaStudio\VeronicaHope3d\src\assets\The-Axe"
// o puedes ir a las carpetas
// cd "C:\ruta\completa\a\la\carpeta\de\imagenes"
// node "e:\Archivos\Documents\devcode\1.TierraHuecaStudio\VeronicaHope3d\scripts\rename_files_from_x_to_numberSerie.js"

// ---- Lógica de renombrado ----
async function renameFiles(dir, { dry }) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    // Filtrar solo para archivos y ordenarlos por nombre para un orden consistente
    const files = entries
      .filter((ent) => ent.isFile())
      .sort((a, b) => a.name.localeCompare(b.name));

    if (files.length === 0) {
      console.log(`No se encontraron archivos en "${dir}".`);
      return;
    }

    // Determinar el relleno necesario. Usar al menos 2 dígitos (ej. 01, 02).
    const padding = Math.max(2, String(files.length - 1).length);

    console.log(`Se encontraron ${files.length} archivos para renombrar en "${dir}"`);
    if (dry) {
      console.log("--- EJECUCIÓN DE PRUEBA (no se realizarán cambios) ---");
    }

    // Usar un bucle for simple para asegurar el orden
    for (let i = 0; i < files.length; i++) {
      const oldName = files[i].name;
      const oldPath = path.join(dir, oldName);
      const ext = path.extname(oldName);
      
      // El nuevo nombre será una secuencia como 00, 01, 02...
      const newBaseName = String(i).padStart(padding, "0");
      const newName = `${newBaseName}${ext}`;
      const newPath = path.join(dir, newName);

      if (oldPath === newPath) {
        console.log(`- Saltando "${oldName}" (ya tiene el nombre correcto)`);
        continue;
      }

      console.log(`  Renombrando: ${oldName} -> ${newName}`);

      if (!dry) {
        try {
          // Comprobar si ya existe un archivo con el nuevo nombre para evitar sobrescribirlo.
          // fs.access lanza un error si el archivo NO existe, que es lo que queremos.
          await fs.access(newPath);
          console.warn(`  [SALTAR] No se puede renombrar porque "${newName}" ya existe.`);
        } catch {
          // Si lanza un error, podemos renombrar.
          await fs.rename(oldPath, newPath);
        }
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
        console.error(`Error: Directorio no encontrado en "${dir}"`);
    } else {
        console.error(`Ocurrió un error:`, err);
    }
    process.exit(1);
  }
}

// ---- CLI ----
// Renombra todos los archivos en un directorio a una secuencia numérica (ej. 00.ext, 01.ext, 02.ext...).
//
// Uso:
//   node scripts/rename_files_from_x_to_numberSerie.js [ruta_al_directorio] [--dry]
//
// Argumentos:
//   [ruta_al_directorio] (opcional): El directorio que contiene los archivos a renombrar.
//                                    Si se omite, se usa el directorio de trabajo actual.
//   --dry (opcional)               : Muestra qué cambios se realizarán sin cambiar realmente ningún archivo.
//
// Ejemplo:
//   node scripts/rename_files_from_x_to_numberSerie.js "C:\Users\TuUsuario\Desktop\MisImagenes"
//
// Ejemplo de ejecución de prueba:
//   node scripts/rename_files_from_x_to_numberSerie.js --dry

const args = process.argv.slice(2);
const dry = args.includes("--dry");

// El primer argumento que no es una bandera se trata como el directorio de destino.
let targetDir = args.find(arg => !arg.startsWith('--')) || process.cwd();
targetDir = path.resolve(targetDir); // Resolver a una ruta absoluta

renameFiles(targetDir, { dry }).then(() => {
  console.log("\nProceso de renombrado completado.");
}).catch((err) => {
  // Los errores de renameFiles ya se manejan, pero esto captura cualquier otro rechazo de promesa.
  console.error("Ocurrió un error crítico:", err.message);
  process.exit(1);
});
