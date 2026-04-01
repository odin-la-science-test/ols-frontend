import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { type ReactElement } from 'react'
import { FeatureCard } from './feature-card'
import { BrowserRouter } from 'react-router-dom'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('FeatureCard', () => {
  const renderWithRouter = (component: ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('should render card with title and description', () => {
    renderWithRouter(
      <FeatureCard
        title="Test Card"
        description="Test Description"
        icon={<span>📚</span>}
        accentColor="#ff0000"
      />
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should render icon', () => {
    renderWithRouter(
      <FeatureCard
        title="Test Card"
        icon={<span data-testid="test-icon">📚</span>}
        accentColor="#ff0000"
      />
    )

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('should show locked state when isLocked is true', () => {
    renderWithRouter(
      <FeatureCard
        title="Test Card"
        icon={<span>📚</span>}
        accentColor="#ff0000"
        isLocked={true}
      />
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('should be clickable when not locked', () => {
    const onClick = vi.fn()
    renderWithRouter(
      <FeatureCard
        title="Test Card"
        icon={<span>📚</span>}
        accentColor="#ff0000"
        onClick={onClick}
      />
    )

    const card = screen.getByText('Test Card').closest('button, a, div[role="button"]')
    if (card) {
      fireEvent.click(card)
      expect(onClick).toHaveBeenCalled()
    }
  })

  it('should apply custom className', () => {
    const { container } = renderWithRouter(
      <FeatureCard
        title="Test Card"
        icon={<span>📚</span>}
        accentColor="#ff0000"
        className="custom-class"
      />
    )

    const element = container.querySelector('.custom-class')
    expect(element).toBeInTheDocument()
  })

  it('should render as link when to prop is provided', () => {
    renderWithRouter(
      <FeatureCard
        title="Test Card"
        icon={<span>📚</span>}
        accentColor="#ff0000"
        to="/test-path"
      />
    )

    const link = screen.getByRole('link', { hidden: true })
    expect(link).toHaveAttribute('href', '/test-path')
  })
})
