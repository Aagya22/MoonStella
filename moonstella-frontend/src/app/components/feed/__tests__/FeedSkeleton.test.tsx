import { render } from '@testing-library/react'
import FeedSkeleton from '../FeedSkeleton'

// The skeleton cards are marked with the `.skeleton` class; each card contains
// several, but the card wrapper is the top-level child of the flex column.
const countCards = (container: HTMLElement) =>
  container.querySelectorAll(':scope > div > div').length

describe('FeedSkeleton', () => {
  it('renders three placeholder cards by default', () => {
    const { container } = render(<FeedSkeleton />)
    expect(countCards(container)).toBe(3)
  })

  it('renders the requested number of cards', () => {
    const { container } = render(<FeedSkeleton count={1} />)
    expect(countCards(container)).toBe(1)
  })

  it('renders shimmer elements', () => {
    const { container } = render(<FeedSkeleton count={2} />)
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0)
  })
})
