import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE DETAIL STORE - Registre contextuel pour le detail panel
// Supporte multi-group : chaque editor group (main, split) peut avoir
// son propre detail panel ouvert dans la secondary sidebar.
//
// Les modules s'enregistrent via register(reg, groupId).
// La SecondarySidebar lit les registrations et affiche 1 ou 2 portal targets.
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_GROUP_ID = 'main';
export const SPLIT_GROUP_ID = 'split';

export interface ModuleDetailRegistration {
  /** Unique module key, e.g. 'bacteriology' */
  moduleKey: string;
  /** Translated module title shown as panel subtitle */
  moduleTitle: string;
  /** Accent color of the module */
  accentColor: string;
  /** Whether the detail panel is currently open (an item is selected) */
  isOpen: boolean;
}

interface ModuleDetailState {
  /** Per-group registrations (groupId → registration) */
  registrations: Record<string, ModuleDetailRegistration>;
  /** Per-group DOM portal targets (groupId → HTMLDivElement) */
  portalTargets: Record<string, HTMLDivElement | null>;

  /** Register a module's detail panel for a specific group */
  register: (reg: ModuleDetailRegistration, groupId?: string) => void;
  /** Update the open state for a module in a specific group */
  setOpen: (moduleKey: string, isOpen: boolean, groupId?: string) => void;
  /** Unregister (called on unmount) */
  unregister: (moduleKey: string, groupId?: string) => void;
  /** Set the portal target DOM node for a group */
  setPortalTarget: (el: HTMLDivElement | null, groupId?: string) => void;

  /** Check if any group has an open detail */
  isAnyOpen: () => boolean;
  /** Get registration for a specific group */
  getRegistration: (groupId: string) => ModuleDetailRegistration | null;
  /** Get portal target for a specific group */
  getPortalTarget: (groupId: string) => HTMLDivElement | null;

  // ── Legacy single-value accessors (backwards compat) ──
  /** Shorthand: registration for 'main' group */
  getMainRegistration: () => ModuleDetailRegistration | null;
  /** Shorthand: portal target for 'main' group */
  getMainPortalTarget: () => HTMLDivElement | null;
}

export const useModuleDetailStore = create<ModuleDetailState>()((set, get) => ({
  registrations: {},
  portalTargets: {},

  register: (reg, groupId = DEFAULT_GROUP_ID) => {
    set((state) => ({
      registrations: { ...state.registrations, [groupId]: reg },
    }));
  },

  setOpen: (moduleKey, isOpen, groupId = DEFAULT_GROUP_ID) => {
    const current = get().registrations[groupId];
    if (current?.moduleKey === moduleKey) {
      set((state) => ({
        registrations: {
          ...state.registrations,
          [groupId]: { ...current, isOpen },
        },
      }));
    }
  },

  unregister: (moduleKey, groupId = DEFAULT_GROUP_ID) => {
    const current = get().registrations[groupId];
    if (current?.moduleKey === moduleKey) {
      set((state) => {
        const { [groupId]: _, ...rest } = state.registrations;
        return { registrations: rest };
      });
    }
  },

  setPortalTarget: (el, groupId = DEFAULT_GROUP_ID) => {
    set((state) => ({
      portalTargets: { ...state.portalTargets, [groupId]: el },
    }));
  },

  isAnyOpen: () => {
    return Object.values(get().registrations).some((r) => r?.isOpen);
  },

  getRegistration: (groupId) => {
    return get().registrations[groupId] ?? null;
  },

  getPortalTarget: (groupId) => {
    return get().portalTargets[groupId] ?? null;
  },

  getMainRegistration: () => {
    return get().registrations[DEFAULT_GROUP_ID] ?? null;
  },

  getMainPortalTarget: () => {
    return get().portalTargets[DEFAULT_GROUP_ID] ?? null;
  },
}));
