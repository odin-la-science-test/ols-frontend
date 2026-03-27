// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTIONS TYPES - Domain types for study collections module
// ═══════════════════════════════════════════════════════════════════════════

export interface StudyCollectionItem {
  id: number;
  moduleId: string;
  entityId: number;
  notes: string;
  addedAt: string;
}

export interface StudyCollection {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  items: StudyCollectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudyCollectionRequest {
  name: string;
  description?: string;
}

export interface UpdateStudyCollectionRequest {
  name?: string;
  description?: string;
}

export interface AddItemRequest {
  moduleId: string;
  entityId: number;
  notes?: string;
}
