import { create } from 'zustand';
import type { ModuleAction } from '@/lib/module-registry/types';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE TOOLBAR STORE
//
// Registers the active module's toolbar/menu actions so shell-level
// components (ModuleToolbar, Menu Bar, ModuleHeader) can display them
// generically without knowing which module is active.
//
// Each module registers on mount and unregisters on unmount.
// Only ONE module can be registered at a time (single page active).
//
// Actions use the ModuleAction interface from module-registry/types.ts:
//   - placement: 'toolbar' (breadcrumbs row), 'menu' (menu bar), or 'both'
//   - mobile: whether to show in ModuleHeader overflow menu
//   - isActive/isDisabled: reactive state callbacks
// ═══════════════════════════════════════════════════════════════════════════

export interface ModuleToolbarRegistration {
  moduleKey: string;
  actions: ModuleAction[];
}

interface ModuleToolbarState {
  registration: ModuleToolbarRegistration | null;

  register: (reg: ModuleToolbarRegistration) => void;
  update: (moduleKey: string, partial: Partial<ModuleToolbarRegistration>) => void;
  unregister: (moduleKey: string) => void;
}

export const useModuleToolbarStore = create<ModuleToolbarState>()((set) => ({
  registration: null,

  register: (reg) => set({ registration: reg }),

  update: (moduleKey, partial) =>
    set((state) => {
      if (!state.registration || state.registration.moduleKey !== moduleKey) return state;
      return { registration: { ...state.registration, ...partial } };
    }),

  unregister: (moduleKey) =>
    set((state) => {
      if (state.registration?.moduleKey !== moduleKey) return state;
      return { registration: null };
    }),
}));
