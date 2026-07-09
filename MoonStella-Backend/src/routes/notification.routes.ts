import { Router } from 'express'
import { getMyNotifications, markAllRead, markOneRead, clearAll } from '../controllers/notification.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.use(protect)

// GET /api/notifications - list current user's notifications
router.get('/', getMyNotifications)

// PATCH /api/notifications/read - mark all as read
router.patch('/read', markAllRead)

// PATCH /api/notifications/:id/read - mark one as read
router.patch('/:id/read', markOneRead)

// DELETE /api/notifications - clear all notifications
router.delete('/', clearAll)

export default router
