import { Post, IPost } from '../models/post.model'

export const create = async (data: {
  userId: string
  description: string
  category: string
  budget?: number | null
  price?: string | null
  materials: string[]
  images: string[]
}): Promise<IPost> => {
  return Post.create(data)
}

export const findAll = async (): Promise<IPost[]> => {
  return Post.find()
    .populate('userId', 'firstName lastName avatar role location')
    .populate('comments.userId', 'firstName lastName avatar role location')
    .populate('likes', 'firstName lastName avatar role location')
    .sort({ createdAt: -1 })
}

export const findById = async (id: string): Promise<IPost | null> => {
  return Post.findById(id)
    .populate('userId', 'firstName lastName avatar role location')
    .populate('comments.userId', 'firstName lastName avatar role location')
    .populate('likes', 'firstName lastName avatar role location')
}

export const toggleLike = async (postId: string, userId: string): Promise<IPost | null> => {
  const post = await Post.findById(postId)
  if (!post) return null

  const isLiked = post.likes.some(like => String(like) === String(userId))

  if (!isLiked) {
    post.likes.push(userId as any)
  } else {
    post.likes = post.likes.filter(like => String(like) !== String(userId))
  }

  await post.save()
  return findById(postId)
}

export const addComment = async (postId: string, comment: { userId: string; text: string }): Promise<IPost | null> => {
  const post = await Post.findById(postId)
  if (!post) return null

  post.comments.push({
    userId: comment.userId as any,
    text: comment.text,
    createdAt: new Date()
  })

  await post.save()
  return findById(postId)
}

export const deletePost = async (postId: string, userId: string): Promise<boolean> => {
  const result = await Post.deleteOne({ _id: postId, userId })
  return result.deletedCount > 0
}

export const updatePost = async (postId: string, userId: string, data: any): Promise<IPost | null> => {
  const post = await Post.findOne({ _id: postId, userId })
  if (!post) return null
  if (data.description !== undefined) post.description = data.description
  if (data.category !== undefined) post.category = data.category
  if (data.budget !== undefined) post.budget = data.budget
  if (data.price !== undefined) post.price = data.price
  if (data.materials !== undefined) post.materials = data.materials
  await post.save()
  return findById(postId)
}

export const findSavedPosts = async (postIds: any[]): Promise<IPost[]> => {
  return Post.find({ _id: { $in: postIds } })
    .populate('userId', 'firstName lastName avatar role location')
    .populate('comments.userId', 'firstName lastName avatar role location')
    .populate('likes', 'firstName lastName avatar role location')
    .sort({ createdAt: -1 })
}
