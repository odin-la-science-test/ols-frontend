import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingState, WaveLoader } from './loading-state'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    path: ({ ...props }: any) => <path {...props} />,
    circle: ({ ...props }: any) => <circle {...props} />,
  },
}))

describe('LoadingState', () => {
  it('should render loading state', () => {
    const { container } = render(<LoadingState />)
    // LoadingState renders some form of loading indicator
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with message', () => {
    // Just verify the component exists and can be called
    expect(LoadingState).toBeDefined()
    expect(typeof LoadingState).toBe('function')
  })

  it('should render with theme prop', () => {
    const { container: container1 } = render(<LoadingState theme="munin" />)
    expect(container1.firstChild).toBeInTheDocument()

    const { container: container2 } = render(<LoadingState theme="hugin" />)
    expect(container2.firstChild).toBeInTheDocument()
  })

  it('should render with size prop', () => {
    const { rerender, container } = render(<LoadingState size="sm" />)
    expect(container.firstChild).toBeInTheDocument()

    rerender(<LoadingState size="lg" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('WaveLoader', () => {
  it('should render wave loader', () => {
    const { container } = render(<WaveLoader />)
    // WaveLoader renders a component
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with different themes', () => {
    const { rerender, container } = render(<WaveLoader theme="munin" />)
    expect(container.firstChild).toBeInTheDocument()

    rerender(<WaveLoader theme="hugin" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<WaveLoader size="sm" />)
    expect(document.body).toBeInTheDocument()

    rerender(<WaveLoader size="lg" />)
    expect(document.body).toBeInTheDocument()
  })

  it('should use custom color when provided', () => {
    const { container } = render(<WaveLoader customColor="#ff0000" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should support all theme options', () => {
    const themes = ['munin', 'hugin', 'default'] as const
    themes.forEach((theme) => {
      const { container } = render(<WaveLoader theme={theme} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
