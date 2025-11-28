import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  description: z.string().max(400).optional().default(''),
  status: z.enum(['todo', 'in-progress', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  tags: z.array(z.string().min(1)).optional().default([]),
})

export const updateTaskSchema = createTaskSchema.partial()
