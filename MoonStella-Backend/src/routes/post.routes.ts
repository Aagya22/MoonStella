import { Router } from 'express'
import { create, getAll, toggleLike, addComment, deletePost } from '../controllers/post.controller'
import { protect } from '../middleware/auth.middleware'
import { createPostDto } from '../dtos/post.dto'
import { validate } from '../middleware/validate.middleware'

const router = Router()

// GET /api/posts - Get all posts (public)
router.get('/', getAll)

// POST /api/posts - Create a new post (protected, buyer only / requireUser)
router.post('/', protect, validate(createPostDto), create)

// PATCH /api/posts/:id/like - Toggle like on a post (protected)
router.patch('/:id/like', protect, toggleLike)

// POST /api/posts/:id/comment - Add comment to a post (protected)
router.post('/:id/comment', protect, addComment)

// DELETE /api/posts/:id - Delete a post (protected)
router.delete('/:id', protect, deletePost)

export default router
