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
    // Pass error to the global error handler middleware
    next(err)
  }
}

// POST /api/auth/login
// Body is already validated by loginDto before this runs
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