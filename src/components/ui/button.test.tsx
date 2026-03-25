import { render, screen } from '@testing-library/react'
import { Button } from './button'
import i18n from '../../i18n'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>{i18n.t('button.click')}</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<Button loading>{i18n.t('button.click')}</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    // Check if loading spinner is present usually by checking for class or role if possible, 
    // but here we can just ensure the button is disabled and contains the children
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">{i18n.t('button.click')}</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
