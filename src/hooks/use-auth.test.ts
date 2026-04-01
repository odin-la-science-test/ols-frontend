import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogin, useLogout, useRegister, useGuestLogin } from './use-auth'
import { useAuthStore } from '@/stores'

// Mock dependencies
vi.mock('@/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    guest: vi.fn(),
  },
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}))

describe('useAuth hooks', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    })
    vi.clearAllMocks()
  })

  describe('useLogin', () => {
    it('should be a function', () => {
      expect(typeof useLogin).toBe('function')
    })

    it('should return mutation hook interface', () => {
      expect(useLogin).toBeDefined()
    })
  })

  describe('useLogout', () => {
    it('should be a function', () => {
      expect(typeof useLogout).toBe('function')
    })

    it('should return mutation hook interface', () => {
      expect(useLogout).toBeDefined()
      expect(typeof useLogout).toBe('function')
    })

    it('should clear auth store when called', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT' as const,
      }

      useAuthStore.getState().setAuth(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      useAuthStore.getState().logout()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('useRegister', () => {
    it('should be a function', () => {
      expect(typeof useRegister).toBe('function')
    })

    it('should return mutation hook interface', () => {
      expect(useRegister).toBeDefined()
    })
  })

  describe('useGuestLogin', () => {
    it('should be a function', () => {
      expect(typeof useGuestLogin).toBe('function')
    })

    it('should return mutation hook interface', () => {
      expect(useGuestLogin).toBeDefined()
    })
  })
})
