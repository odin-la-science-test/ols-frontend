import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './api';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS HOOKS - TanStack Query hooks
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

/** Compteur non lues (polling toutes les 30s) */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount().then((res) => res.data),
    refetchInterval: 30_000,
  });
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
