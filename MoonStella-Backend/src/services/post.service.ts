import * as PostRepository from '../repositories/post.repository'
import { AppError } from '../errors/app.error'
import { CreatePostDto } from '../dtos/post.dto'

export const createPost = async (userId: string, data: CreatePostDto) => {
  return PostRepository.create({
    userId,
    description: data.description,
    category: data.category,
    budget: data.budget,
    price: data.price,
    materials: data.materials,
    images: data.images
  })
}

export const getAllPosts = async () => {
  const posts = await PostRepository.findAll()

  // Attach public review stats (count + average) to each post
  const { Review } = require('../models/review.model')
  const stats = await Review.aggregate([
    { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
    { $unwind: '$order' },
    { $group: { _id: '$order.postId', count: { $sum: 1 }, average: { $avg: '$rating' } } }
  ])
  const statMap = new Map<string, any>(stats.map((s: any) => [String(s._id), s]))

  return posts.map((p: any) => {
    const obj = typeof p.toObject === 'function' ? p.toObject() : p
    const s = statMap.get(String(obj._id))
    obj.reviewStats = {
      count: s ? s.count : 0,
      average: s ? Math.round(s.average * 10) / 10 : 0,
    }
    return obj
  })
}

export const toggleLikePost = async (postId: string, userId: string) => {
  const post = await PostRepository.toggleLike(postId, userId)
  if (!post) throw new AppError('Post not found', 404)
  return post
}

export const deleteUserPost = async (postId: string, userId: string) => {
  const success = await PostRepository.deletePost(postId, userId)
  if (!success) throw new AppError('Post not found or unauthorized to delete', 403)
  return { success: true }
}

export const updateUserPost = async (postId: string, userId: string, data: any) => {
  const post = await PostRepository.updatePost(postId, userId, data)
  if (!post) throw new AppError('Post not found or unauthorized to edit', 403)
  return post
}

export const toggleSavePost = async (postId: string, userId: string) => {
  const post = await PostRepository.findById(postId)
  if (!post) throw new AppError('Post not found', 404)
  const UserRepository = require('../repositories/user.repository')
  return UserRepository.toggleSavePost(userId, postId)
}

export const getSavedPosts = async (userId: string) => {
  const UserRepository = require('../repositories/user.repository')
  const user = await UserRepository.findById(userId)
  if (!user) throw new AppError('User not found', 404)
  return PostRepository.findSavedPosts(user.savedPosts || [])
}
