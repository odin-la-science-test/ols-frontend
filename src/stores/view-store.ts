import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewMode } from '@/components/modules/types';

interface ViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: 'table',

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleViewMode: () => set((state) => ({ 
        viewMode: state.viewMode === 'table' ? 'cards' : 'table' 
      })),
    }),
    {
      name: 'view-storage',
    }
  )
);
