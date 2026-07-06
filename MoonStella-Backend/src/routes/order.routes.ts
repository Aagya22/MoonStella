import { Router } from 'express'
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  acceptOrder,
  updateOrderProgress,
  completeOrder,
  cancelOrder,
  confirmReceipt
} from '../controllers/order.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// All order endpoints are protected by authentication middleware
router.use(protect)

// POST /api/orders - Place a new bespoke brief order
router.post('/', createOrder)

// GET /api/orders/buyer - Get buyer's orders
router.get('/buyer', getBuyerOrders)

// GET /api/orders/seller - Get seller's orders
router.get('/seller', getSellerOrders)

// PATCH /api/orders/:id/accept - Accept commission request (Artisan only)
router.patch('/:id/accept', acceptOrder)

// PATCH /api/orders/:id/progress - Post bench progress timeline update
router.patch('/:id/progress', updateOrderProgress)

// PATCH /api/orders/:id/complete - Mark commission order completed
router.patch('/:id/complete', completeOrder)

// PATCH /api/orders/:id/cancel - Cancel order (Buyer/Seller)
router.patch('/:id/cancel', cancelOrder)

// PATCH /api/orders/:id/confirm-receipt - Confirm delivery receipt (Buyer only)
router.patch('/:id/confirm-receipt', confirmReceipt)

export default router
