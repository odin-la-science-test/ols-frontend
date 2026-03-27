import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// SHARE FORM SCHEMA — Validation Zod pour le formulaire QuickShare
// Note : les fichiers (File[]) sont gérés en state local (non sérialisables)
// ═══════════════════════════════════════════════════════════════════════════

export const shareFormSchema = z.object({
  mode: z.enum(['text', 'file']).default('text'),
  title: z.string().default(''),
  textContent: z.string().default(''),
  expiration: z.enum(['1h', '24h', '7d', 'never']).default('never'),
  maxDownloads: z.string().default(''),
  recipientEmail: z.string().default(''),
});

export type ShareFormData = z.infer<typeof shareFormSchema>;
