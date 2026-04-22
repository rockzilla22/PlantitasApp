// Convert all .png, .jpg, .jpeg, and .svg files to .webp in the same locations
// Usage: node scripts/convert-images-to-webp.js
// Requires: npm i sharp

const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const ROOT_DIR = process.cwd();
const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  ".next",
  ".astro",
  ".vscode",
  ".agent",
  ".claude",
  ".codex",
  ".cursor",
  ".gemini",
  ".opencode",
  ".git",
]);

async function collectImageFiles(dirPath, acc = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }

      await collectImageFiles(fullPath, acc);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SOURCE_EXTENSIONS.has(ext)) {
      acc.push(fullPath);
    }
  }

  return acc;
}

function toWebpPath(filePath) {
  return filePath.replace(/\.(png|jpe?g|svg)$/i, ".webp");
}

async function convertFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const outPath = toWebpPath(filePath);

  const options = extension === ".svg" ? { lossless: true } : { quality: 80 };
  await sharp(filePath).webp(options).toFile(outPath);
}

async function main() {
  try {
    const files = await collectImageFiles(ROOT_DIR);

    if (files.length === 0) {
      console.log("No image files found to convert.");
      return;
    }

    let converted = 0;
    let failed = 0;

    for (const filePath of files) {
      try {
        await convertFile(filePath);
        converted += 1;
        console.log(`Converted: ${path.relative(ROOT_DIR, filePath)}`);
      } catch (error) {
        failed += 1;
        console.error(`Failed convert ${path.relative(ROOT_DIR, filePath)}:`, error?.message || String(error));
      }
    }

    console.log(`Done. Converted: ${converted}. Failed: ${failed}.`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Error during conversion:", error?.message || String(error));
    process.exit(1);
  }
}

main();