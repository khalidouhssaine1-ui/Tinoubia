import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(30)
    .regex(/^[+()\d\s-]+$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email address"),
  message: z.string().trim().min(5, "Please add a short message").max(2000),
  // Honeypot — must stay empty.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
