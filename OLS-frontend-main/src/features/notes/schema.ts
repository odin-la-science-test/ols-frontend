import { z } from 'zod';
import { NOTE_COLORS } from '@/api/generated/enum-values';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE FORM SCHEMA — Validation Zod pour le formulaire de note
// ═══════════════════════════════════════════════════════════════════════════

export const noteFormSchema = z.object({
  title: z.string().min(1, 'notes.validation.titleRequired'),
  content: z.string().default(''),
  color: z.enum(NOTE_COLORS).nullable().default(null),
  tags: z.array(z.string()).default([]),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;
