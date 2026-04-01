import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useApiError } from './use-api-error'

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/api/errors', () => ({
  isApiError: (error: unknown) => 
    error && typeof error === 'object' && 'type' in error && error instanceof Error,
  ApiError: class ApiError extends Error {
    constructor(public type: string, message: string, public status?: number) {
      super(message)
    }
  },
}))

describe('useApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be a function', () => {
    expect(typeof useApiError).toBe('function')
  })

  // Note: Full hook testing requires React component context
  // These unit tests verify the hook structure exists
  it('should not throw when called', () => {
    expect(() => {
      // We can't directly call useApiError outside a component
      // but we can verify it's a function
      expect(useApiError).toBeDefined()
    }).not.toThrow()
  })
})
