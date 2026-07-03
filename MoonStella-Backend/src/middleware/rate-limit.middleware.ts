import type { Request, Response, NextFunction } from 'express'

const ipCache = new Map<string, { count: number; resetTime: number }>()

export const rateLimitChat = (req: Request, res: Response, next: NextFunction): void => {
  const key = (req as any).user?._id ? String((req as any).user._id) : (req.ip || req.socket.remoteAddress || 'unknown')
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 30 // 30 messages max per minute

  const record = ipCache.get(key)
  if (!record || now > record.resetTime) {
    ipCache.set(key, { count: 1, resetTime: now + windowMs })
    next()
    return
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      success: false,
      message: 'Too many messages sent. Please wait a minute before sending another message.',
      data: null
    })
    return
  }

  record.count++
  next()
}
