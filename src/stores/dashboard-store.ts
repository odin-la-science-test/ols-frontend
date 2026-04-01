import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
import type { ModuleWidget } from '@/lib/module-registry/types';

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD STORE - Customizable homepage widget grid
// Manages widget visibility, grid layouts per breakpoint, and shortcuts
// Persisted in localStorage via Zustand persist middleware
// ═══════════════════════════════════════════════════════════════════════════

export type WidgetId = string;

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
}

/** A user-chosen shortcut for the quick-shortcuts widget */
export interface ShortcutConfig {
  path: string;
  label: string;
  icon: string; // lucide icon name in kebab-case
}

// ─── Grid constants ─────────────────────────────────────────────────────

export const GRID_BREAKPOINTS = { lg: 900, md: 500, sm: 0 };
export const GRID_COLS = { lg: 6, md: 4, sm: 2 };
export const GRID_ROW_HEIGHT = 80;

// ─── Layout generation ──────────────────────────────────────────────────

/** Auto-pack widgets into a grid layout for a given number of columns */
function packLayout(widgets: ModuleWidget[], cols: number): LayoutItem[] {
  const grid: LayoutItem[] = [];
  const colHeights = new Array(cols).fill(0);

  for (const widget of widgets) {
    const w = Math.min(widget.defaultSize.w, cols);
    const h = widget.defaultSize.h;

    let bestX = 0;
    let bestY = Infinity;

    for (let x = 0; x <= cols - w; x++) {
      const maxH = Math.max(...colHeights.slice(x, x + w));
      if (maxH < bestY) {
        bestY = maxH;
        bestX = x;
      }
    }

    grid.push({
      i: widget.id,
      x: bestX,
      y: bestY,
      w,
      h,
      minW: widget.minSize?.w ?? 1,
      minH: widget.minSize?.h ?? 1,
      maxW: widget.maxSize?.w,
      maxH: widget.maxSize?.h,
    });

    for (let c = bestX; c < bestX + w; c++) {
      colHeights[c] = bestY + h;
    }
  }

  return grid;
}

/** Generate default layouts for all breakpoints from widget definitions */
export function generateDefaultLayouts(widgets: ModuleWidget[]): ResponsiveLayouts {
  return {
    lg: packLayout(widgets, GRID_COLS.lg),
    md: packLayout(widgets, GRID_COLS.md),
    sm: packLayout(widgets, GRID_COLS.sm),
  };
}

// ─── Store ──────────────────────────────────────────────────────────────

/** Per-widget user settings (generic key-value) */
export type WidgetSettings = Record<string, Record<string, unknown>>;

interface DashboardState {
  /** Ordered list of widget configs (visibility) */
  widgets: WidgetConfig[];
  /** Grid layouts per breakpoint (positions + sizes) */
  layouts: ResponsiveLayouts;
  /** Whether the user is in edit/customize mode */
  editMode: boolean;
  /** User-chosen shortcuts (max 6). Empty = show defaults */
  customShortcuts: ShortcutConfig[];
  /** Per-widget settings (persisted) */
  widgetSettings: WidgetSettings;
  _lastModified: number;

  // Actions
  updateLayouts: (layouts: ResponsiveLayouts) => void;
  setWidgetVisible: (id: WidgetId, visible: boolean) => void;
  setEditMode: (editing: boolean) => void;
  toggleEditMode: () => void;
  addShortcut: (shortcut: ShortcutConfig) => void;
  removeShortcut: (path: string) => void;
  updateWidgetSetting: (widgetId: WidgetId, key: string, value: unknown) => void;
  resetToDefaults: () => void;
}

// Widget visibility preferences. The home page merges this with widget definitions
// using defaultVisible as fallback for widgets not in this list.

const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  'quick-shortcuts': { iconOnly: true },
};

export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { path: '/lab/notes', label: 'notes.title', icon: 'sticky-note' },
  { path: '/lab/notifications', label: 'notifications.title', icon: 'bell' },
  { path: '/lab/quickshare', label: 'quickshare.title', icon: 'share-2' },
  { path: '/settings', label: 'settingsPage.title', icon: 'settings' },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: [],
      layouts: {},
      editMode: false,
      customShortcuts: DEFAULT_SHORTCUTS,
      widgetSettings: DEFAULT_WIDGET_SETTINGS,
      _lastModified: 0,

      updateLayouts: (layouts) => {
        set({ layouts, _lastModified: Date.now() });
      },

      setWidgetVisible: (id, visible) => {
        set((state) => {
          const exists = state.widgets.some((w) => w.id === id);
          const updated = exists
            ? state.widgets.map((w) => (w.id === id ? { ...w, visible } : w))
            : [...state.widgets, { id, visible }];
          return { widgets: updated, _lastModified: Date.now() };
        });
      },

      setEditMode: (editing) => { set({ editMode: editing }); },
      toggleEditMode: () => { set((state) => ({ editMode: !state.editMode })); },

      addShortcut: (shortcut) => {
        set((state) => {
          if (state.customShortcuts.length >= 6) return state;
          if (state.customShortcuts.some((s) => s.path === shortcut.path)) return state;
          return { customShortcuts: [...state.customShortcuts, shortcut], _lastModified: Date.now() };
        });
      },

      removeShortcut: (path) => {
        set((state) => ({
          customShortcuts: state.customShortcuts.filter((s) => s.path !== path),
          _lastModified: Date.now(),
        }));
      },

      updateWidgetSetting: (widgetId, key, value) => {
        set((state) => ({
          widgetSettings: {
            ...state.widgetSettings,
            [widgetId]: { ...state.widgetSettings[widgetId], [key]: value },
          },
          _lastModified: Date.now(),
        }));
      },

      resetToDefaults: () => {
        set({ widgets: [], layouts: {}, customShortcuts: DEFAULT_SHORTCUTS, widgetSettings: DEFAULT_WIDGET_SETTINGS, _lastModified: Date.now() });
      },
    }),
    {
      name: 'ols-dashboard',
      version: 17,
      migrate: () => ({
        widgets: [],
        layouts: {},
        editMode: false,
        customShortcuts: DEFAULT_SHORTCUTS,
        widgetSettings: DEFAULT_WIDGET_SETTINGS,
      }),
    }
  )
);
