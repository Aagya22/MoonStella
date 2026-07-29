import '@testing-library/jest-dom'

// jsdom doesn't implement IntersectionObserver, which the Reveal component uses.
// This stub records each observer's callback so a test can trigger a
// "scrolled into view" event.
class MockIntersectionObserver {
  readonly callback: IntersectionObserverCallback
  static instances: MockIntersectionObserver[] = []

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
  takeRecords = jest.fn(() => [])
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver
