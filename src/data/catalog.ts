export type Option = { value: string; label: string };
export type LogActionOption = Option & {
  icon: string;
  inventoryCategory?: string;
};

export const PLANT_TYPES: Option[] = [
  { value: "🍃|Alocasia", label: "🍃 Alocasia" },
  { value: "🌳|Arbusto", label: "🌳 Árbol / Arbusto" },
  { value: "🌿|Aromática", label: "🌿 Aromática" },
  { value: "🌵|Cactus", label: "🌵 Cactus / Suculenta" },
  { value: "🌱|Carnívora", label: "🌱 Carnívora" },
  { value: "🌸|Flor", label: "🌸 Flor" },
  { value: "🍓|Frutal", label: "🍓 Frutal" },
  { value: "🌿|Hierba", label: "🌿 Hierba" },
  { value: "🍃|Monstera", label: "🍃 Monstera" },
  { value: "🍃|Philodendron", label: "🍃 Philodendron" },
  { value: "🌿|Planta", label: "🌿 Planta (Genérica)" },
  { value: "🌿|Syngonium", label: "🌿 Syngonium" },
  { value: "☘️|Trébol", label: "☘️ Trébol" },
  { value: "CUSTOM", label: "✨ Otra (Personalizada)..." },
];

export const LIGHT_LEVELS: Option[] = [
  { value: "Alta/Directa", label: "☀️ Alta/Directa" },
  { value: "Alta/Indirecta", label: "☀️ Alta/Indirecta" },
  { value: "Baja", label: "☁️ Baja" },
  { value: "Media", label: "⛅ Media" },
];

export const POT_TYPES: Option[] = [
  { value: "Autorriego", label: "💧 Autorriego" },
  { value: "Barro", label: "🏺 Barro" },
  { value: "Plástico", label: "📦 Plástico" },
  { value: "Orquidea", label: "🥤 Orquidea" },
  { value: "Terracota", label: "🧱 Terracota" },
];

export const DORMANCIES: Option[] = [
  { value: "Invierno", label: "❄️ Invierno" },
  { value: "Ninguna", label: "🚫 Ninguna" },
  { value: "Verano", label: "☀️ Verano" },
];

export const PROP_METHODS: Option[] = [
  { value: "Acodo", label: "🌳 Acodo" },
  { value: "Agua", label: "💧 Agua" },
  { value: "Semilla", label: "🌱 Semilla" },
  { value: "Sustrato", label: "🟤 Sustrato" },
];

export const WISH_PRIORITIES: Option[] = [
  { value: "Alta", label: "Alta" },
  { value: "Baja", label: "Baja" },
  { value: "Media", label: "Media" },
];

export const SEASON_TASK_TYPES: Option[] = [
  { value: "Abonado", label: "🧪 Abonado" },
  { value: "Limpieza", label: "🧹 Limpieza" },
  { value: "Poda", label: "✂️ Poda" },
  { value: "Siembra", label: "🌱 Siembra" },
  { value: "Trasplante", label: "🛒 Trasplante" },
  { value: "Otro", label: "📝 Otro" },
];

export const INVENTORY_CATEGORIES: Option[] = [
  { value: "fertilizers", label: "🧴 Fertilizantes" },
  { value: "meds", label: "💊 Insecticidas/Medicinas" },
  { value: "liquids", label: "🧪 Líquidos" },
  { value: "powders", label: "⚪ Polvos" },
  { value: "substrates", label: "🟤 Sustratos" },
  { value: "others", label: "📦 Otros" },
];

export const INVENTORY_UNITS: Option[] = [
  { value: "g", label: "g (Gramos)" },
  { value: "Kg", label: "Kg (Kilos)" },
  { value: "L", label: "L (Litros)" },
  { value: "Paq.", label: "Paq. (Paquetes)" },
  { value: "u.", label: "u. (Unidades)" },
];

export const LOG_ACTIONS: LogActionOption[] = [
  { value: "Fertilizante", label: "🧴 Fertilizante", icon: "🧴", inventoryCategory: "fertilizers" },
  { value: "Insecticidas/Medicinas", label: "💊 Insecticidas/Medicinas", icon: "💊", inventoryCategory: "meds" },
  { value: "Líquidos", label: "🧪 Líquidos", icon: "🧪", inventoryCategory: "liquids" },
  { value: "Medición", label: "📏 Medición", icon: "📏" },
  { value: "Nota", label: "📝 Nota", icon: "📝" },
  { value: "Plaga/Enfermedad", label: "🐛 Plaga/Enfermedad", icon: "🐛", inventoryCategory: "meds" },
  { value: "Polvos", label: "⚪ Polvos", icon: "⚪", inventoryCategory: "powders" },
  { value: "Riego", label: "💧 Riego", icon: "💧" },
  { value: "Sustrato", label: "🟤 Sustrato", icon: "🟤", inventoryCategory: "substrates" },
  { value: "Trasplante", label: "🌳 Trasplante", icon: "🌳" },
];

export const LOG_ACTION_ICON_BY_VALUE: Record<string, string> = {
  Fertilizante: "🧴",
  "Insecticidas/Medicinas": "💊",
  "Líquidos": "🧪",
  Medición: "📏",
  Nota: "📝",
  "Plaga/Enfermedad": "🐛",
  Polvos: "⚪",
  Riego: "💧",
  Sustrato: "🟤",
  Trasplante: "🌳",
  Initial: "🌱",
};

export const LOG_ACTION_INVENTORY_CATEGORY_BY_VALUE: Record<string, string> = {
  Fertilizante: "fertilizers",
  "Insecticidas/Medicinas": "meds",
  "Líquidos": "liquids",
  "Plaga/Enfermedad": "meds",
  Polvos: "powders",
  Sustrato: "substrates",
};

// Convenience value-only exports for code that needs raw enums/values
export const POT_TYPE_VALUES = POT_TYPES.map((o) => o.value);
export const PLANT_TYPE_VALUES = PLANT_TYPES.map((o) => o.value);
export const INVENTORY_CATEGORY_VALUES = INVENTORY_CATEGORIES.map((o) => o.value);
export const LOG_ACTION_VALUES = LOG_ACTIONS.map((o) => o.value);

export default {
  PLANT_TYPES,
  LIGHT_LEVELS,
  POT_TYPES,
  DORMANCIES,
  PROP_METHODS,
  WISH_PRIORITIES,
  SEASON_TASK_TYPES,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  LOG_ACTIONS,
};
