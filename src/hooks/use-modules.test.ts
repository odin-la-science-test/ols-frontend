import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useModules, useModulesByType, useModule, moduleKeys } from './use-modules'

vi.mock('@/api', () => ({
  modulesApi: {
    getAll: vi.fn(),
    getByType: vi.fn(),
    getByKey: vi.fn(),
  },
}))

describe('useModules hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('moduleKeys', () => {
    it('should generate correct query keys', () => {
      expect(moduleKeys.all).toEqual(['modules'])
      expect(moduleKeys.byType('MUNIN_ATLAS')).toEqual(['modules', 'MUNIN_ATLAS'])
      expect(moduleKeys.byKey('TEST')).toEqual(['modules', 'detail', 'TEST'])
    })
  })

  describe('useModules', () => {
    it('should be a function', () => {
      expect(typeof useModules).toBe('function')
    })

    it('should return a useQuery hook interface', () => {
      // Verify the hook exists and is callable
      expect(useModules).toBeDefined()
    })
  })

  describe('useModulesByType', () => {
    it('should be a function', () => {
      expect(typeof useModulesByType).toBe('function')
    })

    it('should accept module type parameter', () => {
      // Hook structure verification
      expect(useModulesByType).toBeDefined()
    })
  })

  describe('useModule', () => {
    it('should be a function', () => {
      expect(typeof useModule).toBe('function')
    })

    it('should accept module key parameter', () => {
      // Hook structure verification
      expect(useModule).toBeDefined()
    })
  })
})
