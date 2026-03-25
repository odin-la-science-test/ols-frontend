import { describe, it, expect, beforeEach } from 'vitest'
import { useStatusBarStore, type StatusBarItem } from './status-bar-store'

const makeItem = (overrides: Partial<StatusBarItem> & Pick<StatusBarItem, 'id'>): StatusBarItem => ({
  position: 'left',
  text: overrides.id,
  ...overrides,
})

describe('useStatusBarStore', () => {
  beforeEach(() => {
    useStatusBarStore.setState({ items: {}, isOnline: true })
  })

  describe('initialization', () => {
    it('should start with no items', () => {
      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(0)
    })

    it('should start as online', () => {
      expect(useStatusBarStore.getState().isOnline).toBe(true)
    })
  })

  describe('setItems', () => {
    it('should add a single item', () => {
      const item = makeItem({ id: 'bact:count', text: '42 items' })
      useStatusBarStore.getState().setItems([item])

      expect(useStatusBarStore.getState().items['bact:count']).toEqual(item)
    })

    it('should add multiple items at once', () => {
      const items = [
        makeItem({ id: 'bact:count', text: '42 items' }),
        makeItem({ id: 'bact:view', text: 'Table', position: 'right' }),
      ]
      useStatusBarStore.getState().setItems(items)

      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(2)
    })

    it('should upsert existing items', () => {
      useStatusBarStore.getState().setItems([makeItem({ id: 'bact:count', text: '10 items' })])
      useStatusBarStore.getState().setItems([makeItem({ id: 'bact:count', text: '42 items' })])

      expect(useStatusBarStore.getState().items['bact:count'].text).toBe('42 items')
      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(1)
    })

    it('should preserve items from other modules', () => {
      useStatusBarStore.getState().setItems([makeItem({ id: 'bact:count', text: '10' })])
      useStatusBarStore.getState().setItems([makeItem({ id: 'myco:count', text: '5' })])

      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(2)
    })
  })

  describe('removeByPrefix', () => {
    it('should remove all items matching the prefix', () => {
      useStatusBarStore.getState().setItems([
        makeItem({ id: 'bact:count', text: '10' }),
        makeItem({ id: 'bact:view', text: 'Table' }),
        makeItem({ id: 'myco:count', text: '5' }),
      ])

      useStatusBarStore.getState().removeByPrefix('bact:')

      const remaining = useStatusBarStore.getState().items
      expect(Object.keys(remaining)).toHaveLength(1)
      expect(remaining['myco:count']).toBeDefined()
    })

    it('should do nothing if prefix matches no items', () => {
      useStatusBarStore.getState().setItems([makeItem({ id: 'bact:count', text: '10' })])

      useStatusBarStore.getState().removeByPrefix('myco:')

      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(1)
    })

    it('should work on an empty store', () => {
      useStatusBarStore.getState().removeByPrefix('bact:')
      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(0)
    })
  })

  describe('removeItem', () => {
    it('should remove a single item by id', () => {
      useStatusBarStore.getState().setItems([
        makeItem({ id: 'bact:count', text: '10' }),
        makeItem({ id: 'bact:view', text: 'Table' }),
      ])

      useStatusBarStore.getState().removeItem('bact:count')

      const remaining = useStatusBarStore.getState().items
      expect(remaining['bact:count']).toBeUndefined()
      expect(remaining['bact:view']).toBeDefined()
    })

    it('should do nothing if id does not exist', () => {
      useStatusBarStore.getState().setItems([makeItem({ id: 'bact:count', text: '10' })])

      useStatusBarStore.getState().removeItem('nonexistent')

      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('should remove all items', () => {
      useStatusBarStore.getState().setItems([
        makeItem({ id: 'bact:count', text: '10' }),
        makeItem({ id: 'myco:count', text: '5' }),
      ])

      useStatusBarStore.getState().clearAll()

      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(0)
    })

    it('should work on an already empty store', () => {
      useStatusBarStore.getState().clearAll()
      expect(Object.keys(useStatusBarStore.getState().items)).toHaveLength(0)
    })
  })

  describe('setOnline', () => {
    it('should set offline', () => {
      useStatusBarStore.getState().setOnline(false)
      expect(useStatusBarStore.getState().isOnline).toBe(false)
    })

    it('should set back to online', () => {
      useStatusBarStore.getState().setOnline(false)
      useStatusBarStore.getState().setOnline(true)
      expect(useStatusBarStore.getState().isOnline).toBe(true)
    })
  })
})
