// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATIONS TYPES - Domain types for annotations module
// ═══════════════════════════════════════════════════════════════════════════

export type AnnotationColor = 'YELLOW' | 'GREEN' | 'BLUE' | 'PINK';

export interface Annotation {
  id: number;
  entityType: string;
  entityId: number;
  content: string;
  color: AnnotationColor;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
}

export interface CreateAnnotationRequest {
  entityType: string;
  entityId: number;
  content: string;
  color?: AnnotationColor;
}

export interface UpdateAnnotationRequest {
  content?: string;
  color?: AnnotationColor;
}
