import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('should merge classNames correctly', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).toContain('active-class')
  })

  it('should handle false conditions', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).not.toContain('active-class')
  })

  it('should merge tailwind conflicts correctly', () => {
    // When there are conflicting tailwind classes, twMerge should handle it
    const result = cn('px-2', 'px-4')
    // The second px-4 should win
    expect(result).toContain('px-4')
  })

  it('should handle empty strings', () => {
    const result = cn('class1', '', 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  it('should handle null and undefined', () => {
    const result = cn('class1', null, undefined, 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
    expect(result).toContain('class3')
  })
})
