import { describe, it, expect, beforeEach } from 'vitest';
import { useModuleToolbarStore } from './module-toolbar-store';
import type { ModuleAction } from '@/lib/module-registry/types';

const noop = () => {};

function makeAction(overrides: Partial<ModuleAction> = {}): ModuleAction {
  return {
    id: 'test-action',
    labelKey: 'test.action',
    icon: 'plus',
    placement: 'menu',
    mobile: true,
    action: noop,
    ...overrides,
  };
}

function makeRegistration(overrides = {}) {
  return {
    moduleKey: 'bacteriology',
    actions: [makeAction()],
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
    it('should register a toolbar with actions', () => {
      const reg = makeRegistration();
      useModuleToolbarStore.getState().register(reg);
      expect(useModuleToolbarStore.getState().registration).toEqual(reg);
      expect(useModuleToolbarStore.getState().registration?.actions).toHaveLength(1);
    });

    it('should replace existing registration', () => {
      useModuleToolbarStore.getState().register(makeRegistration({ moduleKey: 'a' }));
      useModuleToolbarStore.getState().register(makeRegistration({ moduleKey: 'b' }));
      expect(useModuleToolbarStore.getState().registration?.moduleKey).toBe('b');
    });

    it('should register with multiple actions', () => {
      const actions = [
        makeAction({ id: 'view-mode', placement: 'menu' }),
        makeAction({ id: 'export', placement: 'menu' }),
        makeAction({ id: 'new-item', placement: 'toolbar' }),
      ];
      useModuleToolbarStore.getState().register({ moduleKey: 'notes', actions });
      expect(useModuleToolbarStore.getState().registration?.actions).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update matching module actions', () => {
      useModuleToolbarStore.getState().register(makeRegistration());
      const newActions = [makeAction({ id: 'updated' })];
      useModuleToolbarStore.getState().update('bacteriology', { actions: newActions });
      expect(useModuleToolbarStore.getState().registration?.actions[0].id).toBe('updated');
    });

    it('should NOT update if moduleKey does not match', () => {
      useModuleToolbarStore.getState().register(makeRegistration());
      useModuleToolbarStore.getState().update('other', { actions: [] });
      expect(useModuleToolbarStore.getState().registration?.actions).toHaveLength(1);
    });

    it('should be safe when nothing is registered', () => {
      useModuleToolbarStore.getState().update('bacteriology', { actions: [] });
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
