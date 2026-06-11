import { Router } from 'express'
import { register, login, getMe, updateProfile } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'
import { registerSchema, loginDto } from '../dtos/auth.dto'
import { validate } from '../middleware/validate.middleware'
import { updateUserProfile } from '../repositories/user.repository'

const router = Router()

// POST /api/auth/register
// validate(registerSchema) runs first — if body is invalid, controller never runs
router.post('/register', validate(registerSchema), register)

// POST /api/auth/login
router.post('/login', validate(loginDto), login)

// GET /api/auth/me
// protect runs first — if no valid token, controller never runs
router.get('/me', protect, getMe)
router.patch('/profile',protect,updateProfile)

export default router