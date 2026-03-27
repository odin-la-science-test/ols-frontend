import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// FAVORITES STORE — Cross-module favorites with persistence
// ═══════════════════════════════════════════════════════════════════════════

export interface FavoriteItem {
  moduleId: string;
  entityId: string | number;
  label: string;
  route: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (moduleId: string, entityId: string | number) => void;
  isFavorite: (moduleId: string, entityId: string | number) => boolean;
  getFavoritesByModule: (moduleId: string) => FavoriteItem[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (item) => {
        const { favorites } = get();
        const exists = favorites.some(
          (f) => f.moduleId === item.moduleId && f.entityId === item.entityId,
        );
        if (!exists) {
          set({ favorites: [...favorites, item] });
        }
      },

      removeFavorite: (moduleId, entityId) => {
        set((state) => ({
          favorites: state.favorites.filter(
            (f) => !(f.moduleId === moduleId && f.entityId === entityId),
          ),
        }));
      },

      isFavorite: (moduleId, entityId) =>
        get().favorites.some((f) => f.moduleId === moduleId && f.entityId === entityId),

      getFavoritesByModule: (moduleId) =>
        get().favorites.filter((f) => f.moduleId === moduleId),
    }),
    { name: 'ols-favorites' },
  ),
);
