import { describe, it, expect, beforeEach } from 'vitest';
import { useModuleDetailStore } from './module-detail-store';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE DETAIL STORE TESTS (multi-group API)
// ═══════════════════════════════════════════════════════════════════════════

/** Helper to build a registration with defaults for moduleTitle / accentColor */
function reg(moduleKey: string, isOpen: boolean) {
  return { moduleKey, moduleTitle: moduleKey, accentColor: '#888', isOpen };
}

describe('useModuleDetailStore', () => {
  beforeEach(() => {
    useModuleDetailStore.setState({
      registrations: {},
      portalTargets: {},
    });
  });

  describe('initialization', () => {
    it('should initialize with empty registrations', () => {
      expect(useModuleDetailStore.getState().registrations).toEqual({});
    });

    it('should initialize with empty portalTargets', () => {
      expect(useModuleDetailStore.getState().portalTargets).toEqual({});
    });
  });

  describe('register', () => {
    it('should register a module detail panel in the default group', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', false));

      const r = useModuleDetailStore.getState().getMainRegistration();
      expect(r?.moduleKey).toBe('bacteriology');
      expect(r?.isOpen).toBe(false);
    });

    it('should register in a specific group', () => {
      useModuleDetailStore.getState().register(reg('mycology', true), 'split');

      const r = useModuleDetailStore.getState().getRegistration('split');
      expect(r?.moduleKey).toBe('mycology');
      expect(r?.isOpen).toBe(true);
      expect(useModuleDetailStore.getState().getMainRegistration()).toBeNull();
    });

    it('should replace existing registration in the same group', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', false));
      useModuleDetailStore.getState().register(reg('mycology', true));

      expect(useModuleDetailStore.getState().getMainRegistration()?.moduleKey).toBe('mycology');
      expect(useModuleDetailStore.getState().getMainRegistration()?.isOpen).toBe(true);
    });
  });

  describe('setOpen', () => {
    it('should update isOpen for the matching module', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', false));
      useModuleDetailStore.getState().setOpen('bacteriology', true);

      expect(useModuleDetailStore.getState().getMainRegistration()?.isOpen).toBe(true);
    });

    it('should NOT update if moduleKey does not match', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', false));
      useModuleDetailStore.getState().setOpen('mycology', true);

      expect(useModuleDetailStore.getState().getMainRegistration()?.isOpen).toBe(false);
    });

    it('should toggle back to false', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', true));
      useModuleDetailStore.getState().setOpen('bacteriology', false);

      expect(useModuleDetailStore.getState().getMainRegistration()?.isOpen).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should unregister matching module', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', true));
      useModuleDetailStore.getState().unregister('bacteriology');

      expect(useModuleDetailStore.getState().getMainRegistration()).toBeNull();
    });

    it('should NOT unregister if key does not match', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', false));
      useModuleDetailStore.getState().unregister('mycology');

      expect(useModuleDetailStore.getState().getMainRegistration()).not.toBeNull();
    });

    it('should be safe to unregister when nothing is registered', () => {
      useModuleDetailStore.getState().unregister('anything');
      expect(useModuleDetailStore.getState().getMainRegistration()).toBeNull();
    });
  });

  describe('setPortalTarget', () => {
    it('should set a DOM element as portal target for default group', () => {
      const el = document.createElement('div');
      useModuleDetailStore.getState().setPortalTarget(el);
      expect(useModuleDetailStore.getState().getMainPortalTarget()).toBe(el);
    });

    it('should set portal target to null', () => {
      const el = document.createElement('div');
      useModuleDetailStore.getState().setPortalTarget(el);
      useModuleDetailStore.getState().setPortalTarget(null);
      expect(useModuleDetailStore.getState().getMainPortalTarget()).toBeNull();
    });
  });

  describe('isAnyOpen', () => {
    it('should return false when no registrations', () => {
      expect(useModuleDetailStore.getState().isAnyOpen()).toBe(false);
    });

    it('should return true when any group has an open detail', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', true));
      expect(useModuleDetailStore.getState().isAnyOpen()).toBe(true);
    });

    it('should return false when all details are closed', () => {
      useModuleDetailStore.getState().register(reg('bacteriology', false));
      expect(useModuleDetailStore.getState().isAnyOpen()).toBe(false);
    });
  });
});
