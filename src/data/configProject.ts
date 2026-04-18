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

  // Catálogo de Planes (Monetización)
  plans: {
    [key: string]: {
      id: string;
      label: string;
      icon: string;
      color: string;
      description: string;
      maxSlots: number;      // Límite de items (plantas + notas + etc)
      hasCloud: boolean;     // Sincronización en la nube activa
      billingType: 'free' | 'one-time' | 'subscription' | 'system';
    };
  };
}

const configProject: ConfigProject = {
  // ======================================================
  // 🧩 PROYECTO (metadata / web)
  // ======================================================
  appName: "PlantitasApp",
  tabname: "PlantitasApp - Gestión Botánica",
  appDescription: "Gestión botánica profesional con sincronización en la nube, integridad referencial y reportes avanzados.",
  ogTitle: "PlantitasApp",
  ogDescription: "Tu laboratorio botánico profesional en la nube.",
  domainName: "plantitas-app.vercel.app/",
  siteUrl: "https://plantitas-app.vercel.app/",
  copyright_es: `© ${new Date().getFullYear()} — PlantitasApp — Todos los derechos reservados.`,
  copyright_en: `© ${new Date().getFullYear()} — PlantitasApp — All rights reserved.`,

  // ======================================================
  // 🌐 METADATOS / SEO
  // ======================================================
  language: "es-AR",
  themeColor: "var(--brand-dark)",
  colors: {
    main: "var(--primary)",
    background: "var(--background)",
    foreground: "var(--brand-foreground)",
  },
  keywords: ["plantas", "botánica", "gestión", "jardinería", "huerta"],
  author: "JFEspanolito",
  twitter: "@JFEspanolito",

  // Rutas hacia imagenes base
  images: {
    ogDefault: "/PageCover/cover.webp",
    twitterCard: "/PageCover/cover.webp",
    favicon: "/PageCover/favicon.svg",
    icon16: "/PageCover/favicon.svg",
    icon32: "/PageCover/favicon.svg",
    icon192: "/PageCover/favicon.svg",
    icon512: "/PageCover/favicon.svg",
    appleTouch: "/PageCover/favicon.svg",
    safariMask: "/PageCover/favicon.svg",
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
      plants: { label: "🌿 Mis Plantas", href: "/plants" },
      nursery: { label: "🧪 Propagación", href: "/nursery" },
      inventory: { label: "📦 Inventario", href: "/inventory" },
      season: { label: "📅 Temporada", href: "/season" },
      wishlist: { label: "✨ Lista de Deseos", href: "/wishlist" },
      notes: { label: "📝 Notas", href: "/notes" },
      garden: { label: "🏡 Jardín", href: "/garden" },
    },
    EN: {
      plants: { label: "🌿 My Plants", href: "/plants" },
      nursery: { label: "🧪 Nursery", href: "/nursery" },
      season: { label: "📅 Season", href: "/season" },
      wishlist: { label: "✨ Wishlist", href: "/wishlist" },
      inventory: { label: "📦 Inventory", href: "/inventory" },
      notes: { label: "📝 Notes", href: "/notes" },
      garden: { label: "🏡 Garden", href: "/garden" },
    },
  },

  // ======================================================
  // 💎 CATÁLOGO DE PLANES (niveles de acceso)
  // ======================================================
  plans: {
    NONE: {
      id: "Sin cuenta",
      label: "Sin cuenta",
      icon: "👤",
      color: "var(--text-gray)",
      description: "Modo invitado. Tus datos se guardan solo en este navegador.",
      maxSlots: 25,
      hasCloud: false,
      billingType: 'free',
    },
    FREE: {
      id: "Usuario",
      label: "Usuario",
      icon: "🌱",
      color: "var(--primary-light)",
      description: "Cuenta básica. Acceso a gestión botánica local.",
      maxSlots: 50,
      hasCloud: false,
      billingType: 'free',
    },
    PRO: {
      id: "Pro",
      label: "Pro",
      icon: "💎",
      color: "var(--secondary)",
      description: "Pago único. Ampliá tu capacidad local permanentemente.",
      maxSlots: 200,
      hasCloud: true,
      billingType: 'one-time',
    },
    PREMIUM: {
      id: "Premium",
      label: "Premium",
      icon: "✨",
      color: "var(--primary)",
      description: "Acceso total. Sincronización en la nube e ilimitados.",
      maxSlots: 999999,
      hasCloud: true,
      billingType: 'subscription',
    },
    MASTER: {
      id: "Master Admin",
      label: "Master",
      icon: "🛡️",
      color: "var(--gold)",
      description: "Nivel de sistema. Control total e integridad suprema.",
      maxSlots: 999999,
      hasCloud: true,
      billingType: 'system',
    },
  },
};

export default configProject;
