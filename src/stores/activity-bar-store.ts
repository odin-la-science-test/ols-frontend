import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePanelRegistryStore } from './panel-registry-store';

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY BAR STORE — App-level navigation bar (refactored)
//
// The Activity Bar now focuses on:
//   1. Its own visibility and position
//   2. Managing which app-level panels are shown in its icon list
//   3. Delegating panel open/close to the panel-registry-store
//
// Panel state (which panel is open, stacking, etc.) is now handled by
// panel-registry-store. The Activity Bar simply tells it what to toggle.
//
// Two types of items:
//   "navigate" → direct navigation (Settings)
//   "panel"    → toggle a panel in the primary sidebar via panel-registry
//
// Panel stacking:
//   Normal click  → replaces the sidebar stack with a single panel
//   Ctrl+Click    → adds the panel to the current stack
// ═══════════════════════════════════════════════════════════════════════════

/** Activity bar item ID — string to allow module-contributed items */
export type ActivityBarItemId = string;

/** Position of the activity bar in the layout */
export type ActivityBarPosition = 'left' | 'top' | 'right' | 'bottom';

/** Panel IDs that open a sidebar panel — string to allow module-contributed panels */
export type SidebarPanelId = string;

export interface ActivityBarItem {
  id: ActivityBarItemId;
  icon: string;
  /** For "navigate" items: the route path. For "panel" items: unused. */
  path: string;
  /** Whether this item is visible in the bar */
  visible: boolean;
  /** "navigate" = direct navigation, "panel" = toggle sidebar panel */
  type: 'navigate' | 'panel';
}

interface ActivityBarState {
  /** Whether the activity bar is visible */
  activityBarVisible: boolean;
  /** Position of the activity bar: left (default), top, right, bottom */
  position: ActivityBarPosition;
  /** Ordered list of activity bar items with visibility */
  items: ActivityBarItem[];
  /** Badge counts per item id */
  badges: Partial<Record<ActivityBarItemId, number>>;

  // Actions
  setActivityBarVisible: (visible: boolean) => void;
  toggleActivityBar: () => void;
  setPosition: (position: ActivityBarPosition) => void;
  setItemVisible: (id: ActivityBarItemId, visible: boolean) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  setBadge: (id: ActivityBarItemId, count: number) => void;
  clearBadge: (id: ActivityBarItemId) => void;
  resetToDefaults: () => void;
  /** Merge module-contributed items (inserts before settings, preserves user order/visibility) */
  mergeModuleItems: (moduleItems: ActivityBarItem[]) => void;
  /** Open a panel or toggle it. Delegates to panel-registry-store. */
  togglePanel: (panelId: SidebarPanelId) => void;
  /** Stack a panel (Ctrl+Click). Delegates to panel-registry-store. */
  stackPanel: (panelId: SidebarPanelId) => void;
  setActivePanel: (panelId: SidebarPanelId | null) => void;
}

const DEFAULT_ITEMS: ActivityBarItem[] = [
  { id: 'explorer', icon: 'file', path: '', visible: true, type: 'panel' },
  { id: 'history', icon: 'history', path: '', visible: true, type: 'panel' },
  { id: 'settings', icon: 'settings', path: '/settings', visible: true, type: 'navigate' },
];

export const useActivityBarStore = create<ActivityBarState>()(
  persist(
    (set, _get) => ({
      activityBarVisible: true,
      position: 'left',
      items: DEFAULT_ITEMS,
      badges: {},

      setActivityBarVisible: (visible) => {
        set({ activityBarVisible: visible });
      },

      toggleActivityBar: () => {
        set((state) => ({ activityBarVisible: !state.activityBarVisible }));
      },

      setPosition: (position) => {
        set({ position });
      },

      setItemVisible: (id, visible) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, visible } : item
          ),
        }));
      },

      reorderItems: (fromIndex, toIndex) => {
        set((state) => {
          const newItems = [...state.items];
          const [removed] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, removed);
          return { items: newItems };
        });
      },

      setBadge: (id, count) => {
        set((state) => ({
          badges: { ...state.badges, [id]: count },
        }));
      },

      clearBadge: (id) => {
        set((state) => {
          const newBadges = { ...state.badges };
          delete newBadges[id];
          return { badges: newBadges };
        });
      },

      mergeModuleItems: (moduleItems) => {
        set((state) => {
          const existingIds = new Set(state.items.map((i) => i.id));
          const newItems = moduleItems.filter((mi) => !existingIds.has(mi.id));
          if (newItems.length === 0) return state;

          // Insert new items before the last 'navigate' item (settings)
          const items = [...state.items];
          const settingsIdx = items.findIndex((i) => i.type === 'navigate');
          const insertIdx = settingsIdx >= 0 ? settingsIdx : items.length;
          items.splice(insertIdx, 0, ...newItems);
          return { items };
        });
      },

      resetToDefaults: () => {
        set({ items: DEFAULT_ITEMS, badges: {}, position: 'left' });
        usePanelRegistryStore.getState().resetToDefaults();
      },

      togglePanel: (panelId) => {
        const registry = usePanelRegistryStore.getState();
        const zone = registry.getZoneForPanel(panelId, 'activity-panel');
        registry.togglePanel(panelId, zone);
      },

      stackPanel: (panelId) => {
        const registry = usePanelRegistryStore.getState();
        const zone = registry.getZoneForPanel(panelId, 'activity-panel');
        registry.stackPanel(panelId, zone);
      },

      setActivePanel: (panelId) => {
        const registry = usePanelRegistryStore.getState();
        if (panelId) {
          const zone = registry.getZoneForPanel(panelId, 'activity-panel');
          const zs = registry.zones[zone];
          if (zs.stack.includes(panelId)) {
            registry.setActiveTab(zone, panelId);
            registry.openZone(zone);
          } else {
            registry.setZoneStack(zone, [panelId]);
          }
        } else {
          registry.closeZone('activity-panel');
        }
      },
    }),
    {
      name: 'ols-activity-bar',
      version: 12,
      partialize: (state) => ({
        activityBarVisible: state.activityBarVisible,
        position: state.position,
        items: state.items,
        badges: state.badges,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 11) {
          // v10 → v11: notes & notifications are now module-contributed (dynamic).
          const oldItems = (state.items as ActivityBarItem[] | undefined) ?? [];
          const filteredItems = oldItems.filter(
            (item) => item.id === 'explorer' || item.type === 'navigate'
          );
          state.items = filteredItems.length > 0 ? filteredItems : DEFAULT_ITEMS;
        }
        if (version < 12) {
          // v11 → v12: inject history item before settings if absent
          const items = (state.items as ActivityBarItem[] | undefined) ?? DEFAULT_ITEMS;
          if (!items.some((item) => item.id === 'history')) {
            const settingsIdx = items.findIndex((i) => i.type === 'navigate');
            const insertIdx = settingsIdx >= 0 ? settingsIdx : items.length;
            items.splice(insertIdx, 0, { id: 'history', icon: 'history', path: '', visible: true, type: 'panel' });
            state.items = items;
          }
        }
        return state;
      },
    }
  )
);