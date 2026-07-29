import request from 'supertest'
import app from '../../src/app'
import { connectTestDb, clearTestDb, closeTestDb } from '../helpers/db'
import { registerUser } from '../helpers/auth'
import { resetRateLimits } from '../../src/middleware/rate-limit.middleware'
import { User } from '../../src/models/user.model'

beforeAll(connectTestDb)
afterAll(closeTestDb)
beforeEach(async () => {
  await clearTestDb()
  resetRateLimits()
})

const validPayload = {
  firstName: 'Sajjal',
  lastName: 'Paudel',
  email: 'sajjal@example.com',
  phoneNumber: '9811111111',
  password: 'supersecret',
  confirmPassword: 'supersecret',
  role: 'buyer' as const,
}

describe('POST /api/auth/register', () => {
  it('creates a buyer and returns a token (buyers are auto-approved)', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toEqual(expect.any(String))
    expect(res.body.data.user.email).toBe('sajjal@example.com')
    expect(res.body.data.user.role).toBe('buyer')
    expect(res.body.data.user.isApproved).toBe(true)
  })

  it('leaves a seller unapproved on registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'chandra@example.com', phoneNumber: '9822222222', role: 'seller' })
    expect(res.status).toBe(201)
    expect(res.body.data.user.role).toBe('seller')
    expect(res.body.data.user.isApproved).toBe(false)
  })

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validPayload)
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, phoneNumber: '9899999999' })
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('rejects mismatched passwords with 400 (validation)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, confirmPassword: 'different' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await registerUser({ email: 'login@example.com', password: 'supersecret' })
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'supersecret' })
    expect(res.status).toBe(200)
    expect(res.body.data.token).toEqual(expect.any(String))
  })

  it('rejects a wrong password with 401', async () => {
    await registerUser({ email: 'login2@example.com', password: 'supersecret' })
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login2@example.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
  })

  it('rejects an unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'supersecret' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me (protect)', () => {
  it('returns the current user with a valid token', async () => {
    const { token } = await registerUser({ email: 'me@example.com' })
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe('me@example.com')
  })

  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('rejects a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.jwt')
    expect(res.status).toBe(401)
  })

  it('rejects a valid token once the account is suspended', async () => {
    const { token, user } = await registerUser({ email: 'suspended@example.com' })
    await User.findByIdAndUpdate(user.id, { isSuspended: true })
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })
})
