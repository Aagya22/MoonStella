import { Router } from 'express'
import { register, login, getMe } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'
import { registerSchema, loginDto } from '../dtos/auth.dto'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// POST /api/auth/register
// validate(registerSchema) runs first — if body is invalid, controller never runs
router.post('/register', validate(registerSchema), register)

// POST /api/auth/login
router.post('/login', validate(loginDto), login)

// GET /api/auth/me
// protect runs first — if no valid token, controller never runs
router.get('/me', protect, getMe)

export default router