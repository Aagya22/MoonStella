import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import { createOrGetThread, getThreads, getMessages, sendMessage } from '../controllers/chat.controller'
import { rateLimitChat } from '../middleware/rate-limit.middleware'

const router = Router()

router.post('/threads', protect, createOrGetThread)
router.get('/threads', protect, getThreads)
router.get('/threads/:threadId/messages', protect, getMessages)
router.post('/threads/:threadId/messages', protect, rateLimitChat, sendMessage)

export default router
