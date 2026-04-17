import { z } from "zod";

export const InventoryCategorySchema = z.enum([
  "substrates",
  "fertilizers",
  "powders",
  "liquids",
  "meds",
  "others",
]);
export type InventoryCategory = z.infer<typeof InventoryCategorySchema>;

export const InventoryItemSchema = z.object({
  id: z.string().uuid().optional(), // Using UUID for database records
  user_id: z.string().uuid().optional(),
  category: InventoryCategorySchema,
  name: z.string().min(1, "El nombre es obligatorio"),
  qty: z.number().min(0, "La cantidad no puede ser negativa"),
  unit: z.enum(["L", "Kg", "g", "u.", "Paq."]).default("u."),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
