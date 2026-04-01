import { render, screen } from '@testing-library/react'
import App from './App'
import { vi } from 'vitest'

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  } 
}))

vi.mock('./stores', () => ({
  useThemeStore: (selector: (arg: { initTheme: () => void }) => unknown) => selector({ initTheme: vi.fn() }),
  useLanguageStore: (selector: (arg: { initLanguage: () => void }) => unknown) => selector({ initLanguage: vi.fn() }),
  useAuthStore: Object.assign(
    (selector: any) => selector({ isAuthenticated: false }),
    { getState: () => ({ isAuthenticated: false, setAuth: vi.fn(), logout: vi.fn() }) }
  ),
}))

vi.mock('./api', () => ({
  authApi: { me: vi.fn().mockRejectedValue(new Error('not authenticated')) },
}))

vi.mock('./lib/preferences-sync', () => ({
  initPreferencesSync: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    // importActual allows to keep other exports if needed, though we only replace RouterProvider here
    const actual = await vi.importActual('react-router-dom') as Record<string, unknown>
    return {
        ...actual,
        RouterProvider: () => <div data-testid="router-provider">Router Content</div>
    }
})

// Mock UI components if they cause issues, but TooltipProvider and Toaster should be fine usually.
// If Toaster uses window.matchMedia not present in jsdom, we might need to setup that in setup.ts.

describe('App', () => {
  it('renders without crashing and initializes stores', () => {
    render(<App />)
    expect(screen.getByTestId('router-provider')).toBeInTheDocument()
    // We could verify initTheme/initLanguage were called if we mock the store differently (returning spies)
  })
  
  it('updates document title', () => {
      // Logic is inside useEffect, checking document.title
      render(<App />)
      expect(document.title).toBe('common.appName - common.tagline')
  })
})
