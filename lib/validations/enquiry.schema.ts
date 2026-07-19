import { z } from "zod";

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(30)
    .regex(/^[+()\d\s-]+$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email address"),
  preferredContact: z.enum(["phone", "email", "whatsapp"]),
  visitDate: z.string().optional().or(z.literal("")),
  numPeople: z.coerce.number().int().min(1).max(50).optional(),
  message: z.string().trim().min(5, "Please add a short message").max(2000),
  propertyId: z.string().uuid(),
  propertyTitle: z.string().min(1),
  propertyReference: z.string().min(1),
  propertyUrl: z.string().url(),
  // Honeypot — must stay empty. Real visitors never see or fill this field.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
