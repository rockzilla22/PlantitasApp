import { z } from "zod";

export const GlobalNoteSchema = z.object({
  id: z.number(),
  user_id: z.string().uuid().optional(),
  content: z.string().min(1, "La nota no puede estar vacía"),
  created_at: z.string().optional(),
});

export type GlobalNote = z.infer<typeof GlobalNoteSchema>;
