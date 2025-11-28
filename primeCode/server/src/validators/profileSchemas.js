import { z } from 'zod'

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(240).optional().default(''),
})
