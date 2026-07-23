import { Router } from 'express'
import { create, getAll, toggleLike, deletePost, editPost, toggleSave, getSaved } from '../controllers/post.controller'
import { getPostReviews } from '../controllers/order.controller'
import { protect } from '../middleware/auth.middleware'
import { createPostDto } from '../dtos/post.dto'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// GET /api/posts - Get all posts (public)
router.get('/', getAll)

// GET /api/posts/saved - Get saved posts / wishlist (protected)
router.get('/saved', protect, getSaved)
router.get('/wishlist', protect, getSaved)

// GET /api/posts/:id/reviews - Public reviews for a post
router.get('/:id/reviews', getPostReviews)

// POST /api/posts - Create a new post (protected, buyer only / requireUser)
router.post('/', protect, validate(createPostDto), create)

// PATCH /api/posts/:id/save - Toggle save post (protected)
router.patch('/:id/save', protect, toggleSave)
router.patch('/:id/wishlist', protect, toggleSave)

// PATCH /api/posts/:id/like - Toggle like on a post (protected)
router.patch('/:id/like', protect, toggleLike)

// DELETE /api/posts/:id - Delete a post (protected)
router.delete('/:id', protect, deletePost)

// PATCH /api/posts/:id - Edit a post (protected)
router.patch('/:id', protect, editPost)

export default router
