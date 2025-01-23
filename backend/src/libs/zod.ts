//https://thecopenhagenbook.com/email-verification
import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Please provide a valid email address')
  .min(3, 'Email must be at least 3 characters')
  .max(255, 'Email cannot exceed 255 characters')
  .regex(
    /^[^\s]+@[^\s]+\.[^\s]+$/,
    'Email must not contain whitespace at start or end'
  )
  .transform((email) => email.toLowerCase().trim());

export type EmailSchema = z.infer<typeof emailSchema>;

export const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain alphanumeric characters');

export type UsernameSchema = z.infer<typeof usernameSchema>;

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[\W_]/, 'Password must contain at least one special character');

export type PasswordSchema = z.infer<typeof passwordSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
