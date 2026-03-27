import { ReactElement, type ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

/**
 * Crée un nouveau QueryClient pour chaque test
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Wrapper qui fournit les providers nécessaires (QueryClient, etc.)
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

function AllTheProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * Fonction render personnalisée qui wraps les composants avec les providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  })
}

/**
 * Mock axios par défaut
 */
export function mockAxios() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  }
}

/**
 * Crée un user mock avec valeurs par défaut
 */
export function createMockUser(overrides = {}) {
  return {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT' as const,
    ...overrides,
  }
}

/**
 * Crée un token mock
 */
export const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

// Re-export everything from testing-library
export * from '@testing-library/react'
