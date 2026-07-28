import { registerSchema, loginDto } from '../../src/dtos/auth.dto'

const validRegister = {
  firstName: 'Bhagawati',
  lastName: 'Sharma',
  email: 'Bhagawati@Example.com',
  phoneNumber: '9800000000',
  password: 'supersecret',
  confirmPassword: 'supersecret',
  role: 'seller' as const,
}

describe('registerSchema', () => {
  it('accepts a valid registration and lowercases the email', () => {
    const result = registerSchema.safeParse(validRegister)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('bhagawati@example.com')
  })

  it('rejects when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true)
    }
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...validRegister, password: 'short', confirmPassword: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...validRegister, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a role outside buyer/seller', () => {
    const result = registerSchema.safeParse({ ...validRegister, role: 'admin' })
    expect(result.success).toBe(false)
  })
})

describe('loginDto', () => {
  it('accepts valid credentials', () => {
    expect(loginDto.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
  })

  it('rejects a blank password', () => {
    expect(loginDto.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })
})
