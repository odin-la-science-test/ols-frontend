import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR STACK STORE - Multi-panel stacking for both sidebars
//
// Allows any combination of panels to be shown simultaneously in a sidebar,
// either as resizable stacked panels or as switchable tabs.
//
// Each sidebar ('left' | 'right') has its own independent stack.
// Panels are identified by string IDs — no hardcoded combos.
//
// The Activity Bar uses addToStack() (Ctrl+Click) to stack panels,
// and setStack() (normal click) to replace the entire stack.
// ═══════════════════════════════════════════════════════════════════════════

/** Which sidebar the stack belongs to */
export type SidebarSide = 'left' | 'right';

/** Layout mode when multiple panels are stacked */
export type StackLayout = 'tabs' | 'stacked';

/** A single panel in a sidebar stack */
export interface StackedPanel {
  /** Unique panel id (matches SidebarPanelId or any dynamic id) */
  id: string;
  /** Display label (translation key or plain text) */
  label: string;
  /** Optional accent color for the tab indicator */
  accentColor?: string;
  /** Optional icon name (lucide) */
  icon?: string;
}

interface SidebarStackState {
  /** Per-sidebar stacks: ordered list of panel IDs currently visible */
  stacks: Record<SidebarSide, string[]>;

  /** Per-sidebar active tab (relevant when layout === 'tabs') */
  activeTabs: Record<SidebarSide, string | null>;

  /** Per-sidebar layout mode */
  layouts: Record<SidebarSide, StackLayout>;

  // ── Actions ──

  /**
   * Replace the entire stack for a sidebar with a single panel.
   * This is the default click behavior.
   */
  setStack: (side: SidebarSide, panelIds: string[]) => void;

  /**
   * Add a panel to an existing stack (Ctrl+Click / drag to stack).
   * If already in the stack, removes it (toggle behavior).
   * Makes the newly added panel the active tab.
   */
  addToStack: (side: SidebarSide, panelId: string) => void;

  /**
   * Remove a specific panel from a stack.
   * If the removed panel was the active tab, activates the first remaining.
   */
  removeFromStack: (side: SidebarSide, panelId: string) => void;

  /** Set the active tab for a sidebar (tab mode) */
  setActiveTab: (side: SidebarSide, panelId: string) => void;

  /** Toggle layout between 'tabs' and 'stacked' */
  toggleLayout: (side: SidebarSide) => void;

  /** Set layout explicitly */
  setLayout: (side: SidebarSide, layout: StackLayout) => void;

  /** Clear the entire stack for a sidebar */
  clearStack: (side: SidebarSide) => void;

  /** Check if a panel is in a sidebar's stack */
  isInStack: (side: SidebarSide, panelId: string) => boolean;

  /** Get the number of panels in a stack */
  stackSize: (side: SidebarSide) => number;
}

export const useSidebarStackStore = create<SidebarStackState>()(
  persist(
    (set, get) => ({
      stacks: { left: [], right: [] },
      activeTabs: { left: null, right: null },
      layouts: { left: 'tabs', right: 'tabs' },

      setStack: (side, panelIds) => {
        set((state) => ({
          stacks: { ...state.stacks, [side]: panelIds },
          activeTabs: { ...state.activeTabs, [side]: panelIds[0] ?? null },
        }));
      },

      addToStack: (side, panelId) => {
        const current = get().stacks[side];
        if (current.includes(panelId)) {
          // Toggle off: remove from stack
          const newStack = current.filter((id) => id !== panelId);
          const activeTab = get().activeTabs[side];
          set((state) => ({
            stacks: { ...state.stacks, [side]: newStack },
            activeTabs: {
              ...state.activeTabs,
              [side]: activeTab === panelId ? (newStack[0] ?? null) : activeTab,
            },
          }));
        } else {
          // Add to stack — enforce max 2 panels: evict oldest if full
          let base = current;
          if (base.length >= 2) {
            base = base.slice(-1); // keep only the most recent
          }
          set((state) => ({
            stacks: { ...state.stacks, [side]: [...base, panelId] },
            activeTabs: { ...state.activeTabs, [side]: panelId },
          }));
        }
      },

      removeFromStack: (side, panelId) => {
        const current = get().stacks[side];
        const newStack = current.filter((id) => id !== panelId);
        const activeTab = get().activeTabs[side];
        set((state) => ({
          stacks: { ...state.stacks, [side]: newStack },
          activeTabs: {
            ...state.activeTabs,
            [side]: activeTab === panelId ? (newStack[0] ?? null) : activeTab,
          },
        }));
      },

      setActiveTab: (side, panelId) => {
        set((state) => ({
          activeTabs: { ...state.activeTabs, [side]: panelId },
        }));
      },

      toggleLayout: (side) => {
        set((state) => ({
          layouts: {
            ...state.layouts,
            [side]: state.layouts[side] === 'tabs' ? 'stacked' : 'tabs',
          },
        }));
      },

      setLayout: (side, layout) => {
        set((state) => ({
          layouts: { ...state.layouts, [side]: layout },
        }));
      },

      clearStack: (side) => {
        set((state) => ({
          stacks: { ...state.stacks, [side]: [] },
          activeTabs: { ...state.activeTabs, [side]: null },
        }));
      },

      isInStack: (side, panelId) => {
        return get().stacks[side].includes(panelId);
      },

      stackSize: (side) => {
        return get().stacks[side].length;
      },
    }),
    {
      name: 'ols-sidebar-stack',
      version: 1,
    }
  )
);
