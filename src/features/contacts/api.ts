import api from '@/api/axios';
import { createCrudApi } from '@/api/module-api-factory';
import type { Contact, CreateContactRequest, UpdateContactRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS API - Generated via createCrudApi factory
// ═══════════════════════════════════════════════════════════════════════════

export const contactsApi = createCrudApi<Contact, CreateContactRequest, UpdateContactRequest>(
  api, '/contacts', {
    restore: true,
    batchDelete: true,
    toggles: ['favorite'],
  },
);
