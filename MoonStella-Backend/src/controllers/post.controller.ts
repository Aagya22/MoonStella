import { Request, Response, NextFunction } from 'express'
import * as PostService from '../services/post.service'
import { createNotification } from '../services/notification.service'
import { io } from '../server'
import { ok } from '../utils/response'

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const post = await PostService.createPost(String(userId), req.body)

    // Push to open feeds instead of polling
    io.emit('post:new', post)

    res.status(201).json(post)
  } catch (error) {
    next(error)
  }
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user
    const q = req.query

    const page = Math.max(parseInt(q.page as string) || 1, 1)
    const limit = Math.min(Math.max(parseInt(q.limit as string) || 8, 1), 100)
    const authorRole =
      q.authorRole === 'seller' || q.authorRole === 'buyer' ? q.authorRole : undefined

    const result = await PostService.getFeed({
      page,
      limit,
      sort: q.sort === 'trending' ? 'trending' : 'latest',
      authorRole,
      authorId: (q.authorId as string) || undefined,
      material: (q.material as string) || undefined,
      category: (q.category as string) || undefined,
      // An empty following list is an answer, not a missing filter
      authorIds: q.following === 'true' ? (user.following || []).map(String) : undefined,
      excludeAuthorId: q.excludeSelf === 'true' ? String(user._id) : undefined,
    })

    ok(res, result)
  } catch (error) {
    next(error)
  }
}

export const getSuggestedAuthors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user
    const role = req.query.role === 'buyer' ? 'buyer' : 'seller'
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 6, 1), 20)

    const authors = await PostService.getSuggestedAuthors({
      role,
      excludeAuthorId: String(user._id),
      limit,
    })

    ok(res, authors)
  } catch (error) {
    next(error)
  }
}

export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const { id } = req.params
    const post = await PostService.toggleLikePost(id, String(userId))

    const ownerId = (post as any).userId?._id || (post as any).userId
    const nowLiked = (post as any).likes?.some((l: any) => String(l._id || l) === String(userId))
    if (nowLiked) {
      const actor = (req as any).user
      await createNotification({
        userId: ownerId,
        actorId: userId,
        type: 'like',
        text: `${actor.firstName} ${actor.lastName} liked your post`,
        link: 'feed',
      })
    }

    res.json(post)
  } catch (error) {
    next(error)
  }
}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const { id } = req.params
    const result = await PostService.deleteUserPost(id, String(userId))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const editPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const { id } = req.params
    const post = await PostService.updateUserPost(id, String(userId), req.body)
    res.json(post)
  } catch (error) {
    next(error)
  }
}

export const toggleSave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const { id } = req.params
    const savedPosts = await PostService.toggleSavePost(id, String(userId))
    res.json({ success: true, savedPosts })
  } catch (error) {
    next(error)
  }
}

export const getSaved = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const posts = await PostService.getSavedPosts(String(userId))
    res.json(posts)
  } catch (error) {
    next(error)
  }
}
