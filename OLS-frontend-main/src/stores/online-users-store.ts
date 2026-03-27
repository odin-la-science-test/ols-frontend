import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// ONLINE USERS STORE — Suivi des utilisateurs connectes via SSE
//
// Alimente par les evenements SSE "presence" et le fallback REST initial.
// Pas de persistence — en memoire uniquement.
// ═══════════════════════════════════════════════════════════════════════════

interface OnlineUsersState {
  onlineUserIds: Set<number>;
  setOnlineUsers: (ids: number[]) => void;
  isOnline: (userId: number) => boolean;
}

export const useOnlineUsersStore = create<OnlineUsersState>((set, get) => ({
  onlineUserIds: new Set<number>(),

  setOnlineUsers: (ids: number[]) => {
    set({ onlineUserIds: new Set(ids) });
  },

  isOnline: (userId: number) => {
    return get().onlineUserIds.has(userId);
  },
}));

/** Hook de commodite pour verifier si un utilisateur est en ligne */
export function useIsUserOnline(userId: number): boolean {
  return useOnlineUsersStore((s) => s.onlineUserIds.has(userId));
}
