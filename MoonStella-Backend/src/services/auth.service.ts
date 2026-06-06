import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AppError } from '../errors/app.error'
import * as UserRepository from '../repositories/user.repository'
import type { IUser } from '../models/user.model'
import type { RegisterDto, LoginDto } from '../dtos/auth.dto'



const signToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '30d' })
}

export const formatUser = (user: IUser) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phoneNumber,
  role: user.role,
  avatar: user.avatar,
  location: user.location,
  createdAt: user.createdAt,
})


export const registerUser = async (data: RegisterDto) => {
  // Check if email is already taken
  const existing = await UserRepository.findByEmail(data.email)
  if (existing) {
    // 409 Conflict — resource already exists
    throw new AppError('An account with this email already exists', 409)
  }

  // Hash the password — never store plain text
  const passwordHash = await bcrypt.hash(data.password, 12)

  // Create the user via repository
  const user = await UserRepository.createUser({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    passwordHash,
    role: data.role,
  })

  // Sign a JWT for immediate login after registration
  const token = signToken(String(user._id))

  return {
    token,
    user: formatUser(user),
  }
}

//  login

export const loginUser = async (data: LoginDto) => {

  const user = await UserRepository.findByEmail(data.email)

  // Use the same error for wrong email and wrong password
  // Never tell the client which one is wrong
  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const isMatch = await user.comparePassword(data.password)
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401)
  }

  const token = signToken(String(user._id))

  return {
    token,
    user: formatUser(user),
  }
}

export const getCurrentUser = (user: IUser) => {
  return formatUser(user)
}