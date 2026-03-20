import { describe, it, expect, beforeEach } from 'vitest';
import { useModuleToolbarStore } from './module-toolbar-store';

const noop = () => {};

function makeRegistration(overrides = {}) {
  return {
    moduleKey: 'bacteriology',
    hasCardView: true,
    hasCompare: true,
    hasExport: true,
    isCompareMode: false,
    canExport: true,
    onToggleViewMode: noop,
    onToggleCompareMode: noop,
    onExport: noop,
    ...overrides,
  };
}

describe('useModuleToolbarStore', () => {
  beforeEach(() => {
    useModuleToolbarStore.setState({ registration: null });
  });

  describe('initialization', () => {
    it('should initialize with null registration', () => {
      expect(useModuleToolbarStore.getState().registration).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a toolbar', () => {
      const reg = makeRegistration();
      useModuleToolbarStore.getState().register(reg);
      expect(useModuleToolbarStore.getState().registration).toEqual(reg);
    });

    it('should replace existing registration', () => {
      useModuleToolbarStore.getState().register(makeRegistration({ moduleKey: 'a' }));
      useModuleToolbarStore.getState().register(makeRegistration({ moduleKey: 'b' }));
      expect(useModuleToolbarStore.getState().registration?.moduleKey).toBe('b');
    });
  });

  describe('update', () => {
    it('should update matching module', () => {
      useModuleToolbarStore.getState().register(makeRegistration({ isCompareMode: false }));
      useModuleToolbarStore.getState().update('bacteriology', { isCompareMode: true });
      expect(useModuleToolbarStore.getState().registration?.isCompareMode).toBe(true);
    });

    it('should NOT update if moduleKey does not match', () => {
      useModuleToolbarStore.getState().register(makeRegistration({ isCompareMode: false }));
      useModuleToolbarStore.getState().update('other', { isCompareMode: true });
      expect(useModuleToolbarStore.getState().registration?.isCompareMode).toBe(false);
    });

    it('should be safe when nothing is registered', () => {
      useModuleToolbarStore.getState().update('bacteriology', { isCompareMode: true });
      expect(useModuleToolbarStore.getState().registration).toBeNull();
    });
  });

  describe('unregister', () => {
    it('should unregister matching module', () => {
      useModuleToolbarStore.getState().register(makeRegistration());
      useModuleToolbarStore.getState().unregister('bacteriology');
      expect(useModuleToolbarStore.getState().registration).toBeNull();
    });

    it('should NOT unregister if key does not match', () => {
      useModuleToolbarStore.getState().register(makeRegistration());
      useModuleToolbarStore.getState().unregister('other');
      expect(useModuleToolbarStore.getState().registration).not.toBeNull();
    });

    it('should be safe when nothing is registered', () => {
      useModuleToolbarStore.getState().unregister('bacteriology');
      expect(useModuleToolbarStore.getState().registration).toBeNull();
    });
  });
});
