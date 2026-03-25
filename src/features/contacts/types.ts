// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS TYPES - Domain types for contacts module
// ═══════════════════════════════════════════════════════════════════════════

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  jobTitle: string | null;
  notes: string | null;
  favorite: boolean;

  createdAt: string;
  updatedAt: string;

  ownerName: string;

  /** Whether the contact's email matches a registered OLS user */
  isAppUser: boolean;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  organization?: string;
  jobTitle?: string;
  notes?: string;
  favorite?: boolean;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  jobTitle?: string;
  notes?: string;
  favorite?: boolean;
}
