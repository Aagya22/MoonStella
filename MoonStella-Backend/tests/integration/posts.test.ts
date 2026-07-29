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

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

const createPost = (token: string, body: Record<string, unknown>) =>
  request(app).post('/api/posts').set(auth(token)).send({
    description: 'A bespoke piece',
    category: 'Rings',
    images: ['https://example.com/a.png'],
    ...body,
  })

describe('GET /api/posts (feed)', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/posts')
    expect(res.status).toBe(401)
  })

  it('returns the paginated envelope', async () => {
    const { token } = await registerUser()
    const res = await request(app).get('/api/posts').set(auth(token))
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual(
      expect.objectContaining({
        docs: expect.any(Array),
        page: expect.any(Number),
        totalDocs: expect.any(Number),
        totalPages: expect.any(Number),
        hasMore: expect.any(Boolean),
      })
    )
  })

  it('validates materials against the taxonomy on create', async () => {
    const { token } = await registerUser({ role: 'seller' })
    const bad = await createPost(token, { materials: ['Unobtanium'] })
    expect(bad.status).toBe(400)

    const good = await createPost(token, { materials: ['18K yellow gold'] })
    expect(good.status).toBe(201)
    // stored in canonical spelling
    expect(good.body.materials).toEqual(['18k Yellow Gold'])
  })

  it('filters by author role — a buyer sees seller pieces', async () => {
    const seller = await registerUser({ role: 'seller' })
    const buyer = await registerUser({ role: 'buyer' })
    await createPost(seller.token, { description: 'Seller ring' })
    await createPost(buyer.token, { description: 'Buyer brief' })

    const res = await request(app)
      .get('/api/posts')
      .query({ authorRole: 'seller' })
      .set(auth(buyer.token))

    expect(res.status).toBe(200)
    expect(res.body.data.docs).toHaveLength(1)
    expect(res.body.data.docs[0].description).toBe('Seller ring')
    expect(res.body.data.docs[0].userId.role).toBe('seller')
  })

  it('excludes posts from suspended authors', async () => {
    const seller = await registerUser({ role: 'seller' })
    await createPost(seller.token, { description: 'From active seller' })

    let res = await request(app).get('/api/posts').query({ authorRole: 'seller' }).set(auth(seller.token))
    expect(res.body.data.docs).toHaveLength(1)

    await User.findByIdAndUpdate(seller.user.id, { isSuspended: true })

    // A second, active viewer so the request itself still authenticates
    const viewer = await registerUser({ role: 'buyer' })
    res = await request(app).get('/api/posts').query({ authorRole: 'seller' }).set(auth(viewer.token))
    expect(res.body.data.docs).toHaveLength(0)
  })

  it('filters by material', async () => {
    const seller = await registerUser({ role: 'seller' })
    await createPost(seller.token, { description: 'Gold ring', materials: ['18k Yellow Gold'] })
    await createPost(seller.token, { description: 'Silver ring', materials: ['Sterling Silver 925'] })

    const res = await request(app)
      .get('/api/posts')
      .query({ material: '18k Yellow Gold' })
      .set(auth(seller.token))

    expect(res.body.data.docs).toHaveLength(1)
    expect(res.body.data.docs[0].description).toBe('Gold ring')
  })

  it('paginates with limit and hasMore', async () => {
    const seller = await registerUser({ role: 'seller' })
    for (let i = 0; i < 3; i++) {
      await createPost(seller.token, { description: `Piece ${i}` })
    }

    const page1 = await request(app).get('/api/posts').query({ limit: 2, page: 1 }).set(auth(seller.token))
    expect(page1.body.data.docs).toHaveLength(2)
    expect(page1.body.data.totalDocs).toBe(3)
    expect(page1.body.data.hasMore).toBe(true)

    const page2 = await request(app).get('/api/posts').query({ limit: 2, page: 2 }).set(auth(seller.token))
    expect(page2.body.data.docs).toHaveLength(1)
    expect(page2.body.data.hasMore).toBe(false)
  })
})
