import mongoose from 'mongoose'
import { Post, IPost } from '../models/post.model'

const AUTHOR_FIELDS = 'firstName lastName avatar role location'

export interface FeedQuery {
  page: number
  limit: number
  sort: 'latest' | 'trending'
  authorRole?: 'buyer' | 'seller'
  authorId?: string
  authorIds?: string[]
  excludeAuthorId?: string
  material?: string
  category?: string
}

// Drop unparseable ids from query strings
const toObjectIds = (ids: string[]) =>
  ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id))

const toObjectId = (id: string) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null

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

export const findFeed = async (q: FeedQuery): Promise<{ docs: any[]; totalDocs: number }> => {
  const match: Record<string, any> = {}
  const authorConds: any[] = []

  if (q.authorId) authorConds.push({ userId: toObjectId(q.authorId) })
  if (q.authorIds) authorConds.push({ userId: { $in: toObjectIds(q.authorIds) } })
  if (q.excludeAuthorId) authorConds.push({ userId: { $ne: toObjectId(q.excludeAuthorId) } })
  if (authorConds.length) match.$and = authorConds
  if (q.material) match.materials = q.material
  if (q.category) match.category = q.category

  // Joined to drop suspended authors and filter on real role
  const authorMatch: Record<string, any> = { 'author.isSuspended': { $ne: true } }
  if (q.authorRole) authorMatch['author.role'] = q.authorRole

  const now = new Date()
  const ageHours = { $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 60 * 60] }

  const [result] = await Post.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'author' } },
    { $unwind: '$author' },
    { $match: authorMatch },
    {
      $addFields: {
        likeCount: { $size: { $ifNull: ['$likes', []] } },
        // Gravity: likes lift, age pulls down
        score: {
          $divide: [
            { $add: [{ $multiply: [{ $size: { $ifNull: ['$likes', []] } }, 2] }, 1] },
            { $pow: [{ $add: [ageHours, 2] }, 0.6] },
          ],
        },
      },
    },
    { $project: { author: 0 } },
    { $sort: q.sort === 'trending' ? { score: -1, createdAt: -1 } : { createdAt: -1, _id: -1 } },
    {
      $facet: {
        docs: [{ $skip: (q.page - 1) * q.limit }, { $limit: q.limit }],
        meta: [{ $count: 'totalDocs' }],
      },
    },
  ])

  const docs = result?.docs || []
  await Post.populate(docs, [
    { path: 'userId', select: AUTHOR_FIELDS },
    { path: 'likes', select: AUTHOR_FIELDS },
  ])

  return { docs, totalDocs: result?.meta?.[0]?.totalDocs || 0 }
}

// Recent authors for the sidebar
export const findSuggestedAuthors = async (opts: {
  role: 'buyer' | 'seller'
  excludeAuthorId: string
  limit: number
}): Promise<any[]> => {
  return Post.aggregate([
    { $match: { userId: { $ne: toObjectId(opts.excludeAuthorId) } as any } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'author' } },
    { $unwind: '$author' },
    { $match: { 'author.role': opts.role, 'author.isSuspended': { $ne: true } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$author._id',
        firstName: { $first: '$author.firstName' },
        lastName: { $first: '$author.lastName' },
        avatar: { $first: '$author.avatar' },
        role: { $first: '$author.role' },
        location: { $first: '$author.location' },
        lastPostAt: { $first: '$createdAt' },
        postCount: { $sum: 1 },
      },
    },
    { $sort: { lastPostAt: -1 } },
    { $limit: opts.limit },
  ])
}

export const findById = async (id: string): Promise<IPost | null> => {
  return Post.findById(id)
    .populate('userId', 'firstName lastName avatar role location')
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
    .populate('likes', 'firstName lastName avatar role location')
    .sort({ createdAt: -1 })
}
