import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from './api';
import type { CreateContactRequest, UpdateContactRequest } from './types';

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

/** Créer un contact */
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactRequest) =>
      contactsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.myContacts() });
    },
  });
};

/** Mettre à jour un contact */
export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContactRequest }) =>
      contactsApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.myContacts() });
    },
  });
};

/** Supprimer un contact */
export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsApi.delete(id),
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
