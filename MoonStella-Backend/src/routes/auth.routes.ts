import { Router } from 'express'
import { register, login, getMe, updateProfile, logout, checkUnique } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'
import { registerSchema, loginDto, checkUniqueSchema } from '../dtos/auth.dto'
import { validate } from '../middleware/validate.middleware'
import { updateUserProfile } from '../repositories/user.repository'

const router = Router()

// POST /api/auth/register
// validate(registerSchema) runs first — if body is invalid, controller never runs
router.post('/register', validate(registerSchema), register)

// POST /api/auth/login
router.post('/login', validate(loginDto), login)

// POST /api/auth/check-unique
router.post('/check-unique', validate(checkUniqueSchema), checkUnique)

// GET /api/auth/me
// protect runs first — if no valid token, controller never runs
router.get('/me', protect, getMe)
router.patch('/profile',protect,updateProfile)
router.post('/logout', protect, logout)

export default router