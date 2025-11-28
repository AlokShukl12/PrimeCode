import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import { authMiddleware } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { profileUpdateSchema } from '../validators/profileSchemas.js'

const router = Router()

router.get('/', authMiddleware, getProfile)
router.put('/', authMiddleware, validate(profileUpdateSchema), updateProfile)

export default router
