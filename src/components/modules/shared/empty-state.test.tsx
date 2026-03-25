import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './empty-state'
import { Search } from 'lucide-react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No results found" />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(
      <EmptyState
        title="No results"
        description="Try adjusting your search filters"
      />
    )
    expect(screen.getByText('Try adjusting your search filters')).toBeInTheDocument()
  })

  it('should render default icon (Search)', () => {
    const { container } = render(<EmptyState title="No data" />)
    // Check that an icon is rendered
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('should render custom icon', () => {
    const { container } = render(
      <EmptyState title="No data" icon={Search} />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    render(
      <EmptyState
        title="No results"
        action={<button>Clear filters</button>}
      />
    )
    expect(screen.getByText('Clear filters')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState
        title="No data"
        className="custom-empty-state"
      />
    )
    const wrapper = container.querySelector('.custom-empty-state')
    expect(wrapper).toBeInTheDocument()
  })

  it('should render all elements together', () => {
    render(
      <EmptyState
        title="No items"
        description="Create your first item"
        action={<button>Create</button>}
      />
    )

    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('Create your first item')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
  })
})
