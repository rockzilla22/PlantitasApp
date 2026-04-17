interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  submenu?: NavSubItem[];
}

interface NavigationLocale {
  [key: string]: NavItem;
}

export interface ConfigProject {
  // Proyecto
  appName: string;
  tabname: string;
  appDescription: string;
  ogTitle: string;
  ogDescription: string;
  domainName: string;
  siteUrl: string;
  copyright_es: string;
  copyright_en: string;

  // SEO / Metadatos
  language: string;
  themeColor: string;
  colors: {
    main: string;
    background: string;
    foreground: string;
  };
  keywords: string[];
  author: string;
  twitter: string;

  // Imagenes
  images: {
    ogDefault: string;
    twitterCard: string;
    favicon: string;
    icon16: string;
    icon32: string;
    icon192: string;
    icon512: string;
    appleTouch: string;
    safariMask: string;
  };

  // Soporte
  support: {
    email: string;
  };

  // Resend
  resend: {
    fromAdmin: string;
    fromNoReply: string;
  };

  // Redes sociales (opcional — usado por SocialDock)
  socials?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };

  // Marketing
  marketing: {
    tagline: string;
    testimonials: {
      headline: string;
      subhead: string;
      items: unknown[];
    };
  };

  // Navegacion i18n
  navigation: {
    ES: NavigationLocale;
    EN: NavigationLocale;
  };
}

const configProject: ConfigProject = {
  // ======================================================
  // 🧩 PROYECTO (metadata / web)
  // ======================================================
  appName: "PlantitasApp",
  tabname: "PlantitasApp PRO - Gestión Botánica",
  appDescription: "Gestión botánica profesional con sincronización en la nube, integridad referencial y reportes avanzados.",
  ogTitle: "PlantitasApp PRO",
  ogDescription: "Tu laboratorio botánico profesional en la nube.",
  domainName: "plantitasapp.com",
  siteUrl: "http://localhost:3000",
  copyright_es: `© ${new Date().getFullYear()} — PlantitasApp — Todos los derechos reservados.`,
  copyright_en: `© ${new Date().getFullYear()} — PlantitasApp — All rights reserved.`,

  // ======================================================
  // 🌐 METADATOS / SEO
  // ======================================================
  language: "es-AR",
  themeColor: "#1a2e1a",
  colors: {
    main: "#2e7d32",
    background: "#f1f8e9",
    foreground: "#263238",
  },
  keywords: ["plantas", "botánica", "gestión", "jardinería", "huerta"],
  author: "JFEspanolito",
  twitter: "@JFEspanolito",

  // Rutas hacia imagenes base
  // se recomienda que las imagenes sean de 1200x630px para OG y 1024x512px para Twitter
  images: {
    ogDefault: "/PageCover/cover.webp",
    twitterCard: "/PageCover/cover.webp",
    favicon: "/favicon.svg",
    icon16: "/favicon.svg",
    icon32: "/favicon.svg",
    icon192: "/favicon.svg",
    icon512: "/favicon.svg",
    appleTouch: "/favicon.svg",
    safariMask: "/favicon.svg",
  },

  // ======================================================
  // 💬 SOPORTE / CONTACTO (publico)
  // ======================================================
  support: {
    email: "hola@plantitasapp.com",
  },

  // ======================================================
  // ✉️ RESEND (client-side references)
  // ======================================================
  resend: {
    fromAdmin: "admin@plantitasapp.com",
    fromNoReply: "noreply@plantitasapp.com",
  },

  // ======================================================
  // 🔗 REDES SOCIALES (para SocialDock / JSON-LD)
  // ======================================================
  socials: {
    github: "https://github.com/JFEspanolito/PlantitasApp",
    linkedin: "https://linkedin.com/in/jfespanolito",
    twitter: "https://twitter.com/jfespanolito",
    instagram: "https://instagram.com/jfespanolito",
  },

  // ======================================================
  // 📣 MARKETING (placeholders)
  // ======================================================
  marketing: {
    tagline: "Cultivá con precisión profesional.",
    testimonials: {
      headline: "Lo que dicen los amantes de las plantas",
      subhead: "Unite a la comunidad botánica digital.",
      items: [],
    },
  },

  // ======================================================
  // 🧭 NAVEGACION (labels y rutas i18n)
  // ======================================================
  navigation: {
    ES: {
      plants: { label: "Mis Plantas", href: "/plants" },
      nursery: { label: "🧪 Propagación", href: "/nursery" },
      season: { label: "📅 Temporada", href: "/season" },
      wishlist: { label: "✨ Wishlist", href: "/wishlist" },
      inventory: { label: "📦 Inventario", href: "/inventory" },
      notes: { label: "📝 Notas", href: "/notes" },
    },
    EN: {
      plants: { label: "My Plants", href: "/plants" },
      nursery: { label: "🧪 Nursery", href: "/nursery" },
      season: { label: "📅 Season", href: "/season" },
      wishlist: { label: "✨ Wishlist", href: "/wishlist" },
      inventory: { label: "📦 Inventory", href: "/inventory" },
      notes: { label: "📝 Notes", href: "/notes" },
    },
  },
};

export default configProject;
