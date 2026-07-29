import { Router } from 'express'
import { register, login, getMe, updateProfile, checkUnique, getUserProfile, changePassword, toggleFollowUser, forgotPassword, resetPassword } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'
import { registerSchema, loginDto, checkUniqueSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../dtos/auth.dto'
import { validate } from '../middleware/validate.middleware'
import { rateLimitAuth, rateLimitPasswordReset } from '../middleware/rate-limit.middleware'

const router = Router()

// POST /api/auth/register
// validate(registerSchema) runs first — if body is invalid, controller never runs
router.post('/register', rateLimitAuth, validate(registerSchema), register)

// POST /api/auth/login
router.post('/login', rateLimitAuth, validate(loginDto), login)

// POST /api/auth/check-unique
router.post('/check-unique', rateLimitAuth, validate(checkUniqueSchema), checkUnique)

// POST /api/auth/forgot-password
router.post('/forgot-password', rateLimitPasswordReset, validate(forgotPasswordSchema), forgotPassword)

// POST /api/auth/reset-password
router.post('/reset-password', rateLimitPasswordReset, validate(resetPasswordSchema), resetPassword)

// GET /api/auth/me
// protect runs first — if no valid token, controller never runs
router.get('/me', protect, getMe)
router.patch('/profile', protect, updateProfile)
router.get('/profile/:id', protect, getUserProfile)
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword)
router.post('/follow/:id', protect, toggleFollowUser)

export default router