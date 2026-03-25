import { describe, it, expect, beforeEach, vi } from 'vitest'
import { modulesApi } from './modules'
import api from '../axios'

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('modulesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should call api.get with correct endpoint', () => {
      modulesApi.getAll()
      expect(api.get).toHaveBeenCalledWith('/modules')
    })

    it('should return promise from api call', () => {
      const mockResponse = { data: [] }
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse as any)

      const result = modulesApi.getAll()
      expect(result).toBeDefined()
    })
  })

  describe('getByType', () => {
    it('should call api.get with type MUNIN_ATLAS', () => {
      modulesApi.getByType('MUNIN_ATLAS')
      expect(api.get).toHaveBeenCalledWith('/modules/type/MUNIN_ATLAS')
    })

    it('should call api.get with type HUGIN_LAB', () => {
      modulesApi.getByType('HUGIN_LAB')
      expect(api.get).toHaveBeenCalledWith('/modules/type/HUGIN_LAB')
    })
  })

  describe('getByKey', () => {
    it('should call api.get with correct module key', () => {
      modulesApi.getByKey('TEST_MODULE')
      expect(api.get).toHaveBeenCalledWith('/modules/TEST_MODULE')
    })

    it('should handle different module keys', () => {
      const keys = ['BACTERIOLOGY', 'MYCOLOGY', 'IMMUNOLOGY']
      keys.forEach((key) => {
        vi.clearAllMocks()
        modulesApi.getByKey(key)
        expect(api.get).toHaveBeenCalledWith(`/modules/${key}`)
      })
    })
  })
})
