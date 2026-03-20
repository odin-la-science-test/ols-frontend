import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authApi } from './auth'
import api from '../axios'

vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call api.post with login endpoint and credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      authApi.login(credentials)

      expect(api.post).toHaveBeenCalledWith(
        '/auth/login',
        credentials,
        { skipAuthRedirect: true }
      )
    })
  })

  describe('register', () => {
    it('should call api.post with register endpoint and user data', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      }

      authApi.register(userData)

      expect(api.post).toHaveBeenCalledWith(
        '/auth/register',
        userData,
        { skipAuthRedirect: true }
      )
    })
  })

  describe('guest', () => {
    it('should call api.post with guest endpoint', () => {
      authApi.guest()

      expect(api.post).toHaveBeenCalledWith(
        '/auth/guest',
        null,
        { skipAuthRedirect: true }
      )
    })
  })

  describe('refreshToken', () => {
    it('should call api.post with refresh endpoint', () => {
      authApi.refreshToken()

      expect(api.post).toHaveBeenCalledWith(
        '/auth/refresh',
        null,
        { skipAuthRedirect: true }
      )
    })
  })

  describe('me', () => {
    it('should call api.get with me endpoint', () => {
      authApi.me()

      expect(api.get).toHaveBeenCalledWith('/auth/me')
    })
  })
})
