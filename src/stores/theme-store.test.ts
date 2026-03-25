import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from './theme-store'

// Mock document & DOM
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
}

const mockStyle = {
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
}

const mockSetAttribute = vi.fn()
const mockRemoveAttribute = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(document, 'documentElement', {
    value: {
      classList: mockClassList,
      style: mockStyle,
      setAttribute: mockSetAttribute,
      removeAttribute: mockRemoveAttribute,
    },
    configurable: true,
  })
})

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark', themePreset: 'odin-dark' })
  })

  describe('initialization', () => {
    it('should initialize with dark theme by default', () => {
      expect(useThemeStore.getState().theme).toBe('dark')
      expect(useThemeStore.getState().themePreset).toBe('odin-dark')
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from odin-dark to odin-light', () => {
      useThemeStore.setState({ theme: 'dark', themePreset: 'odin-dark' })
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().theme).toBe('light')
      expect(useThemeStore.getState().themePreset).toBe('odin-light')
    })

    it('should toggle from odin-light to odin-dark', () => {
      useThemeStore.setState({ theme: 'light', themePreset: 'odin-light' })
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().theme).toBe('dark')
      expect(useThemeStore.getState().themePreset).toBe('odin-dark')
    })

    it('should toggle nord to nord-light', () => {
      useThemeStore.setState({ theme: 'dark', themePreset: 'nord' })
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().theme).toBe('light')
      expect(useThemeStore.getState().themePreset).toBe('nord-light')
    })

    it('should toggle nord-light back to nord', () => {
      useThemeStore.setState({ theme: 'light', themePreset: 'nord-light' })
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().theme).toBe('dark')
      expect(useThemeStore.getState().themePreset).toBe('nord')
    })

    it('should toggle github (light) to github-dark', () => {
      useThemeStore.setState({ theme: 'light', themePreset: 'github' })
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().theme).toBe('dark')
      expect(useThemeStore.getState().themePreset).toBe('github-dark')
    })
  })

  describe('initTheme', () => {
    it('should apply current theme to document', () => {
      useThemeStore.setState({ theme: 'dark', themePreset: 'odin-dark' })
      useThemeStore.getState().initTheme()
      expect(mockClassList.add).toHaveBeenCalled()
    })
  })

  describe('setThemePreset', () => {
    it('should set theme preset and apply corresponding mode', () => {
      useThemeStore.getState().setThemePreset('nord')
      expect(useThemeStore.getState().themePreset).toBe('nord')
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('should switch to light mode for light presets', () => {
      useThemeStore.getState().setThemePreset('odin-light')
      expect(useThemeStore.getState().themePreset).toBe('odin-light')
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('should set data-theme attribute for non-default themes', () => {
      useThemeStore.getState().setThemePreset('dracula')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dracula')
    })

    it('should remove data-theme attribute for default odin themes', () => {
      vi.clearAllMocks()
      useThemeStore.getState().setThemePreset('odin-dark')
      expect(mockRemoveAttribute).toHaveBeenCalledWith('data-theme')
      expect(mockSetAttribute).not.toHaveBeenCalledWith('data-theme', expect.anything())
    })
  })


})
