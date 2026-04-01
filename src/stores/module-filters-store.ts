import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE FILTERS STORE - Registre contextuel des filtres de module
// Supporte multi-group : chaque editor group (main, split) peut avoir
// ses propres filtres affichés dans la GlobalSidebar.
//
// Les modules s'enregistrent via register(reg, groupId).
// Le panneau Filters de la GlobalSidebar lit les registrations et
// affiche 1 ou 2 portal targets selon le mode split.
//
// `filterPanelOpen` remembers per-module whether the filters panel was
// open when the user last left the module. On re-enter, the panel is
// restored to that state (closed by default on first visit).
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_GROUP_ID = 'main';
export const SPLIT_GROUP_ID = 'split';

/** Metadata for a sidebar section (filters, identification, custom) */
export interface SidebarSectionMeta {
  id: string;
  labelKey: string;
}

export interface ModuleFiltersRegistration {
  /** Unique module key, e.g. 'bacteriology' */
  moduleKey: string;
  /** Translated module title shown as panel subtitle */
  moduleTitle: string;
  /** Accent color of the module */
  accentColor: string;
  /** React node for the filter panel content (search + filters + tools) */
  content: ReactNode;
  /** Sidebar sections declared by the module */
  sidebarSections: SidebarSectionMeta[];
}

/** Config for inline toolbar search (when no sidebar exists) */
export interface ToolbarSearchConfig {
  query: string;
  setQuery: (v: string) => void;
  placeholder: string;
}

interface ModuleFiltersState {
  /** Per-group registrations (groupId → registration) */
  registrations: Record<string, ModuleFiltersRegistration>;
  /** Per-group DOM portal targets (groupId → HTMLDivElement) */
  portalTargets: Record<string, HTMLDivElement | null>;
  /** Per-module memory: was the filters panel open last time the user left? */
  filterPanelOpen: Record<string, boolean>;

  /** Toolbar search config — set when search should appear inline in toolbar */
  toolbarSearch: ToolbarSearchConfig | null;
  /** Set or clear toolbar search */
  setToolbarSearch: (config: ToolbarSearchConfig | null) => void;

  /** Register filters for a module (called on mount) */
  register: (reg: ModuleFiltersRegistration, groupId?: string) => void;
  /** Unregister filters (called on unmount) */
  unregister: (moduleKey: string, groupId?: string) => void;
  /** Set the portal target DOM node for a group */
  setPortalTarget: (el: HTMLDivElement | null, groupId?: string) => void;
  /** Remember whether the filters panel was open for a module */
  setFilterPanelOpen: (moduleKey: string, open: boolean) => void;

  /** Groups manually hidden via the zone X button */
  hiddenGroups: Set<string>;
  /** Hide a specific group's zone (X button) */
  hideGroup: (groupId: string) => void;
  /** Restore a specific group's zone (toolbar button) */
  unhideGroup: (groupId: string) => void;
  /** Restore all hidden groups (called on register) */
  clearHidden: () => void;
  /** Show only the given group, hiding all others — used by ModuleToolbar */
  showOnlyGroup: (groupId: string) => void;

  /** Get registration for a specific group */
  getRegistration: (groupId: string) => ModuleFiltersRegistration | null;
  /** Get portal target for a specific group */
  getPortalTarget: (groupId: string) => HTMLDivElement | null;
  /** Check if any group has filters registered */
  hasAnyRegistration: () => boolean;

  // ── Legacy single-value accessors (backwards compat) ──
  /** Shorthand: registration for 'main' group */
  getMainRegistration: () => ModuleFiltersRegistration | null;
  /** Shorthand: portal target for 'main' group */
  getMainPortalTarget: () => HTMLDivElement | null;
}

export const useModuleFiltersStore = create<ModuleFiltersState>()(
  persist(
    (set, get) => ({
      registrations: {},
      portalTargets: {},
      filterPanelOpen: {},
      hiddenGroups: new Set<string>(),
      toolbarSearch: null,

      setToolbarSearch: (config) => set({ toolbarSearch: config }),

      register: (reg, groupId = DEFAULT_GROUP_ID) => {
        set((state) => ({
          registrations: { ...state.registrations, [groupId]: reg },
          // Re-registering a group makes it visible again
          hiddenGroups: new Set([...state.hiddenGroups].filter((g) => g !== groupId)),
        }));
      },

      hideGroup: (groupId) => {
        set((state) => ({
          hiddenGroups: new Set([...state.hiddenGroups, groupId]),
        }));
      },

      unhideGroup: (groupId) => {
        set((state) => ({
          hiddenGroups: new Set([...state.hiddenGroups].filter((g) => g !== groupId)),
        }));
      },

      clearHidden: () => {
        set({ hiddenGroups: new Set<string>() });
      },

      showOnlyGroup: (groupId) => {
        set((state) => ({
          hiddenGroups: new Set(
            Object.keys(state.registrations).filter((g) => g !== groupId)
          ),
        }));
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

      setFilterPanelOpen: (moduleKey, open) => {
        set((state) => ({
          filterPanelOpen: { ...state.filterPanelOpen, [moduleKey]: open },
        }));
      },

      getRegistration: (groupId) => {
        return get().registrations[groupId] ?? null;
      },

      getPortalTarget: (groupId) => {
        return get().portalTargets[groupId] ?? null;
      },

      hasAnyRegistration: () => {
        return Object.keys(get().registrations).length > 0;
      },

      getMainRegistration: () => {
        return get().registrations[DEFAULT_GROUP_ID] ?? null;
      },

      getMainPortalTarget: () => {
        return get().portalTargets[DEFAULT_GROUP_ID] ?? null;
      },
    }),
    {
      name: 'ols-module-filters',
      version: 2,
      // Only persist filterPanelOpen (registrations & portalTargets are runtime-only)
      partialize: (state) => ({ filterPanelOpen: state.filterPanelOpen }),
    }
  )
);
