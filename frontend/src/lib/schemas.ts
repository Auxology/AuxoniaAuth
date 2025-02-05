import { z } from 'zod';

export const emailSchema = z.object({
    email: z.string()
    .email("Invalid email address")
    .min(3, "Email is required")
    .max(255, "Email is too long")
    .regex(/^[^\s]+@[^\s]+\.[^\s]+$/,
      "Email must not contain whitespace")
})