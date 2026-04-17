import { z } from "zod";

export const wishlistItemSchema = z.object({
  id: z.number(),
  user_id: z.string().uuid().optional(),
  name: z.string().min(1, "El nombre es obligatorio"),
  priority: z.enum(["Baja", "Media", "Alta"]).default("Media"),
  notes: z.string().default(""),
});

export type wishlistItem = z.infer<typeof wishlistItemSchema>;
