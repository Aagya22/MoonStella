import { render, screen } from '@testing-library/react'
import Navbar from '../navbar'

// Control what route the navbar thinks it is on.
const mockPathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

const linkFor = (label: string) =>
  screen.getAllByText(label).find((el) => el.tagName === 'A') as HTMLElement

describe('Navbar active link', () => {
  it('marks HOME active on the home route', () => {
    mockPathname.mockReturnValue('/')
    render(<Navbar />)
    // active link carries the full underline utility
    expect(linkFor('HOME').className).toContain('after:w-full')
    expect(linkFor('PRODUCT').className).toContain('after:w-0')
  })

  it('marks PRODUCT active on a product route', () => {
    mockPathname.mockReturnValue('/product')
    render(<Navbar />)
    expect(linkFor('PRODUCT').className).toContain('after:w-full')
    expect(linkFor('HOME').className).toContain('after:w-0')
  })

  it('does not mark HOME active on a non-home route', () => {
    mockPathname.mockReturnValue('/about')
    render(<Navbar />)
    expect(linkFor('HOME').className).toContain('after:w-0')
    expect(linkFor('ABOUT').className).toContain('after:w-full')
  })
})
