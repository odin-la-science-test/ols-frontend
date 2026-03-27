import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, BooleanBadge } from './badge'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should render with different variants', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toBeInTheDocument()

    rerender(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toBeInTheDocument()

    rerender(<Badge size="lg">Large</Badge>)
    expect(screen.getByText('Large')).toBeInTheDocument()
  })
  it('should apply custom className', () => {
    const { container } = render(
      <Badge className="custom-class">Test</Badge>
    )
    expect(screen.getByText('Test')).toBeInTheDocument()
    const badge = container.querySelector('.custom-class')
    expect(badge).toBeInTheDocument()
  })


  describe('gram variants', () => {
    it('should render gramPositive variant', () => {
      render(<Badge variant="gramPositive">Gram +</Badge>)
      expect(screen.getByText('Gram +')).toBeInTheDocument()
    })

    it('should render gramNegative variant', () => {
      render(<Badge variant="gramNegative">Gram −</Badge>)
      expect(screen.getByText('Gram −')).toBeInTheDocument()
    })
  })

  describe('morphology variants', () => {
    const morphologies = ['coccus', 'bacillus', 'spirochete'] as const

    morphologies.forEach((morph) => {
      it(`should render ${morph} variant`, () => {
        render(<Badge variant={morph}>{morph}</Badge>)
        expect(screen.getByText(morph)).toBeInTheDocument()
      })
    })
  })

  describe('fungus variants', () => {
    const types = ['yeast', 'mold', 'filamentous'] as const

    types.forEach((type) => {
      it(`should render ${type} variant`, () => {
        render(<Badge variant={type}>{type}</Badge>)
        expect(screen.getByText(type)).toBeInTheDocument()
      })
    })
  })
})

describe('BooleanBadge', () => {
  it('should render with true value', () => {
    render(<BooleanBadge value={true} trueLabel="Yes" falseLabel="No" />)
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('should render with false value', () => {
    render(<BooleanBadge value={false} trueLabel="Yes" falseLabel="No" />)
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('should use default labels', () => {
    const { container } = render(<BooleanBadge value={true} />)
    // BooleanBadge displays the default label "+" for true
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('should use appropriate variant based on value', () => {
    const { rerender } = render(
      <BooleanBadge value={true} trueLabel="Active" falseLabel="Inactive" />
    )
    expect(screen.getByText('Active')).toBeInTheDocument()

    rerender(
      <BooleanBadge value={false} trueLabel="Active" falseLabel="Inactive" />
    )
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
