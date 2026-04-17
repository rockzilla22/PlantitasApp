// Convert videos from X extension(s) to .webm in the same locations
// Usage:
//   node scripts/convert-video-to-webm.js             -> default formats
//   node scripts/convert-video-to-webm.js mp4         -> only .mp4
//   node scripts/convert-video-to-webm.js mov,avi     -> .mov and .avi
// Requires: FFmpeg installed and in PATH, npm i glob

let now = () => new Date().toLocaleString();
console.log("Starting video conversion to WebM... " + now());

const { execSync } = require("child_process");
const glob = require("glob");
const DEFAULT_EXTENSIONS = ["mov", "mp4", "avi", "flv", "wmv", "mkv", "webm"];
const codecType = "av1"; // Change to "av1" for AV1 codec (requires libaom or similar)
const arg = process.argv[2];
const extensions = arg
  ? arg
      .split(",")
      .map((ext) => ext.trim().replace(/^\./, "").toLowerCase())
      .filter(Boolean)
  : DEFAULT_EXTENSIONS;

if (extensions.length === 0) {
  console.error("No valid source extensions provided.");
  process.exit(1);
}

if (!["vp9", "av1"].includes(codecType)) {
  console.error('Invalid codecType. Use "vp9" or "av1".');
  process.exit(1);
}

const PATTERN = `**/*.{${extensions.join(",")}}`;
const EXT_REGEX = new RegExp(`\\.(${extensions.join("|")})$`, "i");

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
      const out = file.replace(EXT_REGEX, ".webm");
      if (out === file) continue;

      try {
        const videoArgs =
          codecType === "av1" ? ["-c:v libaom-av1", "-crf 35", "-b:v 0", "-cpu-used 4"] : ["-c:v libvpx-vp9", "-crf 32", "-b:v 0"];

        const cmd = ["ffmpeg -y", `-i "${file}"`, ...videoArgs, "-c:a libopus", "-b:a 96k", `"${out}"`].join(" ");

        execSync(cmd, { stdio: "ignore" });
      } catch (err) {
        console.error(`Failed convert ${file}:`, err?.message || String(err));
      }
    }
    
    now = () => new Date().toLocaleString();
    console.log("Finished video conversion to WebM... " + now());

  } catch (err) {
    console.error("Error during conversion:", err?.message || String(err));
    process.exit(1);
  }
})();
