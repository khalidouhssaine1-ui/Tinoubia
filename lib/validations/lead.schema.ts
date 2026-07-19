import { z } from "zod";

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "negotiating",
  "won",
  "lost",
  "spam",
]);

export const leadUpdateSchema = z.object({
  status: leadStatusSchema.optional(),
  assigned_agent_id: z.string().uuid().nullable().optional(),
});

export const leadNoteSchema = z.object({
  lead_id: z.string().uuid(),
  note: z.string().trim().min(1).max(2000),
});

export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
export type LeadNoteInput = z.infer<typeof leadNoteSchema>;
