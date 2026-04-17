import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 — CSS-first configuration.
 *
 * Most configuration now lives in `styles/globals.css`:
 *   - @import "tailwindcss"       → loads the framework
 *   - @theme { ... }              → extends design tokens
 *
 * This JS config is kept for backward-compat features that
 * still require it (e.g. darkMode strategy). Content paths
 * are auto-detected in v4, so we only declare them as a
 * safety net for edge cases.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
