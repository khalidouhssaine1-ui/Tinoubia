import { z } from "zod";

export const agencyInfoSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30),
  whatsapp: z.string().trim().max(30),
  email: z.string().trim().email(),
  address: z.string().trim().max(300),
  instagram: z.string().trim().max(300).optional().or(z.literal("")),
  facebook: z.string().trim().max(300).optional().or(z.literal("")),
});

export type AgencyInfoInput = z.infer<typeof agencyInfoSchema>;
