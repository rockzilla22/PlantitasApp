export type Option = { value: string; label: string; img?: string };
export type LogActionOption = Option & {
  icon: string;
  inventoryCategory?: string;
};

export const PLANT_TYPES: Option[] = [
  { value: "Alocasia", label: "Alocasia", img: "/icons/environment/plants/alocasia.svg" },
  { value: "Arbusto", label: "Árbol / Arbusto", img: "/icons/environment/plants/shrub.svg" },
  { value: "Aromática", label: "Aromática", img: "/icons/environment/plants/aromatic.svg" },
  { value: "Cactus", label: "Cactus / Suculenta", img: "/icons/environment/plants/cactus.svg" },
  { value: "Carnívora", label: "Carnívora", img: "/icons/environment/plants/carnivorous.svg" },
  { value: "Flor", label: "Flor", img: "/icons/environment/plants/flower.svg" },
  { value: "Frutal", label: "Frutal", img: "/icons/environment/plants/fruits.svg" },
  { value: "Hierba", label: "Hierba", img: "/icons/environment/plants/aromatic.svg" },
  { value: "Monstera", label: "Monstera", img: "/icons/environment/plants/alocasia.svg" },
  { value: "Philodendron", label: "Philodendron", img: "/icons/environment/plants/alocasia.svg" },
  { value: "Planta", label: "Planta (Genérica)", img: "/icons/environment/plants/alocasia.svg" },
  { value: "Syngonium", label: "Syngonium", img: "/icons/environment/plants/alocasia.svg" },
  { value: "Trébol", label: "Trébol", img: "/icons/environment/plants/clover.svg" },
  { value: "CUSTOM", label: "Otra...", img: "/icons/common/stars.svg" },
];

export const LIGHT_LEVELS: Option[] = [
  { value: "Alta/Directa", label: "Alta/Directa", img: "/icons/environment/sun.svg" },
  { value: "Alta/Indirecta", label: "Alta/Indirecta", img: "/icons/environment/lightLevels/cloud_sun_high.svg" },
  { value: "Baja", label: "Baja", img: "/icons/environment/lightLevels/cloud.svg" },
  { value: "Media", label: "Media", img: "/icons/environment/lightLevels/cloud_sun.svg" },
];

export const POT_TYPES: Option[] = [
  { value: "Autorriego", label: "Autorriego", img: "/icons/environment/pots/self_watering.svg" },
  { value: "Barro", label: "Barro", img: "/icons/environment/pots/terra_pot.svg" },
  { value: "Orquidea", label: "Orquidea", img: "/icons/environment/pots/orchid_pot.svg" },
  { value: "Plástico", label: "Plástico", img: "/icons/environment/pots/plastic_pot.svg" },
  { value: "Terracota", label: "Terracota", img: "/icons/environment/pots/terra_pot.svg" },
];

export const DORMANCIES: Option[] = [
  { value: "Invierno", label: "Invierno", img: "/icons/environment/summerStations/4_winter.svg" },
  { value: "Ninguna", label: "Ninguna", img: "/icons/common/nothing.svg" },
  { value: "Verano", label: "Verano", img: "/icons/environment/summerStations/2_summer.svg" },
];

export const PROP_METHODS: Option[] = [
  { value: "Acodo", label: "Acodo", img: "/icons/common/layering.svg" },
  { value: "Agua", label: "Agua", img: "/icons/environment/inventory/water.svg" },
  { value: "Semilla", label: "Semilla", img: "/icons/common/propagacion_Semilla.svg" },
  { value: "Sustrato", label: "Sustrato", img: "/icons/environment/inventory/substrates.svg" },
];

export const WISH_PRIORITIES: Option[] = [
  { value: "Alta", label: "Alta", img: "/icons/common/fail.svg" },
  { value: "Baja", label: "Baja", img: "/icons/common/success.svg" },
  { value: "Media", label: "Media", img: "/icons/common/sand_timer.svg" },
];

export const SEASON_TASK_TYPES: Option[] = [
  { value: "Abonado", label: "Abonado", img: "/icons/environment/inventory/fertilizer.svg" },
  { value: "Limpieza", label: "Limpieza", img: "/icons/actions/dead_plant.svg" },
  { value: "Poda", label: "Poda", img: "/icons/common/pencil.svg" },
  { value: "Siembra", label: "Siembra", img: "/icons/common/propagacion_Semilla.svg" },
  { value: "Trasplante", label: "Trasplante", img: "/icons/environment/pots/plant_pot.svg" },
  { value: "Otro", label: "Otro", img: "/icons/common/notes.svg" },
];

