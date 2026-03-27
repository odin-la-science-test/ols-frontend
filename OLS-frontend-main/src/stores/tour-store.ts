import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TOUR STORE — Tracks which tours and tips the user has completed/dismissed
//
// Synced with server via preferences-sync (same pattern as theme, language).
// ═══════════════════════════════════════════════════════════════════════════

interface TourState {
  completedTours: string[];
  dismissedTips: string[];
  activeTourId: string | null;
  _lastModified: number;

  completeTour: (tourId: string) => void;
  dismissTip: (tipId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  isTipDismissed: (tipId: string) => boolean;
  setActiveTour: (tourId: string | null) => void;
  resetAll: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      completedTours: [],
      dismissedTips: [],
      activeTourId: null,
      _lastModified: 0,

      completeTour: (tourId) => {
        const { completedTours } = get();
        if (completedTours.includes(tourId)) return;
        set({
          completedTours: [...completedTours, tourId],
          activeTourId: null,
          _lastModified: Date.now(),
        });
      },

      dismissTip: (tipId) => {
        const { dismissedTips } = get();
        if (dismissedTips.includes(tipId)) return;
        set({
          dismissedTips: [...dismissedTips, tipId],
          _lastModified: Date.now(),
        });
      },

      isTourCompleted: (tourId) => get().completedTours.includes(tourId),

      isTipDismissed: (tipId) => get().dismissedTips.includes(tipId),

      setActiveTour: (tourId) => set({ activeTourId: tourId }),

      resetAll: () => set({
        completedTours: [],
        dismissedTips: [],
        activeTourId: null,
        _lastModified: Date.now(),
      }),
    }),
    { name: 'tour-storage' },
  ),
);
