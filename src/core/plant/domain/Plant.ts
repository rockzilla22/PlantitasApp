import { z } from "zod";

export const LogActionTypeSchema = z.enum([
  "Riego",
  "Medición",
  "Sustrato",
  "Fertilizante",
  "Polvos",
  "Líquidos",
  "Insecticidas/Medicinas",
  "Trasplante",
  "Poda",
  "Plaga/Enfermedad",
  "Nota",
  "Registro Nuevo",
]);

export type LogActionType = z.infer<typeof LogActionTypeSchema>;

export const PlantLogSchema = z.object({
  id: z.number(),
  date: z.string(), // ISO date YYYY-MM-DD
  actionType: LogActionTypeSchema,
  detail: z.string(),
});

export type PlantLog = z.infer<typeof PlantLogSchema>;

export const PlantSchema = z.object({
  id: z.number(),
  user_id: z.string().uuid().optional(), // For Supabase RLS
  name: z.string().min(1, "El nombre es obligatorio"),
  icon: z.string().default("/icons/environment/plants/generic.svg"),
  type: z.string().default("Planta"),
  subtype: z.string().optional(),
  location: z.string().default("No especificada"),
  light: z.enum(["Baja", "Media", "Alta/Directa"]).default("Media"),
  potType: z.enum(["Autorriego", "Barro", "Plástico", "Terracota"]).default("Plástico"),
  dormancy: z.enum(["Ninguna", "Invierno", "Verano"]).default("Ninguna"),
  lastWateredDate: z.string().optional(),
  logs: z.array(PlantLogSchema).default([]),
  created_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type Plant = z.infer<typeof PlantSchema>;
