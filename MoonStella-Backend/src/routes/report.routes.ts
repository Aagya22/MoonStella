import { Router } from 'express'
import * as ReportController from '../controllers/report.controller'
import { protect, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

// Public report submission for logged-in users
router.post('/', protect, ReportController.createReport)

// Admin controls
router.get('/admin', protect, requireAdmin, ReportController.getReports)
router.patch('/admin/:id/resolve', protect, requireAdmin, ReportController.resolveReport)

export default router
