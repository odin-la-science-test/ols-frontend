import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT FORM SCHEMA — Validation Zod pour le formulaire de contact
// ═══════════════════════════════════════════════════════════════════════════

export const contactFormSchema = z.object({
  firstName: z.string().default(''),
  lastName: z.string().default(''),
  email: z.string().email('contacts.validation.emailInvalid').or(z.literal('')).default(''),
  phone: z.string().default(''),
  organization: z.string().default(''),
  jobTitle: z.string().default(''),
  notes: z.string().default(''),
}).refine(
  (data) => !!(data.firstName.trim() || data.lastName.trim() || data.email.trim() || data.phone.trim() || data.organization.trim()),
  { message: 'contacts.validation.atLeastOneField', path: ['firstName'] }
);

export type ContactFormData = z.infer<typeof contactFormSchema>;
