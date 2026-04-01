import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, type User } from './auth-store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    })
  })

  describe('setAuth', () => {
    it('should set user and isAuthenticated', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
      }

      useAuthStore.getState().setAuth(mockUser)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
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
      setAuth(mockUser)

      expect(useAuthStore.getState().user).toEqual(mockUser)
    })
  })

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
      }

      useAuthStore.getState().setAuth(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
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

      useAuthStore.getState().setAuth(mockUser)
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

      useAuthStore.getState().setAuth(guestUser)
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

      useAuthStore.getState().setAuth(regularUser)
      expect(useAuthStore.getState().isGuest()).toBe(false)
    })

    it('should return false if user is null', () => {
      expect(useAuthStore.getState().isGuest()).toBe(false)
    })
  })

  describe('persistence', () => {
    it('should include user and isAuthenticated in persistence', () => {
      const state = useAuthStore.getState()
      expect(state).toHaveProperty('user')
      expect(state).toHaveProperty('isAuthenticated')
    })
  })
})
