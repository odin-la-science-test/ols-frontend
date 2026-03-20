import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD STORE - Customizable homepage widget layout
// Manages which widgets are visible and their order
// Persisted in localStorage
// ═══════════════════════════════════════════════════════════════════════════

export type WidgetId =
  | 'quick-shortcuts'
  | 'recent-activity'
  | 'latest-notes'
  | 'notifications';

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
}

/** A user-chosen shortcut for the quick-shortcuts widget */
export interface ShortcutConfig {
  path: string;
  label: string;
  icon: string; // icon name from module-icons
}

interface DashboardState {
  /** Ordered list of widget configs */
  widgets: WidgetConfig[];
  /** Whether the user is in edit/customize mode */
  editMode: boolean;
  /** User-chosen shortcuts (max 6). Empty = show defaults */
  customShortcuts: ShortcutConfig[];

  // Actions
  setWidgetVisible: (id: WidgetId, visible: boolean) => void;
  moveWidget: (id: WidgetId, direction: 'up' | 'down') => void;
  /** Direct reorder by providing the new ordered array of widget IDs */
  reorderWidgets: (orderedIds: WidgetId[]) => void;
  setEditMode: (editing: boolean) => void;
  toggleEditMode: () => void;
  addShortcut: (shortcut: ShortcutConfig) => void;
  removeShortcut: (path: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'quick-shortcuts', visible: true },
  { id: 'recent-activity', visible: true },
  { id: 'latest-notes', visible: true },
  { id: 'notifications', visible: true },
];

export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { path: '/lab/notes', label: 'notes.title', icon: 'sticky-note' },
  { path: '/lab/notifications', label: 'notifications.title', icon: 'bell' },
  { path: '/lab/quickshare', label: 'quickshare.title', icon: 'share-2' },
  { path: '/settings', label: 'settingsPage.title', icon: 'settings' },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      editMode: false,
      customShortcuts: DEFAULT_SHORTCUTS,

      setWidgetVisible: (id, visible) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, visible } : w
          ),
        }));
      },

      moveWidget: (id, direction) => {
        set((state) => {
          const idx = state.widgets.findIndex((w) => w.id === id);
          if (idx === -1) return state;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= state.widgets.length) return state;
          const newWidgets = [...state.widgets];
          [newWidgets[idx], newWidgets[targetIdx]] = [newWidgets[targetIdx], newWidgets[idx]];
          return { widgets: newWidgets };
        });
      },

      reorderWidgets: (orderedIds) => {
        set((state) => {
          const map = new Map(state.widgets.map((w) => [w.id, w]));
          const reordered = orderedIds.map((id) => map.get(id)).filter(Boolean) as WidgetConfig[];
          // Append any widgets not in orderedIds (shouldn't happen, but safety)
          state.widgets.forEach((w) => { if (!orderedIds.includes(w.id)) reordered.push(w); });
          return { widgets: reordered };
        });
      },

      setEditMode: (editing) => { set({ editMode: editing }); },
      toggleEditMode: () => { set((state) => ({ editMode: !state.editMode })); },

      addShortcut: (shortcut) => {
        set((state) => {
          if (state.customShortcuts.length >= 6) return state;
          if (state.customShortcuts.some((s) => s.path === shortcut.path)) return state;
          return { customShortcuts: [...state.customShortcuts, shortcut] };
        });
      },

      removeShortcut: (path) => {
        set((state) => ({
          customShortcuts: state.customShortcuts.filter((s) => s.path !== path),
        }));
      },

      resetToDefaults: () => {
        set({ widgets: DEFAULT_WIDGETS, customShortcuts: DEFAULT_SHORTCUTS });
      },
    }),
    {
      name: 'ols-dashboard',
      version: 6,
      migrate: () => ({
        widgets: DEFAULT_WIDGETS,
        editMode: false,
        customShortcuts: DEFAULT_SHORTCUTS,
      }),
    }
  )
);

/** Get the list of all possible widget IDs */
export const ALL_WIDGET_IDS: WidgetId[] = DEFAULT_WIDGETS.map((w) => w.id);
