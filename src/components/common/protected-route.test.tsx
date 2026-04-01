import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './protected-route'
import { useAuthStore } from '@/stores'

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: any) => <div data-testid="navigate" data-to={to} />,
  useLocation: () => ({ pathname: '/test' }),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    })
  })

  it('should render children when user is authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'STUDENT' as const,
    }

    useAuthStore.getState().setAuth(mockUser)

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('should not render protected content when not authenticated', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })
})
