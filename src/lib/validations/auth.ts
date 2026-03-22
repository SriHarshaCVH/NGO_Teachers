import { z } from "zod";

export const userRoleSchema = z.enum(["NGO", "VOLUNTEER"]);

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: userRoleSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
