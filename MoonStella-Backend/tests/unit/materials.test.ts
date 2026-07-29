import { normalizeMaterial, ALL_MATERIALS, METALS, GEMSTONES } from '../../src/constants/materials'

describe('normalizeMaterial', () => {
  it('returns the canonical spelling for an exact match', () => {
    expect(normalizeMaterial('18k Yellow Gold')).toBe('18k Yellow Gold')
  })

  it('is case-insensitive', () => {
    expect(normalizeMaterial('18K YELLOW GOLD')).toBe('18k Yellow Gold')
    expect(normalizeMaterial('18k yellow gold')).toBe('18k Yellow Gold')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeMaterial('  Platinum 950  ')).toBe('Platinum 950')
  })

  it('collapses casing variants of the same material to one tag', () => {
    expect(normalizeMaterial('natural diamond')).toBe(normalizeMaterial('NATURAL DIAMOND'))
  })

  it('returns null for anything outside the taxonomy', () => {
    expect(normalizeMaterial('Unobtanium')).toBeNull()
    expect(normalizeMaterial('')).toBeNull()
  })

  it('accepts "Other" as a catch-all', () => {
    expect(normalizeMaterial('Other')).toBe('Other')
  })
})

describe('taxonomy', () => {
  it('ALL_MATERIALS is metals + gemstones + Other', () => {
    expect(ALL_MATERIALS).toEqual([...METALS, ...GEMSTONES, 'Other'])
  })

  it('has no duplicate entries', () => {
    expect(new Set(ALL_MATERIALS).size).toBe(ALL_MATERIALS.length)
  })
})
