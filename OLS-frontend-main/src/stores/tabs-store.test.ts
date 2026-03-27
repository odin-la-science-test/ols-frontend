import { describe, it, expect, beforeEach } from 'vitest'
import { useTabsStore } from './tabs-store'

describe('useTabsStore', () => {
  beforeEach(() => {
    useTabsStore.setState({
      tabs: [],
      activeTabId: null,
      closedTabs: [],
      groups: [],
    })
  })

  describe('addTab', () => {
    it('should add a new tab', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test Tab',
        icon: 'icon',
      })

      const state = useTabsStore.getState()
      expect(state.tabs).toHaveLength(1)
      expect(state.tabs[0].id).toBe(tabId)
      expect(state.tabs[0].path).toBe('/test')
      expect(state.tabs[0].title).toBe('Test Tab')
    })

    it('should return the tab id', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      expect(typeof tabId).toBe('string')
      expect(tabId).toContain('tab-')
    })

    it('should allow more than 8 tabs (no hard limit)', () => {
      for (let i = 0; i < 12; i++) {
        useTabsStore.getState().addTab({
          path: `/test-${i}`,
          title: `Tab ${i}`,
          icon: 'icon',
        })
      }

      expect(useTabsStore.getState().tabs.length).toBe(12)
    })
  })

  describe('removeTab', () => {
    it('should remove a tab by id', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      useTabsStore.getState().removeTab(tabId)
      expect(useTabsStore.getState().tabs).toHaveLength(0)
    })

    it('should move removed tab to closedTabs', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      useTabsStore.getState().removeTab(tabId)
      expect(useTabsStore.getState().closedTabs.length).toBeGreaterThan(0)
    })
  })

  describe('setActiveTab', () => {
    it('should set active tab', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      useTabsStore.getState().setActiveTab(tabId)
      expect(useTabsStore.getState().activeTabId).toBe(tabId)
    })
  })

  describe('updateTab', () => {
    it('should update tab properties', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Original',
        icon: 'icon',
      })

      useTabsStore.getState().updateTab(tabId, { title: 'Updated' })
      const tab = useTabsStore.getState().tabs.find((t) => t.id === tabId)
      expect(tab?.title).toBe('Updated')
    })

    it('should keep other properties unchanged', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Original',
        icon: 'icon',
      })

      useTabsStore.getState().updateTab(tabId, { title: 'Updated' })
      const tab = useTabsStore.getState().tabs.find((t) => t.id === tabId)
      expect(tab?.path).toBe('/test')
      expect(tab?.icon).toBe('icon')
    })
  })

  describe('getTabByPath', () => {
    it('should find tab by path', () => {
      useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      const tab = useTabsStore.getState().getTabByPath('/test')
      expect(tab).toBeDefined()
      expect(tab?.path).toBe('/test')
    })

    it('should return undefined for non-existent path', () => {
      const tab = useTabsStore.getState().getTabByPath('/nonexistent')
      expect(tab).toBeUndefined()
    })
  })

  describe('isTabOpen', () => {
    it('should return true if tab is open', () => {
      useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      expect(useTabsStore.getState().isTabOpen('/test')).toBe(true)
    })

    it('should return false if tab is not open', () => {
      expect(useTabsStore.getState().isTabOpen('/nonexistent')).toBe(false)
    })
  })

  describe('getActiveTab', () => {
    it('should return active tab', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      useTabsStore.getState().setActiveTab(tabId)
      const activeTab = useTabsStore.getState().getActiveTab()
      expect(activeTab?.id).toBe(tabId)
    })

    it('should return undefined if no active tab', () => {
      const activeTab = useTabsStore.getState().getActiveTab()
      expect(activeTab).toBeUndefined()
    })
  })

  describe('closeAllTabs', () => {
    it('should close all tabs', () => {
      useTabsStore.getState().addTab({
        path: '/test1',
        title: 'Test 1',
        icon: 'icon',
      })
      useTabsStore.getState().addTab({
        path: '/test2',
        title: 'Test 2',
        icon: 'icon',
      })

      useTabsStore.getState().closeAllTabs()
      expect(useTabsStore.getState().tabs).toHaveLength(0)
    })
  })

  describe('restoreLastClosedTab', () => {
    it('should restore last closed tab', () => {
      const tabId = useTabsStore.getState().addTab({
        path: '/test',
        title: 'Test',
        icon: 'icon',
      })

      useTabsStore.getState().removeTab(tabId)
      const restored = useTabsStore.getState().restoreLastClosedTab()

      expect(restored).toBeDefined()
      expect(restored?.path).toBe('/test')
    })

    it('should return null if no closed tabs', () => {
      const restored = useTabsStore.getState().restoreLastClosedTab()
      expect(restored).toBeNull()
    })
  })

  describe('pinTab', () => {
    it('should pin a tab', () => {
      const id = useTabsStore.getState().addTab({ path: '/test', title: 'Test', icon: 'icon' })
      useTabsStore.getState().pinTab(id)
      const tab = useTabsStore.getState().tabs.find(t => t.id === id)
      expect(tab?.pinned).toBe(true)
    })

    it('should unpin a tab', () => {
      const id = useTabsStore.getState().addTab({ path: '/test', title: 'Test', icon: 'icon' })
      useTabsStore.getState().pinTab(id)
      useTabsStore.getState().unpinTab(id)
      const tab = useTabsStore.getState().tabs.find(t => t.id === id)
      expect(tab?.pinned).toBe(false)
    })

    it('should toggle pin', () => {
      const id = useTabsStore.getState().addTab({ path: '/test', title: 'Test', icon: 'icon' })
      useTabsStore.getState().togglePinTab(id)
      expect(useTabsStore.getState().tabs.find(t => t.id === id)?.pinned).toBe(true)
      useTabsStore.getState().togglePinTab(id)
      expect(useTabsStore.getState().tabs.find(t => t.id === id)?.pinned).toBe(false)
    })

    it('should not close a pinned tab with removeTab', () => {
      const id = useTabsStore.getState().addTab({ path: '/test', title: 'Test', icon: 'icon' })
      useTabsStore.getState().pinTab(id)
      useTabsStore.getState().removeTab(id)
      expect(useTabsStore.getState().tabs.find(t => t.id === id)).toBeDefined()
    })

    it('should keep pinned tabs on closeAllTabs', () => {
      const id1 = useTabsStore.getState().addTab({ path: '/test1', title: 'Test 1', icon: 'icon' })
      useTabsStore.getState().addTab({ path: '/test2', title: 'Test 2', icon: 'icon' })
      useTabsStore.getState().pinTab(id1)
      useTabsStore.getState().closeAllTabs()
      expect(useTabsStore.getState().tabs).toHaveLength(1)
      expect(useTabsStore.getState().tabs[0].id).toBe(id1)
    })
  })

  describe('tab groups', () => {
    it('should create a group', () => {
      useTabsStore.getState().createGroup('My Group', 'blue')
      const groups = useTabsStore.getState().groups
      expect(groups).toHaveLength(1)
      expect(groups[0].label).toBe('My Group')
      expect(groups[0].color).toBe('blue')
    })

    it('should assign tab to group', () => {
      const id = useTabsStore.getState().addTab({ path: '/test', title: 'Test', icon: 'icon' })
      useTabsStore.getState().createGroup('Group', 'red')
      const groupId = useTabsStore.getState().groups[0].id
      useTabsStore.getState().assignTabToGroup(id, groupId)
      const tab = useTabsStore.getState().tabs.find(t => t.id === id)
      expect(tab?.groupId).toBe(groupId)
    })

    it('should remove tab from group', () => {
      const id = useTabsStore.getState().addTab({ path: '/test', title: 'Test', icon: 'icon' })
      useTabsStore.getState().createGroup('Group', 'red')
      const groupId = useTabsStore.getState().groups[0].id
      useTabsStore.getState().assignTabToGroup(id, groupId)
      useTabsStore.getState().assignTabToGroup(id, null)
      const tab = useTabsStore.getState().tabs.find(t => t.id === id)
      expect(tab?.groupId).toBeNull()
    })

    it('should remove a group', () => {
      useTabsStore.getState().createGroup('Group', 'red')
      const groupId = useTabsStore.getState().groups[0].id
      useTabsStore.getState().removeGroup(groupId)
      expect(useTabsStore.getState().groups).toHaveLength(0)
    })
  })

  describe('closeTabsToRight', () => {
    it('should close tabs to the right of the given tab', () => {
      const id1 = useTabsStore.getState().addTab({ path: '/test1', title: 'Test 1', icon: 'icon' })
      useTabsStore.getState().addTab({ path: '/test2', title: 'Test 2', icon: 'icon' })
      useTabsStore.getState().addTab({ path: '/test3', title: 'Test 3', icon: 'icon' })
      useTabsStore.getState().closeTabsToRight(id1)
      expect(useTabsStore.getState().tabs).toHaveLength(1)
      expect(useTabsStore.getState().tabs[0].id).toBe(id1)
    })

    it('should not close pinned tabs to the right', () => {
      const id1 = useTabsStore.getState().addTab({ path: '/test1', title: 'Test 1', icon: 'icon' })
      const id2 = useTabsStore.getState().addTab({ path: '/test2', title: 'Test 2', icon: 'icon' })
      useTabsStore.getState().addTab({ path: '/test3', title: 'Test 3', icon: 'icon' })
      useTabsStore.getState().pinTab(id2)
      useTabsStore.getState().closeTabsToRight(id1)
      expect(useTabsStore.getState().tabs).toHaveLength(2)
      expect(useTabsStore.getState().tabs.map(t => t.id)).toContain(id2)
    })
  })
})
