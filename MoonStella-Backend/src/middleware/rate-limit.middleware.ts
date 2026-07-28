import type { Request, Response, NextFunction } from 'express'

const buckets = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number
  max: number
  message: string
  // Namespace so two limiters never share a counter
  scope: string
}

// Clears every counter. Exposed for tests so limits don't leak between cases.
export const resetRateLimits = (): void => {
  buckets.clear()
}

export const createRateLimit = ({ windowMs, max, message, scope }: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const caller = (req as any).user?._id
      ? String((req as any).user._id)
      : (req.ip || req.socket.remoteAddress || 'unknown')
    const key = `${scope}:${caller}`
    const now = Date.now()

    const record = buckets.get(key)
    if (!record || now > record.resetTime) {
      buckets.set(key, { count: 1, resetTime: now + windowMs })
      next()
      return
    }

    if (record.count >= max) {
      res.status(429).json({ success: false, message, data: null })
      return
    }

    record.count++
    next()
  }
}

export const rateLimitChat = createRateLimit({
  scope: 'chat',
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many messages sent. Please wait a minute before sending another message.',
})

// Keyed by IP, since there is no req.user yet on credential endpoints
export const rateLimitAuth = createRateLimit({
  scope: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts. Please wait a few minutes and try again.',
})

// Tighter, since sending the mail is the expensive part
export const rateLimitPasswordReset = createRateLimit({
  scope: 'password-reset',
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please wait an hour and try again.',
})
