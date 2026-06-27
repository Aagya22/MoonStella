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
  return PostRepository.findAll()
}

export const toggleLikePost = async (postId: string, userId: string) => {
  const post = await PostRepository.toggleLike(postId, userId)
  if (!post) throw new AppError('Post not found', 404)
  return post
}

export const addCommentToPost = async (postId: string, userId: string, text: string) => {
  if (!text || !text.trim()) throw new AppError('Comment text cannot be empty', 400)
  const post = await PostRepository.addComment(postId, { userId, text })
  if (!post) throw new AppError('Post not found', 404)
  return post
}

export const deleteUserPost = async (postId: string, userId: string) => {
  const success = await PostRepository.deletePost(postId, userId)
  if (!success) throw new AppError('Post not found or unauthorized to delete', 403)
  return { success: true }
}
