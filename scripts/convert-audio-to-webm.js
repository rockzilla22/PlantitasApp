// Convert all .mp3, .wav, .m4a, .aac, and .ogg files to .webm (Opus)
// Usage: node scripts/convert-audio-to-webm.js
// Requires: FFmpeg installed and in PATH
// Optional: npm i glob

const { execSync } = require("child_process");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

const PATTERN = "**/*.{mp3,wav,m4a,aac,ogg}";

(async () => {
  try {
    const files = glob.sync(PATTERN, {
      nodir: true,
      ignore: [
        "**/node_modules/**",
        "dist/**",
        ".next/**",
        ".astro",
        ".vscode",
        "**/.agent",
        "**/.claude",
        "**/.codex",
        "**/.cursor",
        "**/.gemini",
        "**/.opencode",
        "dist",
      ],
    });

    for (const file of files) {
      const out = file.replace(/\.(mp3|wav|m4a|aac|ogg)$/i, ".webm");

      try {
        // Create output directory if needed
        const dir = path.dirname(out);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // FFmpeg command
        const cmd = `ffmpeg -y -i "${file}" -c:a libopus -b:a 96k "${out}"`;

        execSync(cmd, { stdio: "ignore" });
      } catch (err) {
        console.error(`Failed convert ${file}:`, err?.message || String(err));
      }
    }
  } catch (err) {
    console.error("Error during conversion:", err?.message || String(err));
    process.exit(1);
  }
})();
