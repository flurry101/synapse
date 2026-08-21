import '@testing-library/jest-dom'

// Fix React Router 7 + Vitest JSDOM / Undici AbortSignal incompatibility
const OrigRequest = globalThis.Request
if (OrigRequest) {
  globalThis.Request = class Request extends OrigRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      if (init && init.signal) {
        try {
          super(input, init)
        } catch {
          // If undici fails type check on JSDOM AbortSignal, construct Request without signal
          const rest = { ...init }
          delete rest.signal
          super(input, rest)
        }
      } else {
        super(input, init)
      }
    }
  }
  if (typeof window !== 'undefined') {
    window.Request = globalThis.Request
  }
}
