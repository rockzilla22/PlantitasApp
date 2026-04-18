export type Option = { value: string; label: string; img?: string };
export type LogActionOption = Option & {
  icon: string;
  inventoryCategory?: string;
};

export const PLANT_TYPES: Option[] = [
  { value: "Alocasia", label: "🍃 Alocasia", img: "/standard/plants/alocasia.svg" },
  { value: "Arbusto", label: "🌳 Árbol / Arbusto", img: "/standard/plants/shrub.svg" },
  { value: "Aromática", label: "🌿 Aromática", img: "/standard/plants/aromatic.svg" },
  { value: "Cactus", label: "🌵 Cactus / Suculenta", img: "/standard/plants/cactus.svg" },
  { value: "Carnívora", label: "🌱 Carnívora", img: "/standard/plants/carnivorous.svg" },
  { value: "Flor", label: "🌸 Flor", img: "/standard/plants/flower.svg" },
  { value: "Frutal", label: "🍓 Frutal", img: "/standard/plants/fruits.svg" },
  { value: "Hierba", label: "🌿 Hierba", img: "/standard/plants/aromatic.svg" },
  { value: "Monstera", label: "🍃 Monstera", img: "/standard/plants/alocasia.svg" },
  { value: "Philodendron", label: "🍃 Philodendron", img: "/standard/plants/alocasia.svg" },
  { value: "Planta", label: "🌿 Planta (Genérica)", img: "/standard/plants/alocasia.svg" },
  { value: "Syngonium", label: "🌿 Syngonium", img: "/standard/plants/alocasia.svg" },
  { value: "Trébol", label: "☘️ Trébol", img: "/standard/plants/clover.svg" },
  { value: "CUSTOM", label: "✨ Otra (Personalizada)...", img: "/icons/common/stars.svg" },
];

export const LIGHT_LEVELS: Option[] = [
  { value: "Alta/Directa", label: "☀️ Alta/Directa", img: "/icons/environment/sun.svg" },
  { value: "Alta/Indirecta", label: "☀️ Alta/Indirecta", img: "/icons/environment/cloud_sun_high.svg" },
  { value: "Baja", label: "☁️ Baja", img: "/icons/environment/cloud.svg" },
  { value: "Media", label: "⛅ Media", img: "/icons/environment/cloud_sun.svg" },
];

export const POT_TYPES: Option[] = [
  { value: "Autorriego", label: "💧 Autorriego", img: "/icons/actions/water.svg" },
  { value: "Barro", label: "🏺 Barro", img: "/standard/pots/terra_pot.svg" },
  { value: "Plástico", label: "📦 Plástico", img: "/standard/pots/plastic_pot.svg" },
  { value: "Orquidea", label: "🥤 Orquidea", img: "/standard/pots/orchid_pot.svg" },
  { value: "Terracota", label: "🧱 Terracota", img: "/standard/pots/terra_pot.svg" },
];

export const DORMANCIES: Option[] = [
  { value: "Invierno", label: "❄️ Invierno", img: "/icons/environment/4_winter.svg" },
  { value: "Ninguna", label: "🚫 Ninguna", img: "/icons/common/nothing.svg" },
  { value: "Verano", label: "☀️ Verano", img: "/icons/environment/2_summer.svg" },
];

export const PROP_METHODS: Option[] = [
  { value: "Acodo", label: "🌳 Acodo", img: "/icons/common/layering.svg" },
  { value: "Agua", label: "💧 Agua", img: "/icons/actions/water.svg" },
  { value: "Semilla", label: "🌱 Semilla", img: "/icons/common/propagacion_Semilla.svg" },
  { value: "Sustrato", label: "🟤 Sustrato", img: "/standard/inventory/substrates.svg" },
];

export const WISH_PRIORITIES: Option[] = [
  { value: "Alta", label: "Alta", img: "/icons/common/fail.svg" },
  { value: "Baja", label: "Baja", img: "/icons/common/success.svg" },
  { value: "Media", label: "Media", img: "/icons/common/sand_timer.svg" },
];

export const SEASON_TASK_TYPES: Option[] = [
  { value: "Abonado", label: "🧪 Abonado", img: "/standard/inventory/fertilizer.svg" },
  { value: "Limpieza", label: "🧹 Limpieza", img: "/icons/actions/dead_plant.svg" },
  { value: "Poda", label: "✂️ Poda", img: "/icons/common/pencil.svg" },
  { value: "Siembra", label: "🌱 Siembra", img: "/icons/common/propagacion_Semilla.svg" },
  { value: "Trasplante", label: "🛒 Trasplante", img: "/standard/pots/plant_pot.svg" },
  { value: "Otro", label: "📝 Otro", img: "/icons/common/notes.svg" },
];

export const INVENTORY_CATEGORIES: Option[] = [
  { value: "fertilizers", label: "🧴 Fertilizantes", img: "/standard/inventory/fertilizer.svg" },
  { value: "meds", label: "💊 Insecticidas/Medicinas", img: "/standard/inventory/medicine.svg" },
  { value: "liquids", label: "🧪 Líquidos", img: "/standard/inventory/liquid.svg" },
  { value: "powders", label: "⚪ Polvos", img: "/icons/actions/powder.svg" },
  { value: "substrates", label: "🟤 Sustratos", img: "/standard/inventory/substrates.svg" },
  { value: "others", label: "📦 Otros", img: "/icons/common/box.svg" },
];

export const INVENTORY_UNITS: Option[] = [
  { value: "g", label: "g (Gramos)" },
  { value: "Kg", label: "Kg (Kilos)" },
  { value: "L", label: "L (Litros)" },
  { value: "Paq.", label: "Paq. (Paquetes)" },
  { value: "u.", label: "u. (Unidades)" },
];

export const PLANT_LOCATIONS: Option[] = [
  { value: "Sala", label: "🛋️ Sala", img: "/icons/common/home.svg" },
  { value: "Comedor", label: "🪑 Comedor", img: "/icons/common/home.svg" },
  { value: "Cocina", label: "🍳 Cocina", img: "/icons/common/home.svg" },
  { value: "Recámara", label: "🛌 Recámara", img: "/icons/common/home.svg" },
  { value: "Baño", label: "🚿 Baño", img: "/icons/common/home.svg" },
  { value: "Estudio", label: "🖥️ Estudio", img: "/icons/common/home.svg" },
  { value: "Entrada", label: "🚪 Entrada", img: "/icons/common/home.svg" },
  { value: "Balcón", label: "🪴 Balcón", img: "/icons/common/home.svg" },
  { value: "Patio", label: "🧺 Patio", img: "/icons/common/home.svg" },
  { value: "Jardín", label: "🌳 Jardín", img: "/icons/common/home.svg" },
  { value: "Techo", label: "🏠 Techo / Azotea", img: "/icons/common/home.svg" },
  { value: "Oficina", label: "💼 Oficina", img: "/icons/common/home.svg" },
  { value: "Otros", label: "✨ Otra", img: "/icons/common/map.svg" },
];

export const LOG_ACTIONS: LogActionOption[] = [
  { value: "Fertilizante", label: "🧴 Fertilizante", icon: "🧴", inventoryCategory: "fertilizers", img: "/standard/inventory/fertilizer.svg" },
  { value: "Insecticidas/Medicinas", label: "💊 Insecticidas/Medicinas", icon: "💊", inventoryCategory: "meds", img: "/standard/inventory/medicine.svg" },
  { value: "Líquidos", label: "🧪 Líquidos", icon: "🧪", inventoryCategory: "liquids", img: "/standard/inventory/liquid.svg" },
  { value: "Medición", label: "📏 Medición", icon: "📏", img: "/icons/common/pencil.svg" },
  { value: "Nota", label: "📝 Nota", icon: "📝", img: "/icons/common/notes.svg" },
  { value: "Plaga/Enfermedad", label: "🐛 Plaga/Enfermedad", icon: "🐛", inventoryCategory: "meds", img: "/icons/actions/pest.svg" },
  { value: "Polvos", label: "⚪ Polvos", icon: "⚪", inventoryCategory: "powders", img: "/icons/actions/powder.svg" },
  { value: "Riego", label: "💧 Riego", icon: "💧", img: "/icons/actions/water.svg" },
  { value: "Sustrato", label: "🟤 Sustrato", icon: "🟤", inventoryCategory: "substrates", img: "/standard/inventory/substrates.svg" },
  { value: "Trasplante", label: "🌳 Trasplante", icon: "🌳", img: "/standard/pots/plant_pot.svg" },
];

export const LOG_ACTION_ICON_BY_VALUE: Record<string, string> = {
  Fertilizante: "🧴",
  "Insecticidas/Medicinas": "💊",
  Líquidos: "🧪",
  Medición: "📏",
  Nota: "📝",
  "Plaga/Enfermedad": "🐛",
  Polvos: "⚪",
  Riego: "💧",
  Sustrato: "🟤",
  Trasplante: "🌳",
  "Registro Nuevo": "🌱",
};

export const LOG_ACTION_INVENTORY_CATEGORY_BY_VALUE: Record<string, string> = {
  Fertilizante: "fertilizers",
  "Insecticidas/Medicinas": "meds",
  Líquidos: "liquids",
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
  PLANT_LOCATIONS,
  LOG_ACTIONS,
};
