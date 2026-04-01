import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createCrudHooks } from '@/hooks/create-crud-hooks';
import { supportApi, sendMessage, getAllTickets, getStats, sendAdminMessage, updateStatus, updatePriority } from './api';
import type { SupportTicket, CreateTicketRequest, UpdateTicketRequest, SendMessageRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT HOOKS - Standard CRUD via factory + custom admin/message hooks
// ═══════════════════════════════════════════════════════════════════════════

const crud = createCrudHooks<SupportTicket, CreateTicketRequest, UpdateTicketRequest>(
  supportApi, 'support', {
    optimistic: false,
  },
);

// ─── Query keys (extend factory keys with admin keys) ───

export const supportKeys = {
  ...crud.keys,
  myTickets: crud.keys.list,
  detail: crud.keys.detail,
  admin: () => [...crud.keys.all, 'admin'] as const,
  adminAll: () => [...crud.keys.all, 'admin', 'all'] as const,
  adminStats: () => [...crud.keys.all, 'admin', 'stats'] as const,
};

// ─── User CRUD hooks (from factory) ───

export const useMyTickets = crud.useList;
export const useTicketDetail = crud.useDetail;
export const useCreateTicket = crud.useCreate;
export const useUpdateTicket = crud.useUpdate;
export const useDeleteTicket = crud.useDelete;
export const useRestoreTicket = crud.useRestore;

// ─── User message hook (custom) ───

/** Envoyer un message (user) */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SendMessageRequest }) =>
      sendMessage(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.list() });
    },
  });
};

// ─── Admin hooks (custom, not covered by factory) ───

/** Tous les tickets (admin) */
export const useAllTickets = () => {
  return useQuery({
    queryKey: supportKeys.adminAll(),
    queryFn: () => getAllTickets().then((res) => res.data),
  });
};

/** Statistiques des tickets (admin) */
export const useTicketStats = () => {
  return useQuery({
    queryKey: supportKeys.adminStats(),
    queryFn: () => getStats().then((res) => res.data),
    refetchInterval: 60_000,
  });
};

/** Envoyer un message admin */
export const useSendAdminMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SendMessageRequest }) =>
      sendAdminMessage(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: supportKeys.adminStats() });
    },
  });
};

/** Changer le statut d'un ticket (admin) */
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateStatus(id, status).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: supportKeys.adminStats() });
    },
  });
};

/** Changer la priorité d'un ticket (admin) */
export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: string }) =>
      updatePriority(id, priority).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: supportKeys.adminStats() });
    },
  });
};

// ─── Client-side search hooks (custom) ───

/** Client-side search for admin tickets (filters by subject, name, email) */
export const useAdminTicketSearch = (query: string) => {
  const { data: allTickets, isLoading } = useAllTickets();

  const filteredData = useMemo(() => {
    if (!allTickets || query.length < 2) return undefined;
    const q = query.toLowerCase();
    return allTickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q)
    );
  }, [allTickets, query]);

  return { data: filteredData, isLoading };
};

/** Client-side search for user's own tickets (filters by subject, description) */
export const useMyTicketSearch = (query: string) => {
  const { data: allTickets, isLoading } = useMyTickets();

  const filteredData = useMemo(() => {
    if (!allTickets || query.length < 2) return undefined;
    const q = query.toLowerCase();
    return allTickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [allTickets, query]);

  return { data: filteredData, isLoading };
};
