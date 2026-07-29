import { createPostDto } from '../../src/dtos/post.dto'

const base = {
  description: 'A hand-set solitaire ring',
  category: 'Rings',
  images: ['https://example.com/a.png'],
}

describe('createPostDto', () => {
  it('accepts a valid payload and defaults materials to []', () => {
    const result = createPostDto.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.materials).toEqual([])
  })

  it('rejects an empty description', () => {
    const result = createPostDto.safeParse({ ...base, description: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing category', () => {
    const { category, ...noCategory } = base
    const result = createPostDto.safeParse(noCategory)
    expect(result.success).toBe(false)
  })

  it('normalizes material casing to the canonical spelling', () => {
    const result = createPostDto.safeParse({ ...base, materials: ['18K YELLOW GOLD'] })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.materials).toEqual(['18k Yellow Gold'])
  })

  it('deduplicates materials that normalize to the same tag', () => {
    const result = createPostDto.safeParse({
      ...base,
      materials: ['18k Yellow Gold', '18K yellow gold'],
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.materials).toEqual(['18k Yellow Gold'])
  })

  it('rejects a material outside the taxonomy', () => {
    const result = createPostDto.safeParse({ ...base, materials: ['Unobtanium'] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/not a recognised material/i)
    }
  })

  it('trims and keeps budget/price optional', () => {
    const result = createPostDto.safeParse({ ...base, budget: 5000, price: null })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.budget).toBe(5000)
  })
})
