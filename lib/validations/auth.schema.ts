import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const userInviteSchema = z.object({
  email: z.string().trim().email(),
  full_name: z.string().trim().min(2).max(120),
  role: z.enum(["super_admin", "admin", "agent", "editor"]),
});

export type UserInviteInput = z.infer<typeof userInviteSchema>;
