import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createTask, deleteTask, listTasks, updateTask } from '../controllers/taskController.js'
import { createTaskSchema, updateTaskSchema } from '../validators/taskSchemas.js'

const router = Router()

router.get('/', authMiddleware, listTasks)
router.post('/', authMiddleware, validate(createTaskSchema), createTask)
router.put('/:id', authMiddleware, validate(updateTaskSchema), updateTask)
router.delete('/:id', authMiddleware, deleteTask)

export default router
