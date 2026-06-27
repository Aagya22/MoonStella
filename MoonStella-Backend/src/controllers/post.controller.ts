import { Request, Response, NextFunction } from 'express'
import * as PostService from '../services/post.service'

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
