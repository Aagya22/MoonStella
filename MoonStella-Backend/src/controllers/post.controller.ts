import { Request, Response, NextFunction } from 'express'
import * as PostService from '../services/post.service'
import { createNotification } from '../services/notification.service'

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const post = await PostService.createPost(String(userId), req.body)
    res.status(201).json(post)
  } catch (error) {
    next(error)
  }
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await PostService.getAllPosts()
    res.json(posts)
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

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id
    const { id } = req.params
    const { text } = req.body
    const post = await PostService.addCommentToPost(id, String(userId), text)
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
