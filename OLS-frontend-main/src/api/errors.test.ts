import { describe, it, expect, beforeEach } from 'vitest'
import { ApiError, isApiError } from './errors'
import { AxiosError } from 'axios'

describe('ApiError', () => {
  let mockAxiosError: AxiosError

  beforeEach(() => {
    mockAxiosError = new AxiosError('Test error')
  })

  describe('constructor', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError('NETWORK_ERROR', 'Network unavailable', mockAxiosError, 0)

      expect(error.type).toBe('NETWORK_ERROR')
      expect(error.message).toBe('Network unavailable')
      expect(error.status).toBe(0)
      expect(error.originalError).toBe(mockAxiosError)
    })

    it('should set correct name', () => {
      const error = new ApiError('SERVER_ERROR', 'Server error', mockAxiosError, 500)
      expect(error.name).toBe('ApiError')
    })
  })

  describe('isRetryable', () => {
    it('should be retryable for NETWORK_ERROR', () => {
      const error = new ApiError('NETWORK_ERROR', 'Network error', mockAxiosError, 0)
      expect(error.isRetryable).toBe(true)
    })

    it('should be retryable for TIMEOUT', () => {
      const error = new ApiError('TIMEOUT', 'Timeout', mockAxiosError, 0)
      expect(error.isRetryable).toBe(true)
    })

    it('should be retryable for SERVER_ERROR', () => {
      const error = new ApiError('SERVER_ERROR', 'Server error', mockAxiosError, 500)
      expect(error.isRetryable).toBe(true)
    })

    it('should not be retryable for UNAUTHORIZED', () => {
      const error = new ApiError('UNAUTHORIZED', 'Unauthorized', mockAxiosError, 401)
      expect(error.isRetryable).toBe(false)
    })

    it('should not be retryable for VALIDATION_ERROR', () => {
      const error = new ApiError('VALIDATION_ERROR', 'Validation failed', mockAxiosError, 400)
      expect(error.isRetryable).toBe(false)
    })

    it('should not be retryable for FORBIDDEN', () => {
      const error = new ApiError('FORBIDDEN', 'Forbidden', mockAxiosError, 403)
      expect(error.isRetryable).toBe(false)
    })

    it('should not be retryable for NOT_FOUND', () => {
      const error = new ApiError('NOT_FOUND', 'Not found', mockAxiosError, 404)
      expect(error.isRetryable).toBe(false)
    })

    it('should not be retryable for RATE_LIMITED', () => {
      const error = new ApiError('RATE_LIMITED', 'Rate limited', mockAxiosError, 429)
      expect(error.isRetryable).toBe(false)
    })

    it('should not be retryable for UNKNOWN', () => {
      const error = new ApiError('UNKNOWN', 'Unknown error', mockAxiosError)
      expect(error.isRetryable).toBe(false)
    })
  })

  describe('error types', () => {
    it('should support all error types', () => {
      const types: Array<ConstructorParameters<typeof ApiError>[0]> = [
        'NETWORK_ERROR',
        'TIMEOUT',
        'SERVER_ERROR',
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'RATE_LIMITED',
        'UNKNOWN',
      ]

      types.forEach((type) => {
        const error = new ApiError(type, 'Test', mockAxiosError)
        expect(error.type).toBe(type)
      })
    })
  })
})

describe('isApiError', () => {
  it('should return true for ApiError instances', () => {
    const error = new ApiError('UNKNOWN', 'Test', new AxiosError())
    expect(isApiError(error)).toBe(true)
  })

  it('should return false for regular Error instances', () => {
    const error = new Error('Test')
    expect(isApiError(error)).toBe(false)
  })

  it('should return false for null', () => {
    expect(isApiError(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isApiError(undefined)).toBe(false)
  })

  it('should return false for objects without ApiError properties', () => {
    expect(isApiError({ type: 'NETWORK_ERROR' })).toBe(false)
  })
})
