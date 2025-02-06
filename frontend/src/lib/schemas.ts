import { z } from 'zod';

export const emailSchema = z.object({
    email: z.string()
    .email("Invalid email address")
    .min(3, "Email is required")
    .max(255, "Email is too long")
    .regex(/^[^\s]+@[^\s]+\.[^\s]+$/,
      "Email must not contain whitespace")
})

export const passwordSchema = z.object({
    password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character")
})

export const usernameSchema = z.object({
    username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain alphanumeric characters")
})

export const finishSignUpSchema = z.object({
    username: usernameSchema.shape.username,
    password: passwordSchema.shape.password
})