import type { Request, Response, NextFunction } from 'express'
import * as AuthService from '../services/auth.service'
import { createNotification, notifyAdmins } from '../services/notification.service'
import { created, ok } from '../utils/response'

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.registerUser(req.body)
    
    // Notify admins
    const registeredUser = result.user
    if (registeredUser) {
      await notifyAdmins({
        actorId: registeredUser.id,
        type: 'system',
        text: `New user registered: ${registeredUser.firstName} ${registeredUser.lastName} (${registeredUser.role})`,
        link: '/admin/users'
      })
    }

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

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id
    const result = await AuthService.getUserById(userId)
    ok(res, result, 'Profile retrieved successfully')
  } catch (err) {
    next(err)
  }
}

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = String((req.user as any)._id)
    const result = await AuthService.changePassword(userId, req.body)
    ok(res, result, 'Password changed successfully')
  } catch (err) {
    next(err)
  }
}

export const toggleFollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = String((req.user as any)._id)
    const targetUserId = req.params.id
    const result = await AuthService.followUser(currentUserId, targetUserId)

    const nowFollowing = (result as any).following?.some((id: any) => String(id) === String(targetUserId))
    if (nowFollowing) {
      const actor = req.user as any
      await createNotification({
        userId: targetUserId,
        actorId: currentUserId,
        type: 'follow',
        text: `${actor.firstName} ${actor.lastName} started following you`,
        link: `profile?id=${currentUserId}`,
      })
    }

    ok(res, result, 'Follow status updated successfully')
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await AuthService.forgotPassword(req.body)
    ok(res, null, 'Password reset email sent successfully')
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await AuthService.resetPassword(req.body)
    ok(res, null, 'Password reset successfully')
  } catch (err) {
    next(err)
  }
}