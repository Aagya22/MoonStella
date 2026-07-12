import { User, IUser } from '../models/user.model'

export const findByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email })
}

export const findByPhoneNumber = async (phoneNumber: string): Promise<IUser | null> => {
  return User.findOne({ phoneNumber })
}

export const findById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).select('-passwordHash')
}

export const findWithPasswordById = async (id: string): Promise<IUser | null> => {
  return User.findById(id)
}

export const createUser = async (data: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  passwordHash: string
  role: 'buyer' | 'seller' | 'admin'
  isApproved?: boolean
  isSuspended?: boolean
}): Promise<IUser> => {
  return User.create(data)
}

export const updateUserProfile = async (
  id: string,
  data: {
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
    avatar?: string | null
    location?: string | null
    bio?: string | null
    studioName?: string | null
    studioSpecialty?: string | null
    averageResponseTime?: string | null
    onboarded?: boolean
    interests?: string[]
  }
): Promise<IUser | null> => {
  return User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  ).select('-passwordHash')
}

export const toggleSavePost = async (userId: string, postId: string): Promise<string[]> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  if (!user.savedPosts) {
    user.savedPosts = []
  }

  const index = user.savedPosts.findIndex((id) => String(id) === String(postId))
  if (index > -1) {
    user.savedPosts.splice(index, 1)
  } else {
    const mongoose = require('mongoose')
    user.savedPosts.push(new mongoose.Types.ObjectId(postId))
  }

  await user.save()
  return user.savedPosts.map((id) => String(id))
}