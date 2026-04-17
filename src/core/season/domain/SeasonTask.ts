import { z } from "zod";

export const SeasonSchema = z.enum(["Primavera", "Verano", "Otoño", "Invierno"]);
export type Season = z.infer<typeof SeasonSchema>;

export const SeasonTaskTypeSchema = z.enum(["Poda", "Siembra", "Trasplante", "Abonado", "Limpieza", "Otro"]);
export type SeasonTaskType = z.infer<typeof SeasonTaskTypeSchema>;

export const SeasonTaskSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  season: SeasonSchema,
  type: SeasonTaskTypeSchema,
  desc: z.string().min(1, "La descripción es obligatoria"),
});

export type SeasonTask = z.infer<typeof SeasonTaskSchema>;
