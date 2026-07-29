import request from 'supertest'
import app from '../../src/app'

let counter = 0

interface RegisterOverrides {
  role?: 'buyer' | 'seller'
  email?: string
  phoneNumber?: string
  password?: string
  firstName?: string
}

// Registers a fresh user through the real endpoint and returns the auth token
// plus the created user object.
export const registerUser = async (overrides: RegisterOverrides = {}) => {
  counter += 1
  const password = overrides.password || 'supersecret'
  const payload = {
    firstName: overrides.firstName || `User${counter}`,
    lastName: 'Test',
    email: overrides.email || `user${counter}@example.com`,
    phoneNumber: overrides.phoneNumber || `98${String(counter).padStart(8, '0')}`,
    password,
    confirmPassword: password,
    role: overrides.role || 'buyer',
  }

  const res = await request(app).post('/api/auth/register').send(payload)
  if (res.status !== 201) {
    throw new Error(`registerUser failed (${res.status}): ${JSON.stringify(res.body)}`)
  }
  return { token: res.body.data.token as string, user: res.body.data.user, password }
}
