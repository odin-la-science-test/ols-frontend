import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATION FORM SCHEMA - Validation Zod pour le formulaire d'annotation
// ═══════════════════════════════════════════════════════════════════════════

export const annotationFormSchema = z.object({
  content: z.string().min(1, 'annotations.validation.contentRequired'),
  entityType: z.string().min(1, 'annotations.validation.entityTypeRequired'),
  entityId: z.coerce.number().int().positive('annotations.validation.entityIdRequired'),
  color: z.enum(['YELLOW', 'GREEN', 'BLUE', 'PINK']).default('YELLOW'),
});

export type AnnotationFormData = z.infer<typeof annotationFormSchema>;
