import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APP_VERSION } from '@/lib/app-version';

interface WhatsNewState {
  lastSeenVersion: string | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  shouldShow: () => boolean;
}

export const useWhatsNewStore = create<WhatsNewState>()(
  persist(
    (set, get) => ({
      lastSeenVersion: null,
      isOpen: false,

      open: () => set({ isOpen: true }),

      close: () => set({ isOpen: false, lastSeenVersion: APP_VERSION }),

      shouldShow: () => {
        const { lastSeenVersion } = get();
        return lastSeenVersion !== APP_VERSION;
      },
    }),
    { name: 'ols-whats-new' },
  ),
);
