// Convert all .png, .jpg, .jpeg, and .svg files to .webp in the same locations
// Usage: node scripts/convert-images-to-webp.js
// Requires: npm i sharp glob

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sharp = require('sharp');

// 1. PATTERN actualizado para incluir jpg 
    const files = glob.sync(PATTERN, { nodir: true, ignore: ["**/node_modules/**", "dist/**", ".next/**",".astro",".vscode","**/.agent","**/.claude","**/.codex","**/.cursor","**/.gemini","**/.opencode","dist"] });

(async () => {
  try {
    const files = glob.sync(PATTERN, { nodir: true, ignore: ['**/node_modules/**', 'dist/**', '.next/**'] });
    

    for (const file of files) {
      // 2. Regex actualizada para reemplazar cualquier extensión de origen
      const out = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      
      try {
        const extension = path.extname(file).toLowerCase();

        let conversion;

        // 3. Lógica de conversión condicional
        if (extension === '.svg') {
          // Usar 'lossless' para SVGs para mantener la nitidez
          conversion = sharp(file).webp({ lossless: true });
        } else {
          // Usar 'quality' para fotos/imágenes rasterizadas (png, jpg)
          conversion = sharp(file).webp({ quality: 80 });
        }

        await conversion.toFile(out);
        } catch (err) {
        console.error(`Failed convert ${file}:`, err?.message || String(err));
      }
    }

    
    } catch (err) {
    console.error('Error during conversion:', err?.message || String(err));
    process.exit(1);
  }
})();