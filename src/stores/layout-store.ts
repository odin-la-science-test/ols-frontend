import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT STORE - Tailles des panneaux resizables (react-resizable-panels)
// Persiste les tailles en % pour chaque zone du layout principal.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Panel sizes are stored as arrays of percentage numbers matching
 * the order of `<Panel>` elements inside each `<PanelGroup>`.
 *
 * Horizontal group: [globalSidebar, mainArea, secondarySidebar]
 * Vertical group (inside mainArea): [content, bottomPanel]
 */

interface LayoutState {
  /** Horizontal split: [sidebar%, center%, secondarySidebar%] */
  horizontalSizes: number[] | null;
  /** Vertical split inside center: [content%, bottomPanel%] */
  verticalSizes: number[] | null;

  setHorizontalSizes: (sizes: number[]) => void;
  setVerticalSizes: (sizes: number[]) => void;
  resetLayout: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      horizontalSizes: null,
      verticalSizes: null,

      setHorizontalSizes: (sizes) => set({ horizontalSizes: sizes }),
      setVerticalSizes: (sizes) => set({ verticalSizes: sizes }),
      resetLayout: () => set({ horizontalSizes: null, verticalSizes: null }),
    }),
    {
      name: 'ols-layout',
      version: 1,
    },
  ),
);
