import type { Response } from 'express'
import { ok, created, badRequest, unauthorized, notFound } from '../../src/utils/response'

const makeRes = () => {
  const res: any = {}
  res.statusCode = 0
  res.body = null
  res.status = jest.fn((code: number) => { res.statusCode = code; return res })
  res.json = jest.fn((body: unknown) => { res.body = body; return res })
  return res as Response & { statusCode: number; body: any }
}

describe('response helpers', () => {
  it('ok() → 200 with success envelope', () => {
    const res = makeRes()
    ok(res, { a: 1 }, 'done')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true, message: 'done', data: { a: 1 } })
  })

  it('created() → 201', () => {
    const res = makeRes()
    created(res, { id: 'x' })
    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual({ id: 'x' })
  })

  it('badRequest() → 400 with null data', () => {
    const res = makeRes()
    badRequest(res, 'bad')
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ success: false, message: 'bad', data: null })
  })

  it('unauthorized() → 401', () => {
    const res = makeRes()
    unauthorized(res)
    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('notFound() → 404', () => {
    const res = makeRes()
    notFound(res)
    expect(res.statusCode).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
