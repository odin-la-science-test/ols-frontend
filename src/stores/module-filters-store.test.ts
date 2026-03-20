import { describe, it, expect, beforeEach } from 'vitest';
import { useModuleFiltersStore } from './module-filters-store';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE FILTERS STORE TESTS (multi-group API)
// ═══════════════════════════════════════════════════════════════════════════

describe('useModuleFiltersStore', () => {
  beforeEach(() => {
    // Reset to initial state
    useModuleFiltersStore.setState({
      registrations: {},
      portalTargets: {},
      filterPanelOpen: {},
    });
  });

  describe('initialization', () => {
    it('should initialize with empty registrations', () => {
      const { registrations } = useModuleFiltersStore.getState();
      expect(registrations).toEqual({});
    });

    it('should initialize with empty portalTargets', () => {
      const { portalTargets } = useModuleFiltersStore.getState();
      expect(portalTargets).toEqual({});
    });
  });

  describe('register', () => {
    it('should register module filters in the default group', () => {
      const reg = {
        moduleKey: 'bacteriology',
        moduleTitle: 'Bacteriology',
        accentColor: '#8b5cf6',
        content: null,
      };

      useModuleFiltersStore.getState().register(reg);
      const registration = useModuleFiltersStore.getState().getMainRegistration();

      expect(registration).toEqual(reg);
    });

    it('should replace existing registration in the same group', () => {
      const reg1 = {
        moduleKey: 'bacteriology',
        moduleTitle: 'Bacteriology',
        accentColor: '#8b5cf6',
        content: null,
      };
      const reg2 = {
        moduleKey: 'mycology',
        moduleTitle: 'Mycology',
        accentColor: '#10b981',
        content: null,
      };

      useModuleFiltersStore.getState().register(reg1);
      useModuleFiltersStore.getState().register(reg2);
      const registration = useModuleFiltersStore.getState().getMainRegistration();

      expect(registration?.moduleKey).toBe('mycology');
    });

    it('should register in a specific group', () => {
      const reg = {
        moduleKey: 'bacteriology',
        moduleTitle: 'Bacteriology',
        accentColor: '#8b5cf6',
        content: null,
      };

      useModuleFiltersStore.getState().register(reg, 'split');

      expect(useModuleFiltersStore.getState().getRegistration('split')).toEqual(reg);
      expect(useModuleFiltersStore.getState().getMainRegistration()).toBeNull();
    });
  });

  describe('unregister', () => {
    it('should unregister matching module', () => {
      const reg = {
        moduleKey: 'bacteriology',
        moduleTitle: 'Bacteriology',
        accentColor: '#8b5cf6',
        content: null,
      };

      useModuleFiltersStore.getState().register(reg);
      useModuleFiltersStore.getState().unregister('bacteriology');
      const registration = useModuleFiltersStore.getState().getMainRegistration();

      expect(registration).toBeNull();
    });

    it('should NOT unregister if key does not match', () => {
      const reg = {
        moduleKey: 'bacteriology',
        moduleTitle: 'Bacteriology',
        accentColor: '#8b5cf6',
        content: null,
      };

      useModuleFiltersStore.getState().register(reg);
      useModuleFiltersStore.getState().unregister('mycology');
      const registration = useModuleFiltersStore.getState().getMainRegistration();

      expect(registration).not.toBeNull();
      expect(registration?.moduleKey).toBe('bacteriology');
    });

    it('should be safe to unregister when nothing is registered', () => {
      useModuleFiltersStore.getState().unregister('anything');
      const registration = useModuleFiltersStore.getState().getMainRegistration();
      expect(registration).toBeNull();
    });
  });

  describe('setPortalTarget', () => {
    it('should set a DOM element as portal target for default group', () => {
      const el = document.createElement('div');
      useModuleFiltersStore.getState().setPortalTarget(el);
      const portalTarget = useModuleFiltersStore.getState().getMainPortalTarget();
      expect(portalTarget).toBe(el);
    });

    it('should set portal target to null', () => {
      const el = document.createElement('div');
      useModuleFiltersStore.getState().setPortalTarget(el);
      useModuleFiltersStore.getState().setPortalTarget(null);
      const portalTarget = useModuleFiltersStore.getState().getMainPortalTarget();
      expect(portalTarget).toBeNull();
    });
  });

  describe('hasAnyRegistration', () => {
    it('should return false when no registrations', () => {
      expect(useModuleFiltersStore.getState().hasAnyRegistration()).toBe(false);
    });

    it('should return true when any group has a registration', () => {
      useModuleFiltersStore.getState().register({
        moduleKey: 'bacteriology',
        moduleTitle: 'Bacteriology',
        accentColor: '#8b5cf6',
        content: null,
      });
      expect(useModuleFiltersStore.getState().hasAnyRegistration()).toBe(true);
    });
  });

  describe('filterPanelOpen', () => {
    it('should remember panel open state per module', () => {
      useModuleFiltersStore.getState().setFilterPanelOpen('bacteriology', true);
      expect(useModuleFiltersStore.getState().filterPanelOpen['bacteriology']).toBe(true);
    });
  });
});
