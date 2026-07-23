import * as PostRepository from '../repositories/post.repository'
import { FeedQuery } from '../repositories/post.repository'
import { AppError } from '../errors/app.error'
import { CreatePostDto } from '../dtos/post.dto'

export const createPost = async (userId: string, data: CreatePostDto) => {
  const post = await PostRepository.create({
    userId,
    description: data.description,
    category: data.category,
    budget: data.budget,
    price: data.price,
    materials: data.materials,
    images: data.images
  })
  // Populated so the feed can render it without a second call
  return PostRepository.findById(String(post._id))
}

// Scoped to the ids on screen, not the whole collection
const attachReviewStats = async (posts: any[]) => {
  if (!posts.length) return posts

  const { Review } = require('../models/review.model')
  const ids = posts.map((p) => p._id)
  const stats = await Review.aggregate([
    { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
    { $unwind: '$order' },
    { $match: { 'order.postId': { $in: ids } } },
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

export const getFeed = async (query: FeedQuery) => {
  const { docs, totalDocs } = await PostRepository.findFeed(query)
  const withStats = await attachReviewStats(docs)

  return {
    docs: withStats,
    page: query.page,
    limit: query.limit,
    totalDocs,
    totalPages: Math.ceil(totalDocs / query.limit),
    hasMore: query.page * query.limit < totalDocs,
  }
}

export const getSuggestedAuthors = async (opts: {
  role: 'buyer' | 'seller'
  excludeAuthorId: string
  limit: number
}) => {
  return PostRepository.findSuggestedAuthors(opts)
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
