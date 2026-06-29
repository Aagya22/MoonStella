import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AppError } from '../errors/app.error'
import * as UserRepository from '../repositories/user.repository'
import type { IUser } from '../models/user.model'
import type { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from '../dtos/auth.dto'

const signToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '30d' })
}

export const formatUser = (user: IUser) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  avatar: user.avatar,
  location: user.location,
  bio: user.bio,
  studioName: user.studioName,
  studioSpecialty: user.studioSpecialty,
  averageResponseTime: user.averageResponseTime,
  onboarded: user.onboarded,
  interests: user.interests,
  following: user.following || [],
  createdAt: user.createdAt,
})

export const registerUser = async (data: RegisterDto) => {
  const existingEmail = await UserRepository.findByEmail(data.email)
  if (existingEmail) throw new AppError('An account with this email already exists', 409)

  const existingPhone = await UserRepository.findByPhoneNumber(data.phoneNumber)
  if (existingPhone) throw new AppError('An account with this phone number already exists', 409)

  const passwordHash = await bcrypt.hash(data.password, 12)

  const user = await UserRepository.createUser({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    passwordHash,
    role: data.role,
  })

  const token = signToken(String(user._id))
  return { token, user: formatUser(user) }
}

export const loginUser = async (data: LoginDto) => {
  const user = await UserRepository.findByEmail(data.email)
  if (!user) throw new AppError('Invalid email or password', 401)

  const isMatch = await user.comparePassword(data.password)
  if (!isMatch) throw new AppError('Invalid email or password', 401)

  const token = signToken(String(user._id))
  return { token, user: formatUser(user) }
}

export const getCurrentUser = (user: IUser) => formatUser(user)

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileDto
) => {
  const user = await UserRepository.updateUserProfile(userId, data)
  if (!user) throw new AppError('User not found', 404)
  return formatUser(user)
}

export const checkUniqueness = async (email: string, phoneNumber: string) => {
  const existingEmail = await UserRepository.findByEmail(email)
  if (existingEmail) throw new AppError('An account with this email already exists', 409)

  const existingPhone = await UserRepository.findByPhoneNumber(phoneNumber)
  if (existingPhone) throw new AppError('An account with this phone number already exists', 409)

  return { unique: true }
}

export const getUserById = async (userId: string) => {
  const user = await UserRepository.findById(userId)
  if (!user) throw new AppError('User not found', 404)
  
  const { User } = require('../models/user.model')
  const followersCount = await User.countDocuments({ following: userId })
  
  return {
    ...formatUser(user),
    followersCount
  }
}

export const changePassword = async (userId: string, data: ChangePasswordDto) => {
  const user = await UserRepository.findWithPasswordById(userId)
  if (!user) throw new AppError('User not found', 404)

  const isMatch = await user.comparePassword(data.oldPassword)
  if (!isMatch) throw new AppError('Incorrect old password', 401)

  const passwordHash = await bcrypt.hash(data.newPassword, 12)
  user.passwordHash = passwordHash
  await user.save()

  return { success: true }
}

export const followUser = async (currentUserId: string, targetUserId: string) => {
  const { User } = require('../models/user.model')
  const currentUser = await User.findById(currentUserId)
  if (!currentUser) throw new AppError('Current user not found', 404)

  const targetUser = await User.findById(targetUserId)
  if (!targetUser) throw new AppError('Target user not found', 404)

  const isFollowing = currentUser.following.some((id: any) => String(id) === String(targetUserId))
  if (isFollowing) {
    currentUser.following = currentUser.following.filter((id: any) => String(id) !== String(targetUserId))
  } else {
    currentUser.following.push(targetUserId)
  }
  await currentUser.save()

  const followersCount = await User.countDocuments({ following: targetUserId })
  return {
    following: currentUser.following,
    followersCount
  }
}