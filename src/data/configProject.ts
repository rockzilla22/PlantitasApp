interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  description: string;
  icon?: string;
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
      registros: unknown[];
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
      color: string;
      description: string;
      maxSlots: number; // Límite de registros (plantas + notas + etc)
      trashRetentionDays: number; // Días de vigencia en papelera
      hasCloud: boolean; // Sincronización en la nube activa
      billingType: "free" | "one-time" | "subscription" | "system";
    };
  };

  // Catálogo de Feedback
  feedback: {
    types: {
      [key: string]: { label: string; icon: string; color: string; bgColor: string };
    };
    statuses: {
      [key: string]: { label: string; color: string; bgColor: string };
    };
    priorities: {
      [key: string]: { label: string; color: string; bgColor: string };
    };
  };
}

const configProject: ConfigProject = {
  // ======================================================
  // PROYECTO (metadata / web)
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
  // METADATOS / SEO
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
  // SOPORTE / CONTACTO (publico)
  // ======================================================
  support: {
    email: "hola@plantitasapp.com",
  },

  // ======================================================
  // RESEND (client-side references)
  // ======================================================
  resend: {
    fromAdmin: "admin@plantitasapp.com",
    fromNoReply: "noreply@plantitasapp.com",
  },

  // ======================================================
  // REDES SOCIALES (para SocialDock / JSON-LD)
  // ======================================================
  socials: {
    github: "https://github.com/JFEspanolito/PlantitasApp",
    linkedin: "https://linkedin.com/in/jfespanolito",
    twitter: "https://twitter.com/jfespanolito",
    instagram: "https://instagram.com/jfespanolito",
  },

  // ======================================================
  // MARKETING (placeholders)
  // ======================================================
  marketing: {
    tagline: "Cultivá con precisión profesional.",
    testimonials: {
      headline: "Lo que dicen los amantes de las plantas",
      subhead: "Unite a la comunidad botánica digital.",
      registros: [],
    },
  },

  // ======================================================
  // NAVEGACION (labels y rutas i18n)
  // ======================================================
  navigation: {
    ES: {
      plants: {
        label: "Mis Plantas",
        description: "Registra cada ejemplar con su ubicación, luz y sustrato. Lleva el historial completo de riegos y cuidados.",
        icon: "/icons/environment/plants/generic.svg",
        href: "/plants",
      },
      nursery: {
        label: "Propagación",
        description: "Seguimiento de esquejes y semillas. Vincula propagaciones con sus plantas madre y controla su evolución.",
        icon: "/icons/environment/plants/seed.svg",
        href: "/nursery",
      },
      inventory: {
        label: "Inventario",
        description: "Control de stock de tus insumos: sustratos, fertilizantes y medicamentos siempre al día.",
        icon: "/icons/environment/inventory/box.svg",
        href: "/inventory",
      },
      season: {
        label: "Planeación",
        description: "Organiza tareas por estación. Riego, poda, fertilización y siembra según el ciclo natural.",
        icon: "/icons/common/calendar.svg",
        href: "/season",
      },
      wishlist: {
        label: "Lista de Deseos",
        description: "Tu Lista de Deseos botánicos organizada por prioridad para que no se te escape ninguna.",
        icon: "/icons/common/gift.svg",
        href: "/wishlist",
      },
      notes: {
        label: "Notas",
        description: "Espacio libre para tus observaciones rápidas, ideas o recordatorios de tu jardín.",
        icon: "/icons/common/notes.svg",
        href: "/notes",
      },
      garden: {
        label: "Jardín",
        description: "El espacio donde tu esfuerzo florece y tu colección cobra vida.",
        icon: "/icons/environment/location/home.svg",
        href: "/garden",
      },
      forum: {
        label: "Foro",
        description: "El espacio los Plant Lover pueden compartir experiencias, consejos y fotos de sus plantas.",
        icon: "/icons/common/sand_timer.svg",
        href: "/forum",
      }
    },
    EN: {
      plants: {
        label: "My Plants",
        description: "Register each specimen with its location, light, and substrate. Keep a complete history of watering and care.",
        icon: "/icons/environment/plants/generic.svg",
        href: "/plants",
      },
      nursery: {
        label: "Nursery",
        description: "Track cuttings and seeds. Link propagations with their parent plants and monitor their progress.",
        icon: "/icons/environment/log/lab.svg",
        href: "/nursery",
      },
      season: {
        label: "Season",
        description: "Organize tasks by season. Watering, pruning, fertilizing, and planting according to the natural cycle.",
        icon: "/icons/common/calendar.svg",
        href: "/season",
      },
      wishlist: {
        label: "Wishlist",
        description: "Your botanical Wishlist organized by priority so you don't miss anything.",
        icon: "/icons/common/stars.svg",
        href: "/wishlist",
      },
      inventory: {
        label: "Inventory",
        description: "Keep your supplies stock up to date: substrates, fertilizers, and medications.",
        icon: "/icons/environment/inventory/box.svg",
        href: "/inventory",
      },
      notes: {
        label: "Notes",
        description: "Free space for your quick observations, ideas, or garden reminders.",
        icon: "/icons/common/notes.svg",
        href: "/notes",
      },
      garden: {
        label: "Garden",
        description: "Visualize and manage your entire garden.",
        icon: "/icons/environment/location/home.svg",
        href: "/garden",
      },
    },
  },

  // ======================================================
  // CATÁLOGO DE PLANES (niveles de acceso)
  // ======================================================
  plans: {
    NONE: {
      id: "NoAccount",
      label: "Sin cuenta",
      color: "var(--text-gray)",
      description: "Modo invitado. Tus datos se guardan solo en este navegador.",
      maxSlots: 15,
      trashRetentionDays: 30,
      hasCloud: false,
      billingType: "free",
    },
    FREE: {
      id: "Free",
      label: "Usuario",
      color: "var(--text-white)",
      description: "Cuenta básica. Acceso a gestión botánica local.",
      maxSlots: 30,
      trashRetentionDays: 60,
      hasCloud: false,
      billingType: "free",
    },
    PRO: {
      id: "Pro",
      label: "Pro",
      color: "var(--secondary)",
      description: "Pago único. Ampliá tu capacidad local permanentemente.",
      maxSlots: 300,
      trashRetentionDays: 90,
      hasCloud: true,
      billingType: "one-time",
    },
    PREMIUM: {
      id: "Premium",
      label: "Premium",
      color: "var(--primary)",
      description: "Acceso total. Sincronización en la nube e ilimitados.",
      maxSlots: 999999,
      trashRetentionDays: 180,
      hasCloud: true,
      billingType: "subscription",
    },
    MASTER: {
      id: "Master",
      label: "Master",
      color: "var(--gold)",
      description: "Nivel de sistema. Control total e integridad suprema.",
      maxSlots: 999999,
      trashRetentionDays: 9999,
      hasCloud: true,
      billingType: "system",
    },
  },

  // ======================================================
  // CATÁLOGO DE FEEDBACK (gestión de reportes)
  // ======================================================
  feedback: {
    types: {
      Bug: { label: "Bug / Error", icon: "/icons/environment/animals/ant.svg", color: "#e11d48", bgColor: "#fff1f2" },
      Idea: { label: "Idea / Sugerencia", icon: "/icons/common/stars.svg", color: "#2563eb", bgColor: "#eff6ff" },
      Comentario: { label: "Comentario", icon: "/icons/common/notes.svg", color: "#4b5563", bgColor: "#f3f4f6" },
    },
    statuses: {
      nuevo: { label: "Nuevo", color: "#059669", bgColor: "#f0fdf4" },
      en_revision: { label: "En Revisión", color: "#d97706", bgColor: "#fffbeb" },
      resuelto: { label: "Resuelto", color: "#2563eb", bgColor: "#eff6ff" },
      cerrado: { label: "Cerrado", color: "#4b5563", bgColor: "#f3f4f6" },
    },
    priorities: {
      baja: { label: "Baja", color: "#4b5563", bgColor: "#f3f4f6" },
      media: { label: "Media", color: "#2563eb", bgColor: "#eff6ff" },
      alta: { label: "Alta", color: "#d97706", bgColor: "#fffbeb" },
      critica: { label: "Crítica", color: "#e11d48", bgColor: "#fff1f2" },
    },
  },
};

export default configProject;
