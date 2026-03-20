// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT TYPES - Domain types for support ticket module
// ═══════════════════════════════════════════════════════════════════════════

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'QUESTION' | 'ACCOUNT' | 'OTHER';

export interface TicketMessage {
  id: number;
  content: string;
  admin: boolean;
  authorName: string;
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;

  /** Name of the ticket owner */
  ownerName: string;
  /** Email of the ticket owner */
  ownerEmail: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  category?: TicketCategory;
}

export interface SendMessageRequest {
  content: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}
