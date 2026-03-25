import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ComponentType } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM PANEL STORE - Panneau inférieur style VS Code (Output/Terminal)
// Affiche un log d'activité, tâches en cours, ou notes rapides.
// Persisté en localStorage (visibilité + taille)
//
// Supports dynamic module tabs: modules register contextual tabs on mount
// and unregister on unmount, like VS Code extensions adding Output channels.
// ═══════════════════════════════════════════════════════════════════════════

/** Built-in tabs that are always present */
export type BuiltinTab = 'activity';

/** Tab id = builtin id OR dynamic module tab id */
export type BottomPanelTab = BuiltinTab | string;

/** Panel alignment — how the bottom panel spans relative to sidebars */
export type BottomPanelAlignment = 'center' | 'left' | 'right' | 'justify';

export interface ActivityLogEntry {
  id: string;
  type: 'navigation' | 'action' | 'data' | 'system';
  message: string;
  detail?: string;
  timestamp: number;
  icon?: string;
  /** Module accent color for visual grouping */
  accentColor?: string;
}

/**
 * A dynamic tab registered by a module.
 * The component is rendered lazily when the tab is active.
 */
export interface DynamicBottomTab {
  /** Unique tab id, e.g. 'bacteriology-gram-overview' */
  id: string;
  /** Translation key for the tab label */
  labelKey: string;
  /** Lucide icon name */
  icon: string;
  /** Module that owns this tab (for cleanup) */
  moduleKey: string;
  /** Accent color of the module */
  accentColor?: string;
  /** React component rendered as tab content */
  component: ComponentType;
  /** Sort priority — lower = further left (default 10) */
  priority?: number;
}

interface BottomPanelState {
  /** Whether the bottom panel is visible */
  visible: boolean;
  /** Active tab in the bottom panel */
  activeTab: BottomPanelTab;
  /** Panel height in pixels (persisted) */
  panelHeight: number;
  /** Panel alignment relative to sidebars */
  alignment: BottomPanelAlignment;
  /** Activity log entries (kept in memory, not persisted) */
  activityLog: ActivityLogEntry[];
  /** Maximum entries to keep */
  maxEntries: number;
  /** Dynamic tabs registered by modules */
  dynamicTabs: DynamicBottomTab[];
  /** IDs of tabs hidden by user via context menu */
  hiddenTabs: Set<string>;

  // Actions
  setVisible: (visible: boolean) => void;
  toggleVisible: () => void;
  setActiveTab: (tab: BottomPanelTab) => void;
  setPanelHeight: (height: number) => void;
  setAlignment: (alignment: BottomPanelAlignment) => void;
  addLogEntry: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  clearLog: () => void;

  /** Register a dynamic tab (module mount) */
  registerTab: (tab: DynamicBottomTab) => void;
  /** Unregister a dynamic tab by id (module unmount) */
  unregisterTab: (tabId: string) => void;
  /** Unregister all tabs for a module */
  unregisterModule: (moduleKey: string) => void;
  /** Toggle a tab's hidden state via context menu */
  toggleTabHidden: (tabId: string) => void;
  /** Reorder dynamic tabs (from D\&D) */
  reorderDynamicTabs: (orderedIds: string[]) => void;
}

const generateEntryId = () => `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export const useBottomPanelStore = create<BottomPanelState>()(
  persist(
    (set) => ({
      visible: false,
      activeTab: 'activity',
      panelHeight: 200,
      alignment: 'center',
      activityLog: [],
      maxEntries: 200,
      dynamicTabs: [],
      hiddenTabs: new Set<string>(),

      setVisible: (visible) => set({ visible }),

      toggleVisible: () => set((s) => ({ visible: !s.visible })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setPanelHeight: (height) => set({ panelHeight: Math.max(100, Math.min(500, height)) }),

      setAlignment: (alignment) => set({ alignment }),

      addLogEntry: (entry) => {
        set((state) => ({
          activityLog: [
            { ...entry, id: generateEntryId(), timestamp: Date.now() },
            ...state.activityLog,
          ].slice(0, state.maxEntries),
        }));
      },

      clearLog: () => set({ activityLog: [] }),

      registerTab: (tab) => {
        set((state) => {
          // Avoid duplicates
          if (state.dynamicTabs.some((t) => t.id === tab.id)) return state;
          const newTabs = [...state.dynamicTabs, tab].sort(
            (a, b) => (a.priority ?? 10) - (b.priority ?? 10)
          );
          return { dynamicTabs: newTabs };
        });
      },

      unregisterTab: (tabId) => {
        set((state) => {
          const newTabs = state.dynamicTabs.filter((t) => t.id !== tabId);
          // If the removed tab was active, fall back to 'activity'
          const activeTab = state.activeTab === tabId ? 'activity' : state.activeTab;
          return { dynamicTabs: newTabs, activeTab };
        });
      },

      unregisterModule: (moduleKey) => {
        set((state) => {
          const removedIds = state.dynamicTabs.filter((t) => t.moduleKey === moduleKey).map((t) => t.id);
          const newTabs = state.dynamicTabs.filter((t) => t.moduleKey !== moduleKey);
          const activeTab = removedIds.includes(state.activeTab) ? 'activity' : state.activeTab;
          return { dynamicTabs: newTabs, activeTab };
        });
      },

      toggleTabHidden: (tabId) => {
        set((state) => {
          const next = new Set(state.hiddenTabs);
          if (next.has(tabId)) next.delete(tabId);
          else next.add(tabId);
          // If we just hid the active tab, fall back
          const activeTab = next.has(state.activeTab) ? 'activity' : state.activeTab;
          return { hiddenTabs: next, activeTab };
        });
      },

      reorderDynamicTabs: (orderedIds) => {
        set((state) => {
          const map = new Map(state.dynamicTabs.map((t) => [t.id, t]));
          const reordered = orderedIds.map((id) => map.get(id)).filter(Boolean) as DynamicBottomTab[];
          // Append any tabs not in the ordered list (safety)
          for (const t of state.dynamicTabs) {
            if (!orderedIds.includes(t.id)) reordered.push(t);
          }
          return { dynamicTabs: reordered };
        });
      },
    }),
    {
      name: 'ols-bottom-panel',
      version: 3,
      partialize: (state) => ({
        visible: state.visible,
        activeTab: state.activeTab,
        panelHeight: state.panelHeight,
        alignment: state.alignment,
        // Don't persist dynamicTabs — they re-register on mount
      }),
    }
  )
);
