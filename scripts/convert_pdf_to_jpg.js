// OPCIÓN 1: Descarga e instala Ghostscript
// Ve a: https://github.com/ArtifexSoftware/ghostpdl-downloads/releases
// Busca: gs10060w64.exe
// Instala y asegúrate de marcar "Add to PATH"
// check version  gswin64c -version
// run script with:
// node scripts/convert_pdf_to_jpg.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pdfDir = path.join(__dirname, '../public/');
const outputDir = path.join(__dirname, '../public/pdf');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function checkDependencies() {
  const errors = [];
  
  // Check ImageMagick
  try {
    execSync('magick -version', { stdio: 'ignore' });
  } catch {
    errors.push('ImageMagick no está instalado. Descarga: https://imagemagick.org/script/download.php#windows');
  }
  
  // Check Ghostscript - try multiple possible names
  let gsFound = false;
  const gsCommands = ['gswin64c', 'gs', 'gswin32c'];
  
  for (const cmd of gsCommands) {
    try {
      execSync(`${cmd} -version`, { stdio: 'ignore' });
      gsFound = true;
      break;
    } catch {}
  }
  
  if (!gsFound) {
    errors.push('Ghostscript no está instalado.');
    console.error('\n❌ GHOSTSCRIPT REQUERIDO');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('📥 Descarga directa:');
    console.error('   https://github.com/ArtifexSoftware/ghostpdl-downloads/releases');
    console.error('   Busca: gs10.04.0w64.exe\n');
    console.error('🍫 O instala con Chocolatey:');
    console.error('   choco install ghostscript\n');
    console.error('⚙️  Después de instalar:');
    console.error('   1. Reinicia PowerShell');
    console.error('   2. Verifica con: gswin64c -version');
    console.error('   3. Ejecuta de nuevo este script\n');
  }
  
  return errors.length === 0;
}

function convertPdfToJpg(pdfPath, outputPath) {
  try {
    const command = `magick -density 150 "${pdfPath}[0]" -quality 85 -flatten "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`✗ ${path.basename(pdfPath)}: ${error.message}`);
    return false;
  }
}

function findPdfFiles(directory) {
  const files = fs.readdirSync(directory);
  return files.filter(file => path.extname(file).toLowerCase() === '.pdf');
}

 

if (!checkDependencies()) {
  process.exit(1);
}

const pdfFiles = findPdfFiles(pdfDir);

if (pdfFiles.length === 0) {
  process.exit(0);
}

let successCount = 0;
let errorCount = 0;

pdfFiles.forEach(pdfFile => {
  const pdfPath = path.join(pdfDir, pdfFile);
  const baseName = path.basename(pdfFile, '.pdf');
  const outputPath = path.join(outputDir, `${baseName}.jpg`);
  
  if (convertPdfToJpg(pdfPath, outputPath)) {
    successCount++;
  } else {
    errorCount++;
  }
});

 
