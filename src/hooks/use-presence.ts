import { useOnlineUsersStore } from '@/stores/online-users-store';

// ═══════════════════════════════════════════════════════════════════════════
// USE PRESENCE — Simplifie : la connexion SSE fait office de heartbeat.
//
// Le suivi de presence passe desormais par les events SSE "presence"
// diffuses par SseEmitterService. Ce hook est conserve pour retrocompat
// et expose le compteur depuis le store online-users.
// ═══════════════════════════════════════════════════════════════════════════

export function usePresence(): { onlineCount: number; isLoading: boolean } {
  const onlineUserIds = useOnlineUsersStore((s) => s.onlineUserIds);

  return {
    onlineCount: onlineUserIds.size,
    isLoading: false,
  };
}
