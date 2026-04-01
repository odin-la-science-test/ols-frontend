import api from '@/api/axios';
import { createCrudApi } from '@/api/module-api-factory';
import type { StudyCollection, CreateStudyCollectionRequest, UpdateStudyCollectionRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTIONS API - Generated via createCrudApi factory
// ═══════════════════════════════════════════════════════════════════════════

export const studyCollectionsApi = createCrudApi<StudyCollection, CreateStudyCollectionRequest, UpdateStudyCollectionRequest>(
  api, '/study-collections', {
    restore: true,
    subResources: [{ name: 'items', methods: ['add', 'remove'] }],
  },
);
