import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTION FORM SCHEMA — Validation Zod
// ═══════════════════════════════════════════════════════════════════════════

export const studyCollectionFormSchema = z.object({
  name: z.string().min(1, 'studyCollections.validation.nameRequired'),
  description: z.string().default(''),
});

export type StudyCollectionFormData = z.infer<typeof studyCollectionFormSchema>;
