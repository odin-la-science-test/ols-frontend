import api from '@/api/axios';
import { createCrudApi } from '@/api/module-api-factory';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTES API - Generated via createCrudApi factory
// ═══════════════════════════════════════════════════════════════════════════

export const notesApi = createCrudApi<Note, CreateNoteRequest, UpdateNoteRequest>(
  api, '/notes', {
    restore: true,
    batchDelete: true,
    toggles: ['pin'],
  },
);

// Custom endpoint not covered by factory
export const searchByTag = (tag: string) =>
  api.get<Note[]>('/notes/search/tags', { params: { query: tag } });
