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
    .populate('userId', 'firstName lastName avatar role')
    .populate('comments.userId', 'firstName lastName avatar role')
    .sort({ createdAt: -1 })
}

export const findById = async (id: string): Promise<IPost | null> => {
  return Post.findById(id)
    .populate('userId', 'firstName lastName avatar role')
    .populate('comments.userId', 'firstName lastName avatar role')
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
