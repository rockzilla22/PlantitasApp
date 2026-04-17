import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    base-uri 'self';
    object-src 'none';
    frame-ancestors 'self';
    upgrade-insecure-requests;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://c.bing.com https://*.clarity.ms https://client.crisp.chat https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://client.crisp.chat;
    img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://c.bing.com https://*.clarity.ms https://image.crisp.chat;
    font-src 'self' data: https://client.crisp.chat;
    connect-src 'self' https://*.google-analytics.com https://*.clarity.ms https://c.bing.com https://wss.crisp.chat https://client.crisp.chat https://vitals.vercel-insights.com;
    frame-src 'self' https://game.crisp.chat;
`;

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // ── Image optimization ───────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    // Add remote image domains here when needed:
    // remotePatterns: [
    //   { protocol: "https", hostname: "lh3.googleusercontent.com" },
    //   { protocol: "https", hostname: "avatars.githubusercontent.com" },
    // ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // CORE — Hardening HTTP básico
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },

          // Cross-Origin isolation
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },

          // Extras
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },

          // CSP Header
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
