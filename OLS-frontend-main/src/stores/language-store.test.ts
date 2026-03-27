import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLanguageStore, LANGUAGES } from './language-store'

// Mock i18n
vi.mock('@/i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}))

describe('useLanguageStore', () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: 'fr' })
  })

  describe('initialization', () => {
    it('should initialize with French by default', () => {
      expect(useLanguageStore.getState().language).toBe('fr')
    })
  })

  describe('changeLanguage', () => {
    it('should change language to English', () => {
      useLanguageStore.getState().changeLanguage('en')
      expect(useLanguageStore.getState().language).toBe('en')
    })

    it('should change language to French', () => {
      useLanguageStore.setState({ language: 'en' })
      useLanguageStore.getState().changeLanguage('fr')
      expect(useLanguageStore.getState().language).toBe('fr')
    })
  })

  describe('initLanguage', () => {
    it('should initialize language', () => {
      useLanguageStore.setState({ language: 'en' })
      useLanguageStore.getState().initLanguage()
      expect(useLanguageStore.getState().language).toBe('en')
    })
  })

  describe('getCurrentLanguage', () => {
    it('should return French language object when language is fr', () => {
      useLanguageStore.setState({ language: 'fr' })
      const lang = useLanguageStore.getState().getCurrentLanguage()
      expect(lang.code).toBe('fr')
      expect(lang.flag).toBe('🇫🇷')
    })

    it('should return English language object when language is en', () => {
      useLanguageStore.setState({ language: 'en' })
      const lang = useLanguageStore.getState().getCurrentLanguage()
      expect(lang.code).toBe('en')
      expect(lang.flag).toBe('🇬🇧')
    })

    it('should return first language as default', () => {
      useLanguageStore.setState({ language: 'invalid' })
      const lang = useLanguageStore.getState().getCurrentLanguage()
      expect(lang).toEqual(LANGUAGES[0])
    })
  })

  describe('LANGUAGES constant', () => {
    it('should contain French and English', () => {
      const codes = LANGUAGES.map((l) => l.code)
      expect(codes).toContain('fr')
      expect(codes).toContain('en')
    })

    it('should have correct properties for each language', () => {
      LANGUAGES.forEach((lang) => {
        expect(lang).toHaveProperty('code')
        expect(lang).toHaveProperty('flag')
        expect(typeof lang.code).toBe('string')
        expect(typeof lang.flag).toBe('string')
      })
    })
  })
})
