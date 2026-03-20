import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE TOOLBAR STORE
//
// Registers the active module's toolbar capabilities so shell-level
// components (Breadcrumbs → filter toggle, Menu Bar → Module menu)
// can display actions and react to them without prop-drilling.
//
// Each module registers on mount and unregisters on unmount.
// Only ONE module can be registered at a time (single page active).
// ═══════════════════════════════════════════════════════════════════════════

export interface ModuleToolbarRegistration {
  moduleKey: string;
  hasCardView: boolean;
  hasCompare: boolean;
  hasExport: boolean;
  isCompareMode: boolean;
  canExport: boolean;
  onToggleViewMode: () => void;
  onToggleCompareMode: () => void;
  onExport: () => void;
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
