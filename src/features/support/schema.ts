import { z } from 'zod';
import { TICKET_CATEGORIES } from '@/api/generated/enum-values';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET FORM SCHEMA — Validation Zod pour le formulaire de ticket support
// ═══════════════════════════════════════════════════════════════════════════

export const ticketFormSchema = z.object({
  subject: z.string().min(1, 'support.validation.subjectRequired'),
  description: z.string().min(1, 'support.validation.descriptionRequired'),
  category: z.enum(TICKET_CATEGORIES).default('QUESTION'),
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;
