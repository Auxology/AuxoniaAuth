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