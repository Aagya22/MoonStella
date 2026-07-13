import { Router } from 'express'
import { register, login, getMe, updateProfile, logout, checkUnique, getUserProfile, changePassword, toggleFollowUser, forgotPassword, resetPassword } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'
import { registerSchema, loginDto, checkUniqueSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../dtos/auth.dto'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// POST /api/auth/register
// validate(registerSchema) runs first — if body is invalid, controller never runs
router.post('/register', validate(registerSchema), register)

// POST /api/auth/login
router.post('/login', validate(loginDto), login)

// POST /api/auth/check-unique
router.post('/check-unique', validate(checkUniqueSchema), checkUnique)

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

// GET /api/auth/me
// protect runs first — if no valid token, controller never runs
router.get('/me', protect, getMe)
router.patch('/profile', protect, updateProfile)
router.get('/profile/:id', protect, getUserProfile)
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword)
router.post('/follow/:id', protect, toggleFollowUser)
router.post('/logout', protect, logout)

export default router