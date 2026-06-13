import type { Request, Response, NextFunction } from 'express'
import * as AuthService from '../services/auth.service'
import { created, ok } from '../utils/response'

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.registerUser(req.body)
    created(res, result, 'Account created successfully')
  } catch (err) {
    next(err)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.loginUser(req.body)
    ok(res, result, 'Login successful')
  } catch (err) {
    next(err)
  }
}

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = AuthService.getCurrentUser(req.user as any)
    ok(res, result)
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = String((req.user as any)._id)
    const result = await AuthService.updateUserProfile(userId, req.body)
    ok(res, result, 'Profile updated successfully')
  } catch (err) {
    next(err)
  }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    ok(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

export const checkUnique = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body
    const result = await AuthService.checkUniqueness(email, phoneNumber)
    ok(res, result, 'Email and phone number are unique')
  } catch (err) {
    next(err)
  }
}