#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

//use
// go to folder with files to normalize
// cd "E:\Archivos\Documents\devcode\jfespanolito.com\public\certificates"
// run script
// node "E:\Archivos\Documents\devcode\jfespanolito.com\scripts\normalize-names.js" -r
// if you need check subfolders, user 
// node "E:\Archivos\Documents\devcode\jfespanolito.com\scripts\normalize-names.js" --dry

// ---- Normalización de texto ----
function normalizeName(name) {
  // separa extensión (si existe)
  const ext = path.extname(name);
  const base = ext ? name.slice(0, -ext.length) : name;

  const normalized = base
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // borra diacríticos
    .replace(/ß/g, "ss") // casos especiales opcionales
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/[^a-zA-Z0-9]+/g, "_") // todo lo no alfanumérico -> _
    .replace(/^_+|_+$/g, "") // trim de _
    .replace(/_+/g, "_") // colapsa ___ -> _
    .toLowerCase();

  return normalized + ext.toLowerCase();
}

// ---- Renombrado ----
async function renameInDir(dir, { recursive, dry }) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const ent of entries) {
    const oldPath = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      if (recursive) {
        await renameInDir(oldPath, { recursive, dry });
      }
      // luego renombra la carpeta
    }

    const newName = normalizeName(ent.name);
    if (newName && newName !== ent.name) {
      const newPath = path.join(dir, newName);

      if (dry) {
        
      } else {
        // evita colisiones simples
        try {
          await fs.access(newPath);
          console.warn(`SKIP (ya existe): ${newPath}`);
        } catch {
          await fs.rename(oldPath, newPath);
        }
      }
    }
  }
}

// ---- CLI ----
const args = new Set(process.argv.slice(2));
const recursive = args.has("--recursive") || args.has("-r");
const dry = args.has("--dry");

const targetDir = process.cwd();

renameInDir(targetDir, { recursive, dry }).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
