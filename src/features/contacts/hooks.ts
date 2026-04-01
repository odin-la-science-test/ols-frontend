import { createCrudHooks } from '@/hooks/create-crud-hooks';
import { contactsApi } from './api';
import type { Contact, CreateContactRequest, UpdateContactRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS HOOKS - Generated via createCrudHooks factory
// ═══════════════════════════════════════════════════════════════════════════

const crud = createCrudHooks<Contact, CreateContactRequest, UpdateContactRequest>(
  contactsApi, 'contacts', {
    optimistic: true,
    events: { created: 'contacts:created', updated: 'contacts:updated', deleted: 'contacts:deleted' },
    deleteErrorKey: 'contacts.deleteError',
    toggles: ['favorite'],
  },
);

export const contactsKeys = crud.keys;
export const useMyContacts = crud.useList;
export const useContactDetail = crud.useDetail;
export const useSearchContacts = crud.useSearch;
export const useCreateContact = crud.useCreate;
export const useUpdateContact = crud.useUpdate;
export const useDeleteContact = crud.useDelete;
export const useRestoreContact = crud.useRestore;
export const useBatchDeleteContacts = crud.useBatchDelete;
export const useToggleFavorite = (crud as Record<string, unknown>).useToggleFavorite as () => ReturnType<typeof import('@tanstack/react-query').useMutation>;
