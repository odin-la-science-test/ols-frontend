import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store for admin view toggle, persisted per module.
 * When an admin visits a module with adminView, they see the admin view by default.
 * This store lets them switch to the user view per module, persisted across sessions.
 */
interface AdminViewState {
  /** Module IDs where the admin has forced the user view */
  userViewOverrides: string[];
  /** Toggle between admin and user view for a module */
  toggleView: (moduleId: string) => void;
  /** Check if admin should see user view for this module */
  isUserViewForced: (moduleId: string) => boolean;
}

export const useAdminViewStore = create<AdminViewState>()(
  persist(
    (set, get) => ({
      userViewOverrides: [],
      toggleView: (moduleId: string) => {
        set((state) => {
          const has = state.userViewOverrides.includes(moduleId);
          return {
            userViewOverrides: has
              ? state.userViewOverrides.filter((id) => id !== moduleId)
              : [...state.userViewOverrides, moduleId],
          };
        });
      },
      isUserViewForced: (moduleId: string) => get().userViewOverrides.includes(moduleId),
    }),
    { name: 'ols-admin-view' },
  ),
);
