import type { Request, Response } from 'express'
import { createRateLimit } from '../../src/middleware/rate-limit.middleware'
import { describe } from 'node:test'

// Minimal Express req/res doubles
const makeReq = (ip = '1.2.3.4') => ({ ip, socket: {}, headers: {} }) as unknown as Request

const makeRes = () => {
  const res: any = {}
  res.statusCode = 200
  res.body = null
  res.status = jest.fn((code: number) => { res.statusCode = code; return res })
  res.json = jest.fn((body: unknown) => { res.body = body; return res })
  return res as Response & { statusCode: number; body: any }
}

describe('createRateLimit', () => {
  it('allows requests up to the max, then blocks with 429', () => {
    const limiter = createRateLimit({ scope: 'unit-a', windowMs: 60000, max: 3, message: 'slow down' })
    const next = jest.fn()

    for (let i = 0; i < 3; i++) {
      const res = makeRes()
      limiter(makeReq(), res, next)
    }
    expect(next).toHaveBeenCalledTimes(3)

    const blocked = makeRes()
    limiter(makeReq(), blocked, next)
    expect(blocked.statusCode).toBe(429)
    expect(blocked.body).toEqual({ success: false, message: 'slow down', data: null })
    expect(next).toHaveBeenCalledTimes(3) // not called again
  })

  it('keeps a separate counter per caller IP', () => {
    const limiter = createRateLimit({ scope: 'unit-b', windowMs: 60000, max: 1, message: 'x' })
    const next = jest.fn()

    const first = makeRes()
    limiter(makeReq('10.0.0.1'), first, next)
    expect(first.statusCode).toBe(200)

    const other = makeRes()
    limiter(makeReq('10.0.0.2'), other, next)
    expect(other.statusCode).toBe(200) // different IP, own bucket
    expect(next).toHaveBeenCalledTimes(2)
  })

  it('resets once the window has elapsed', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const limiter = createRateLimit({ scope: 'unit-c', windowMs: 1000, max: 1, message: 'x' })
    const next = jest.fn()

    const first = makeRes()
    limiter(makeReq('7.7.7.7'), first, next)
    expect(first.statusCode).toBe(200)

    const blocked = makeRes()
    limiter(makeReq('7.7.7.7'), blocked, next)
    expect(blocked.statusCode).toBe(429)

    jest.advanceTimersByTime(1001)
    const afterWindow = makeRes()
    limiter(makeReq('7.7.7.7'), afterWindow, next)
    expect(afterWindow.statusCode).toBe(200)

    jest.useRealTimers()
  })
})
