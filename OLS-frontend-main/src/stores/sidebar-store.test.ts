import { describe, it, expect, beforeEach } from 'vitest'
import { useSidebarStore } from './sidebar-store'

describe('useSidebarStore', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: false })
  })

  describe('initialization', () => {
    it('should initialize with sidebar closed', () => {
      expect(useSidebarStore.getState().isOpen).toBe(false)
    })
  })

  describe('setOpen', () => {
    it('should set sidebar to open', () => {
      useSidebarStore.getState().setOpen(true)
      expect(useSidebarStore.getState().isOpen).toBe(true)
    })

    it('should set sidebar to closed', () => {
      useSidebarStore.setState({ isOpen: true })
      useSidebarStore.getState().setOpen(false)
      expect(useSidebarStore.getState().isOpen).toBe(false)
    })
  })

  describe('toggle', () => {
    it('should toggle from closed to open', () => {
      useSidebarStore.setState({ isOpen: false })
      useSidebarStore.getState().toggle()
      expect(useSidebarStore.getState().isOpen).toBe(true)
    })

    it('should toggle from open to closed', () => {
      useSidebarStore.setState({ isOpen: true })
      useSidebarStore.getState().toggle()
      expect(useSidebarStore.getState().isOpen).toBe(false)
    })

    it('should toggle multiple times', () => {
      const initial = useSidebarStore.getState().isOpen
      useSidebarStore.getState().toggle()
      useSidebarStore.getState().toggle()
      expect(useSidebarStore.getState().isOpen).toBe(initial)
    })
  })
})
