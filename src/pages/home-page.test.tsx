import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { HomePage } from './home-page'
import { BrowserRouter } from 'react-router-dom'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/components/common', () => ({
  SparklesBackground: () => <div data-testid="sparkles-background" />,
  Logo: ({ size }: any) => <div data-testid="logo" data-size={size} />,
  UserMenu: () => <div data-testid="user-menu" />,
  FeatureCard: ({ title, to, ...props }: any) => (
    <a href={to} data-testid={`feature-card-${title}`} {...props}>
      {title}
    </a>
  ),
  ResumeWorkspaceButton: () => <div data-testid="resume-button" />,
  AppTopBar: () => <div data-testid="app-top-bar" />,
}))

vi.mock('@/components/common/widgets', () => ({
  QuickShortcutsWidget: () => <div data-testid="widget-quick-shortcuts" />,
  RecentActivityWidget: () => <div data-testid="widget-recent-activity" />,
  LatestNotesWidget: () => <div data-testid="widget-latest-notes" />,
  NotificationsWidget: () => <div data-testid="widget-notifications" />,
}))

vi.mock('@/stores/dashboard-store', () => ({
  useDashboardStore: () => ({
    widgets: [
      { id: 'quick-shortcuts', visible: true },
      { id: 'recent-activity', visible: true },
    ],
    editMode: false,
    toggleEditMode: vi.fn(),
    setWidgetVisible: vi.fn(),
    resetToDefaults: vi.fn(),
    moveWidget: vi.fn(),
    customShortcuts: [],
    addShortcut: vi.fn(),
    removeShortcut: vi.fn(),
  }),
}))

const renderHome = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  it('should render the home page', () => {
    expect(HomePage).toBeDefined()
    expect(typeof HomePage).toBe('function')
  })

  it('should render without crashing', () => {
    const { container } = renderHome()
    expect(container).toBeTruthy()
  })

  it('should render visible widgets', () => {
    const { getByTestId } = renderHome()
    expect(getByTestId('widget-quick-shortcuts')).toBeTruthy()
    expect(getByTestId('widget-recent-activity')).toBeTruthy()
  })

  it('should show customize button', () => {
    const { container } = renderHome()
    const customizeBtn = container.querySelector('button')
    expect(customizeBtn).toBeTruthy()
  })
})
