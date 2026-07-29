import { METALS, GEMSTONES, ALL_MATERIALS } from '../material'

describe('material catalog', () => {
  it('ALL_MATERIALS is metals followed by gemstones', () => {
    expect(ALL_MATERIALS).toEqual([...METALS, ...GEMSTONES])
  })

  it('contains no duplicates', () => {
    expect(new Set(ALL_MATERIALS).size).toBe(ALL_MATERIALS.length)
  })

  it('includes representative entries', () => {
    expect(METALS).toContain('18k Yellow Gold')
    expect(GEMSTONES).toContain('Natural Diamond')
  })

  it('has non-empty metal and gemstone lists', () => {
    expect(METALS.length).toBeGreaterThan(0)
    expect(GEMSTONES.length).toBeGreaterThan(0)
  })
})