export const INVENTORY_CATEGORIES: Option[] = [
  { value: "fertilizers", label: "Fertilizantes", img: "/icons/environment/inventory/fertilizer.svg" },
  { value: "meds", label: "Insecticidas/Medicinas", img: "/icons/environment/inventory/medicine.svg" },
  { value: "liquids", label: "Líquidos", img: "/icons/environment/inventory/liquid.svg" },
  { value: "powders", label: "Polvos", img: "/icons/environment/inventory/powder.svg" },
  { value: "substrates", label: "Sustratos", img: "/icons/environment/inventory/substrates.svg" },
  { value: "others", label: "Otros", img: "/icons/common/box.svg" },
];

export const INVENTORY_UNITS: Option[] = [
  { value: "g", label: "g (Gramos)" },
  { value: "Kg", label: "Kg (Kilos)" },
  { value: "L", label: "L (Litros)" },
  { value: "Paq.", label: "Paq. (Paquetes)" },
  { value: "u.", label: "u. (Unidades)" },
];

export const PLANT_LOCATIONS: Option[] = [
  { value: "Balcón", label: "Balcón", img: "/icons/environment/location/balcon.svg" },
  { value: "Baño", label: "Baño", img: "/icons/environment/location/bathroom.svg" },
  { value: "Cocina", label: "Cocina", img: "/icons/environment/location/kitchen.svg" },
  { value: "Comedor", label: "Comedor", img: "/icons/environment/location/dining-room.svg" },
  { value: "Entrada", label: "Entrada", img: "/icons/environment/location/entrance.svg" },
  { value: "Estudio", label: "Estudio", img: "/icons/environment/location/study.svg" },
  { value: "Jardín", label: "Jardín", img: "/icons/environment/location/garden.svg" },
  { value: "Lavanderia", label: "Lavandería", img: "/icons/environment/location/laundry.svg" },
  { value: "Oficina", label: "Oficina", img: "/icons/environment/location/office.svg" },
  { value: "Patio", label: "Patio", img: "/icons/environment/location/patio.svg" },
  { value: "Recámara", label: "Recámara", img: "/icons/environment/location/bedroom.svg" },
  { value: "Sala", label: "Sala", img: "/icons/environment/location/living-room.svg" },
  { value: "Techo", label: "Techo / Azotea", img: "/icons/environment/location/azotea.svg" },
  { value: "Otros", label: "Otra", img: "/icons/environment/location/other.svg" },
];

export const LOG_ACTIONS: LogActionOption[] = [
  { value: "Fertilizante", label: "Fertilizante", icon: "", inventoryCategory: "fertilizers", img: "/icons/environment/inventory/fertilizer.svg" },
  {
    value: "Insecticidas/Medicinas",
    label: "Insecticidas/Medicinas",
    icon: "",
    inventoryCategory: "meds",
    img: "/icons/environment/inventory/medicine.svg",
  },
  { value: "Líquidos", label: "Líquidos", icon: "", inventoryCategory: "liquids", img: "/icons/environment/inventory/liquid.svg" },
  { value: "Medición", label: "Medición", icon: "", img: "/icons/common/pencil.svg" },
  { value: "Nota", label: "Nota", icon: "", img: "/icons/common/notes.svg" },
  { value: "Plaga/Enfermedad", label: "Plaga/Enfermedad", icon: "", inventoryCategory: "meds", img: "/icons/actions/pest.svg" },
  { value: "Polvos", label: "Polvos", icon: "", inventoryCategory: "powders", img: "/icons/environment/inventory/powder.svg" },
  { value: "Riego", label: "Riego", icon: "", img: "/icons/environment/inventory/water.svg" },
  { value: "Sustrato", label: "Sustrato", icon: "", inventoryCategory: "substrates", img: "/icons/environment/inventory/substrates.svg" },
  { value: "Trasplante", label: "Trasplante", icon: "", img: "/icons/environment/pots/plant_pot.svg" },
];

export const LOG_ACTION_ICON_BY_VALUE: Record<string, string> = {
  Fertilizante: "",
  "Insecticidas/Medicinas": "",
  Líquidos: "",
  Medición: "",
  Nota: "",
  "Plaga/Enfermedad": "",
  Polvos: "",
  Riego: "",
  Sustrato: "",
  Trasplante: "",
  "Registro Nuevo": "",
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
