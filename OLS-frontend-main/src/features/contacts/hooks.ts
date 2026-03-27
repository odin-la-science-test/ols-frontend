import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from './api';
import { useOptimisticMutation } from '@/hooks';
import { eventBus } from '@/lib/event-bus';
import type { Contact, CreateContactRequest, UpdateContactRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const contactsKeys = {
  all: ['contacts'] as const,
  myContacts: () => [...contactsKeys.all, 'my-contacts'] as const,
  detail: (id: number) => [...contactsKeys.all, 'detail', id] as const,
  search: (query: string) => [...contactsKeys.all, 'search', query] as const,
};

/** Mes contacts */
export const useMyContacts = () => {
  return useQuery({
    queryKey: contactsKeys.myContacts(),
    queryFn: () => contactsApi.getMyContacts().then((res) => res.data),
  });
};

/** Détail d'un contact */
export const useContactDetail = (id: number) => {
  return useQuery({
    queryKey: contactsKeys.detail(id),
    queryFn: () => contactsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

/** Recherche */
export const useSearchContacts = (query: string) => {
  return useQuery({
    queryKey: contactsKeys.search(query),
    queryFn: () => contactsApi.search(query).then((res) => res.data),
    enabled: query.length >= 2,
  });
};

/** Créer un contact (optimistic) */
export const useCreateContact = () => {
  return useOptimisticMutation<Contact, CreateContactRequest>({
    mutationFn: async (data) => {
      const contact = await contactsApi.create(data).then((res) => res.data);
      eventBus.emit('contacts:created', { contact });
      return contact;
    },
    queryKey: contactsKeys.myContacts(),
    updateCache: (old, data) => [
      ...(old ?? []),
      { id: Date.now(), ...data, favorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ownerName: '', isAppUser: false } as Contact,
    ],
  });
};

/** Mettre à jour un contact (optimistic) */
export const useUpdateContact = () => {
  return useOptimisticMutation<Contact, { id: number; data: UpdateContactRequest }>({
    mutationFn: async ({ id, data }) => {
      const contact = await contactsApi.update(id, data).then((res) => res.data);
      eventBus.emit('contacts:updated', { contact });
      return contact;
    },
    queryKey: contactsKeys.myContacts(),
    updateCache: (old, { id, data }) =>
      (old ?? []).map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)),
  });
};

/** Supprimer un contact (optimistic) */
export const useDeleteContact = () => {
  return useOptimisticMutation<Contact, number>({
    mutationFn: async (id) => {
      await contactsApi.delete(id);
      eventBus.emit('contacts:deleted', { id });
      return {} as Contact;
    },
    queryKey: contactsKeys.myContacts(),
    updateCache: (old, id) => (old ?? []).filter((c) => c.id !== id),
    errorMessageKey: 'contacts.deleteError',
  });
};

/** Restaurer un contact supprimé */
export const useRestoreContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsApi.restore(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.myContacts() });
    },
  });
};

/** Supprimer plusieurs contacts */
export const useBatchDeleteContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      contactsApi.batchDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.myContacts() });
    },
  });
};

/** Toggle favori */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsApi.toggleFavorite(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.myContacts() });
    },
  });
};
