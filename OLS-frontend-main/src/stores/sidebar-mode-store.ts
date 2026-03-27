import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR MODE STORE - Dock vs Overlay for each sidebar
//
// 'dock'    → sidebar lives inside the resizable panel grid (default)
// 'overlay' → sidebar floats above the editor, click outside to dismiss
// 'pinned'  → floats above the editor but no backdrop, no dismiss on click outside
// ═══════════════════════════════════════════════════════════════════════════

export type SidebarMode = 'dock' | 'overlay' | 'pinned';
export type SidebarSide = 'left' | 'right';

interface SidebarModeState {
  /** Mode for the activity panel flyout */
  activityMode: SidebarMode;
  /** Mode for the primary sidebar */
  primaryMode: SidebarMode;
  /** Mode for the secondary sidebar */
  secondaryMode: SidebarMode;
  /** Physical side for the primary sidebar */
  primarySide: SidebarSide;
  /** Physical side for the secondary sidebar */
  secondarySide: SidebarSide;

  setActivityMode: (mode: SidebarMode) => void;
  setPrimaryMode: (mode: SidebarMode) => void;
  setSecondaryMode: (mode: SidebarMode) => void;
  setPrimarySide: (side: SidebarSide) => void;
  setSecondarySide: (side: SidebarSide) => void;
  toggleActivityMode: () => void;
  togglePrimaryMode: () => void;
  toggleSecondaryMode: () => void;
}

export const useSidebarModeStore = create<SidebarModeState>()(
  persist(
    (set) => ({
      activityMode: 'dock',
      primaryMode: 'dock',
      secondaryMode: 'dock',
      primarySide: 'right',
      secondarySide: 'right',

      setActivityMode: (mode) => set({ activityMode: mode }),
      setPrimaryMode: (mode) => set({ primaryMode: mode }),
      setSecondaryMode: (mode) => set({ secondaryMode: mode }),
      setPrimarySide: (side) => set({ primarySide: side }),
      setSecondarySide: (side) => set({ secondarySide: side }),
      toggleActivityMode: () =>
        set((s) => ({ activityMode: s.activityMode === 'dock' ? 'overlay' : s.activityMode === 'overlay' ? 'pinned' : 'dock' })),
      togglePrimaryMode: () =>
        set((s) => ({ primaryMode: s.primaryMode === 'dock' ? 'overlay' : s.primaryMode === 'overlay' ? 'pinned' : 'dock' })),
      toggleSecondaryMode: () =>
        set((s) => ({ secondaryMode: s.secondaryMode === 'dock' ? 'overlay' : s.secondaryMode === 'overlay' ? 'pinned' : 'dock' })),
    }),
    {
      name: 'ols-sidebar-mode',
      version: 3,
    },
  ),
);
