import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supportApi } from './api';
import type { CreateTicketRequest, UpdateTicketRequest, SendMessageRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const supportKeys = {
  all: ['support'] as const,
  myTickets: () => [...supportKeys.all, 'my-tickets'] as const,
  detail: (id: number) => [...supportKeys.all, 'detail', id] as const,
  admin: () => [...supportKeys.all, 'admin'] as const,
  adminAll: () => [...supportKeys.admin(), 'all'] as const,
  adminStats: () => [...supportKeys.admin(), 'stats'] as const,
};

// ─── User hooks ───

/** Mes tickets de support */
export const useMyTickets = () => {
  return useQuery({
    queryKey: supportKeys.myTickets(),
    queryFn: () => supportApi.getMyTickets().then((res) => res.data),
  });
};

/** Détail d'un ticket */
export const useTicketDetail = (id: number) => {
  return useQuery({
    queryKey: supportKeys.detail(id),
    queryFn: () => supportApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

/** Créer un ticket */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketRequest) =>
      supportApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.myTickets() });
    },
  });
};

/** Mettre à jour un ticket */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTicketRequest }) =>
      supportApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.myTickets() });
    },
  });
};

/** Supprimer un ticket */
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supportApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.myTickets() });
    },
  });
};

/** Envoyer un message (user) */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SendMessageRequest }) =>
      supportApi.sendMessage(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.myTickets() });
    },
  });
};

// ─── Admin hooks ───

/** Tous les tickets (admin) */
export const useAllTickets = () => {
  return useQuery({
    queryKey: supportKeys.adminAll(),
    queryFn: () => supportApi.getAllTickets().then((res) => res.data),
  });
};

/** Statistiques des tickets (admin) */
export const useTicketStats = () => {
  return useQuery({
    queryKey: supportKeys.adminStats(),
    queryFn: () => supportApi.getStats().then((res) => res.data),
    refetchInterval: 60_000,
  });
};

/** Envoyer un message admin */
export const useSendAdminMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SendMessageRequest }) =>
      supportApi.sendAdminMessage(id, data).then((res) => res.data),
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
      supportApi.updateStatus(id, status).then((res) => res.data),
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
      supportApi.updatePriority(id, priority).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: supportKeys.adminStats() });
    },
  });
};

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

