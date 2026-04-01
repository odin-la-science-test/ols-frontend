import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleType } from '@/api/generated/enums';

export type AuthProviderType = 'LOCAL' | 'GOOGLE' | 'CAS_UNIV_LILLE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  avatarId?: string | null;
  authProvider?: AuthProviderType;
  emailVerified?: boolean;
}

export function getAvatarUrl(avatarId?: string | null): string | undefined {
  if (!avatarId) return undefined;
  return `/avatars/${avatarId}.svg`;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isGuest: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      isGuest: () => get().user?.role === 'GUEST',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
