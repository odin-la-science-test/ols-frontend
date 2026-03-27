import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { notificationsApi } from './api';
import { useAuthStore } from '@/stores/auth-store';
import { useOnlineUsersStore } from '@/stores/online-users-store';
import api from '@/api/axios';
import type { Notification as NotificationDTO } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS HOOKS - TanStack Query + SSE temps reel
// ═══════════════════════════════════════════════════════════════════════════

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationsKeys.all, 'list'] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
};

/** Mes notifications */
export const useMyNotifications = () => {
  return useQuery({
    queryKey: notificationsKeys.list(),
    queryFn: () => notificationsApi.getMyNotifications().then((res) => res.data),
  });
};

/** Compteur non lues */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount().then((res) => res.data),
  });
};

// ─── Mapping type de notification → query keys a invalider ───

const CROSS_MODULE_INVALIDATIONS: Record<string, readonly string[][]> = {
  MODULE_ACCESS_GRANTED: [['modules']],
  SUPPORT_STATUS_CHANGED: [['support']],
  SUPPORT_REPLY: [['support']],
};

/**
 * Connexion SSE temps reel pour recevoir les notifications instantanement.
 * Invalide automatiquement le cache TanStack Query (notifications + modules concernes).
 * A monter une seule fois dans AppShell.
 */
export const useNotificationStream = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) return;

    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    // Chargement initial de la presence (avant que les events SSE arrivent)
    api.get<number[]>('/presence/connected')
      .then(({ data }) => useOnlineUsersStore.getState().setOnlineUsers(data))
      .catch(() => { /* fallback silencieux — les events SSE prendront le relais */ });

    fetchEventSource('/api/notifications/stream', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
      openWhenHidden: true,

      onmessage(event) {
        // Mise a jour de la presence via SSE
        if (event.event === 'presence') {
          try {
            const ids: number[] = JSON.parse(event.data);
            useOnlineUsersStore.getState().setOnlineUsers(ids);
          } catch {
            // Pas critique — on attend le prochain event
          }
          return;
        }

        if (event.event && event.event !== 'notification') return;

        // Invalider le cache notifications
        queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
        queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });

        // Invalider le cache cross-module si applicable
        try {
          const notif: NotificationDTO = JSON.parse(event.data);
          const keys = CROSS_MODULE_INVALIDATIONS[notif.type];
          if (keys) {
            keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
          }
        } catch {
          // Pas critique — la notification est deja invalidee
        }
      },

      onerror() {
        // Delai 5s avant reconnexion pour eviter de saturer le pool
        return 5000;
      },
    });

    return () => ctrl.abort();
  }, [token, queryClient]);
};

/** Marquer une notification comme lue */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      notificationsApi.markAsRead(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
};

/** Marquer toutes comme lues */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
};

/** Supprimer une notification */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
};
