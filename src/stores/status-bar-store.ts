import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BAR STORE - Contextual status bar items à la VS Code
//
// Each module can register its own status items via setItems().
// Items are grouped by position (left / right) and displayed in the bar.
//
// Left  → module-specific contextual info (counts, filters, view mode)
// Right → transversal info (network status, shortcuts hint)
//
// The store is NOT persisted — it's runtime-only. Items are set by
// the module currently mounted and cleared when it unmounts.
// ═══════════════════════════════════════════════════════════════════════════

export type StatusBarItemPosition = 'left' | 'right';

export interface StatusBarItem {
  /** Unique id for the item (e.g. 'bacteriology:count') */
  id: string;
  /** Position in the bar */
  position: StatusBarItemPosition;
  /** Display text (already translated by the module) */
  text: string;
  /** Optional lucide icon name */
  icon?: string;
  /** Optional tooltip */
  tooltip?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Sort priority within position group (lower = further left) */
  priority?: number;
  /** Editor group this item belongs to ('main' | 'split'). Defaults to 'main'. */
  groupId?: string;
}

interface StatusBarState {
  /** All registered status items keyed by id */
  items: Record<string, StatusBarItem>;
  /** Online / offline status */
  isOnline: boolean;
  /** IDs of built-in segments hidden by the user via context menu */
  hiddenSegments: Set<string>;

  // ─── Actions ───
  /** Set (upsert) one or more items. Typically called by a module on mount. */
  setItems: (items: StatusBarItem[]) => void;
  /** Remove items by id prefix (e.g. 'bacteriology:' removes all bacteriology items) */
  removeByPrefix: (prefix: string) => void;
  /** Remove a single item */
  removeItem: (id: string) => void;
  /** Clear all items (e.g. when navigating to a minimal-shell page) */
  clearAll: () => void;
  /** Set online status */
  setOnline: (online: boolean) => void;
  /** Toggle a built-in segment visibility */
  toggleSegment: (id: string) => void;
}

export const useStatusBarStore = create<StatusBarState>()((set) => ({
  items: {},
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  hiddenSegments: new Set<string>(),

  setItems: (newItems) => {
    set((state) => {
      const updated = { ...state.items };
      for (const item of newItems) {
        updated[item.id] = item;
      }
      return { items: updated };
    });
  },

  removeByPrefix: (prefix) => {
    set((state) => {
      const updated: Record<string, StatusBarItem> = {};
      for (const [id, item] of Object.entries(state.items)) {
        if (!id.startsWith(prefix)) {
          updated[id] = item;
        }
      }
      return { items: updated };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const { [id]: _removed, ...rest } = state.items;
      return { items: rest };
    });
  },

  clearAll: () => set({ items: {} }),

  setOnline: (online) => set({ isOnline: online }),

  toggleSegment: (id) => {
    set((state) => {
      const next = new Set(state.hiddenSegments);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { hiddenSegments: next };
    });
  },
}));
