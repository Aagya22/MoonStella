import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/app.error'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500

  // Only unexpected (5xx) errors are worth a stack trace; operational ones
  // like a bad login or duplicate email are expected.
  if (statusCode >= 500) {
    console.error(err.stack)
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    data: null,
  })
}
