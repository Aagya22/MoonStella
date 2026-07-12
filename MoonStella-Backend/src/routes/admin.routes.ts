import { Router } from 'express'
import * as AdminController from '../controllers/admin.controller'
import { protect, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

// Apply authentication and admin authorization middlewares globally to all routes
router.use(protect, requireAdmin)

router.get('/analytics', AdminController.getAnalytics)
router.get('/users', AdminController.getUsers)
router.patch('/users/:id/approve', AdminController.approveArtisan)
router.patch('/users/:id/suspend', AdminController.toggleSuspendUser)

router.get('/orders/disputed', AdminController.getDisputedOrders)
router.patch('/orders/:id/resolve', AdminController.resolveDispute)

router.get('/posts', AdminController.getPosts)
router.delete('/posts/:id', AdminController.deletePost)

export default router
