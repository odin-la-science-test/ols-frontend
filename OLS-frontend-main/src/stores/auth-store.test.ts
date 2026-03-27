import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, type User } from './auth-store'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Réinitialiser le store avant chaque test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  })

  describe('setAuth', () => {
    it('should set user and token', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
      }
      const token = 'test-token'

      useAuthStore.getState().setAuth(mockUser, token)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toEqual(token)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should be callable from getState', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      }

      const setAuth = useAuthStore.getState().setAuth
      setAuth(mockUser, 'token')

      expect(useAuthStore.getState().user).toEqual(mockUser)
    })
  })

  describe('logout', () => {
    it('should clear user, token and set isAuthenticated to false', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
      }

      // Setup
      useAuthStore.getState().setAuth(mockUser, 'test-token')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Act
      useAuthStore.getState().logout()

      // Assert
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('updateUser', () => {
    it('should update user data while keeping existing fields', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
      }

      useAuthStore.getState().setAuth(mockUser, 'token')
      useAuthStore.getState().updateUser({ firstName: 'Updated' })

      const updatedUser = useAuthStore.getState().user
      expect(updatedUser?.firstName).toBe('Updated')
      expect(updatedUser?.email).toBe('test@example.com')
    })

    it('should do nothing if user is null', () => {
      useAuthStore.getState().updateUser({ firstName: 'Updated' })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('isGuest', () => {
    it('should return true if user role is GUEST', () => {
      const guestUser: User = {
        id: '1',
        email: 'guest@example.com',
        firstName: 'Guest',
        lastName: 'User',
        role: 'GUEST',
      }

      useAuthStore.getState().setAuth(guestUser, 'token')
      expect(useAuthStore.getState().isGuest()).toBe(true)
    })

    it('should return false if user role is not GUEST', () => {
      const regularUser: User = {
        id: '1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
      }

      useAuthStore.getState().setAuth(regularUser, 'token')
      expect(useAuthStore.getState().isGuest()).toBe(false)
    })

    it('should return false if user is null', () => {
      expect(useAuthStore.getState().isGuest()).toBe(false)
    })
  })

  describe('persistence', () => {
    it('should include user, token and isAuthenticated in persistence', () => {
      const state = useAuthStore.getState()
      expect(state).toHaveProperty('user')
      expect(state).toHaveProperty('token')
      expect(state).toHaveProperty('isAuthenticated')
    })
  })
})
