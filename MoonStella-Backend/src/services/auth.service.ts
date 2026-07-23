import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AppError } from '../errors/app.error'
import * as UserRepository from '../repositories/user.repository'
import { sendEmail } from '../utils/email'
import type { IUser } from '../models/user.model'
import type { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../dtos/auth.dto'

const signToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '30d' })
}

// Backdated a second: `iat` is whole seconds and can tie with this stamp
const passwordChangedStamp = (): Date => new Date(Date.now() - 1000)

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
  isApproved: user.isApproved,
  isSuspended: user.isSuspended,
  following: user.following || [],
  savedPosts: user.savedPosts || [],
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
    isApproved: data.role === 'seller' ? false : true,
    isSuspended: false,
  })

  const token = signToken(String(user._id))
  return { token, user: formatUser(user) }
}

export const loginUser = async (data: LoginDto) => {
  const user = await UserRepository.findByEmail(data.email)
  if (!user) throw new AppError('Invalid email or password', 401)

  if (user.isSuspended) {
    throw new AppError('Your account has been suspended by the administrator. Please contact support.', 403)
  }

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
  
  const mongoose = require('mongoose')
  const { User } = require('../models/user.model')
  const userObjectId = new mongoose.Types.ObjectId(userId)
  const followersCount = await User.countDocuments({ following: userObjectId })
  
  const followersList = await User.find({ following: userObjectId }).select('_id firstName lastName avatar role location')
  const followingList = await User.find({ _id: { $in: user.following || [] } }).select('_id firstName lastName avatar role location')

  return {
    ...formatUser(user),
    followersCount,
    followersList: followersList.map((u: any) => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      avatar: u.avatar,
      role: u.role,
      location: u.location
    })),
    followingList: followingList.map((u: any) => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      avatar: u.avatar,
      role: u.role,
      location: u.location
    }))
  }
}

export const changePassword = async (userId: string, data: ChangePasswordDto) => {
  const user = await UserRepository.findWithPasswordById(userId)
  if (!user) throw new AppError('User not found', 404)

  const isMatch = await user.comparePassword(data.oldPassword)
  if (!isMatch) throw new AppError('Incorrect old password', 401)

  const passwordHash = await bcrypt.hash(data.newPassword, 12)
  user.passwordHash = passwordHash
  user.passwordChangedAt = passwordChangedStamp()
  await user.save()

  // The caller's own token is now rejected too, so hand back a fresh one
  return { success: true, token: signToken(String(user._id)) }
}

export const followUser = async (currentUserId: string, targetUserId: string) => {
  const mongoose = require('mongoose')
  const { User } = require('../models/user.model')
  const currentUser = await User.findById(currentUserId)
  if (!currentUser) throw new AppError('Current user not found', 404)

  const targetUser = await User.findById(targetUserId)
  if (!targetUser) throw new AppError('Target user not found', 404)

  const targetObjectId = new mongoose.Types.ObjectId(targetUserId)
  const isFollowing = currentUser.following.some((id: any) => String(id) === String(targetUserId))
  if (isFollowing) {
    currentUser.following = currentUser.following.filter((id: any) => String(id) !== String(targetUserId))
  } else {
    currentUser.following.push(targetObjectId as any)
  }
  await currentUser.save()

  const followersCount = await User.countDocuments({ following: targetObjectId })
  const followersList = await User.find({ following: targetObjectId }).select('_id firstName lastName avatar role location')

  return {
    following: currentUser.following,
    followersCount,
    followersList: followersList.map((u: any) => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      avatar: u.avatar,
      role: u.role,
      location: u.location
    }))
  }
}

export const forgotPassword = async (data: ForgotPasswordDto): Promise<void> => {
  const user = await UserRepository.findByEmail(data.email)
  // Stay quiet on unknown addresses so registered emails can't be probed
  if (!user) return

  // Generate short-lived reset token (1 hour)
  const token = jwt.sign(
    { id: user._id, type: 'reset' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`

  const html = `
    <div style="font-family: 'Playfair Display', 'Georgia', serif; background-color: #FAF8F5; padding: 40px 20px; color: #1a1a1a; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid rgba(95, 48, 65, 0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #5F3041; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: 0.05em;">MoonStella</h1>
        <p style="font-family: 'Montserrat', 'Helvetica', sans-serif; font-size: 9px; color: #8C8C8C; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 5px;">Exquisite Artistry, Defined by You</p>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(95, 48, 65, 0.03);">
        <h2 style="font-size: 20px; color: #1a1a1a; margin-top: 0; margin-bottom: 20px; font-weight: 600; text-align: center;">Reset Your Password</h2>
        <p style="font-family: 'Montserrat', 'Helvetica', sans-serif; font-size: 13px; line-height: 1.6; color: #4A4A4A; margin-bottom: 30px;">
          Hello ${user.firstName},<br/><br/>
          We received a request to reset the password for your MoonStella account. Please click the button below to choose a new password. This link is valid for 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${resetLink}" style="display: inline-block; background-color: #5F3041; color: #E9D7C3; font-family: 'Montserrat', 'Helvetica', sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; padding: 16px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(95, 48, 65, 0.2);">Reset Password</a>
        </div>
        <p style="font-family: 'Montserrat', 'Helvetica', sans-serif; font-size: 11px; line-height: 1.6; color: #8C8C8C; text-align: center;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; font-family: 'Montserrat', 'Helvetica', sans-serif; font-size: 9px; color: #8C8C8C;">
        <p>&copy; ${new Date().getFullYear()} MoonStella. All rights reserved.</p>
      </div>
    </div>
  `

  await sendEmail(user.email, 'Reset your MoonStella Password', html)
}

export const resetPassword = async (data: ResetPasswordDto): Promise<void> => {
  let decoded: any
  try {
    decoded = jwt.verify(data.token, env.JWT_SECRET)
  } catch (err) {
    throw new AppError('The password reset link is invalid or has expired', 400)
  }

  if (!decoded || decoded.type !== 'reset') {
    throw new AppError('The password reset link is invalid or has expired', 400)
  }

  const user = await UserRepository.findWithPasswordById(decoded.id)
  if (!user) {
    throw new AppError('The password reset link is invalid or has expired', 400)
  }

  // One use only: the token's iat now falls behind passwordChangedAt
  if (user.passwordChangedAt && decoded.iat * 1000 < new Date(user.passwordChangedAt).getTime()) {
    throw new AppError('The password reset link is invalid or has expired', 400)
  }

  const passwordHash = await bcrypt.hash(data.password, 12)
  user.passwordHash = passwordHash
  user.passwordChangedAt = passwordChangedStamp()
  await user.save()
}