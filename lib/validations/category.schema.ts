import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "The name must be at least 2 characters.").max(60, "The name must be 60 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(200, "The description must be 200 characters or fewer.")
    .nullish()
    .transform((v) => v || null),
  image_url: z
    .string()
    .trim()
    .url("The photo must be a valid link.")
    .nullish()
    .or(z.literal(""))
    .transform((v) => v || null),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
});

export type CategoryInput = z.input<typeof categorySchema>;
