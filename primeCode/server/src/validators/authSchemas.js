import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name should be at least 2 characters').max(60),
  email: z.string().email('Valid email required').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
})

export const loginSchema = z.object({
  email: z.string().email('Valid email required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})
