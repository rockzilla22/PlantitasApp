import { z } from "zod";

export const PropagationStatusSchema = z.enum(["Activo", "Éxito", "Trasplantada", "Fracaso"]);
export type PropagationStatus = z.infer<typeof PropagationStatusSchema>;

export const PropagationMethodSchema = z.enum(["Agua", "Sustrato", "Acodo", "Semilla"]);
export type PropagationMethod = z.infer<typeof PropagationMethodSchema>;

export const PropagationSchema = z.object({
  id: z.number(),
  user_id: z.string().uuid().optional(),
  parentId: z.number().nullable().default(null),
  name: z.string().min(1, "El nombre es obligatorio"),
  method: PropagationMethodSchema.default("Agua"),
  startDate: z.string(), // ISO date YYYY-MM-DD
  status: PropagationStatusSchema.default("Activo"),
  notes: z.string().default(""),
});

export type Propagation = z.infer<typeof PropagationSchema>;
