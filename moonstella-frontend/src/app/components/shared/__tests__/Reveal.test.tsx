import { render, screen, act } from '@testing-library/react'
import Reveal from '../Reveal'

// Provided by jest.setup.ts — records observer instances so we can fire them.
const MockIO = globalThis.IntersectionObserver as unknown as {
  instances: { callback: IntersectionObserverCallback }[]
}

beforeEach(() => {
  MockIO.instances = []
})

describe('Reveal', () => {
  it('renders its children (they stay in the DOM regardless of visibility)', () => {
    render(<Reveal><p>Hello atelier</p></Reveal>)
    expect(screen.getByText('Hello atelier')).toBeInTheDocument()
  })

  it('starts hidden and becomes visible once scrolled into view', () => {
    render(<Reveal><p>Reveal me</p></Reveal>)
    const wrapper = screen.getByText('Reveal me').parentElement as HTMLElement

    // Before intersecting, the wrapper is transparent
    expect(wrapper.style.opacity).toBe('0')

    // Simulate the element scrolling into view
    act(() => {
      MockIO.instances[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(wrapper.style.opacity).toBe('1')
  })

  it('applies a passed className to the wrapper', () => {
    render(<Reveal className="custom-class"><span>x</span></Reveal>)
    expect(screen.getByText('x').parentElement).toHaveClass('custom-class')
  })
})
