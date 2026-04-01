// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT TYPES - Domain types for support ticket module
// ═══════════════════════════════════════════════════════════════════════════

import type { TFunction } from 'i18next';

export type { TicketStatus, TicketPriority, TicketCategory } from '@/api/generated/enums';
import type { TicketStatus, TicketPriority, TicketCategory } from '@/api/generated/enums';

export function ticketStatusLabel(status: TicketStatus, t: TFunction): string {
  switch (status) {
    case 'OPEN': return t('support.statuses.OPEN');
    case 'IN_PROGRESS': return t('support.statuses.IN_PROGRESS');
    case 'RESOLVED': return t('support.statuses.RESOLVED');
    case 'CLOSED': return t('support.statuses.CLOSED');
  }
}

export function ticketPriorityLabel(priority: TicketPriority, t: TFunction): string {
  switch (priority) {
    case 'LOW': return t('support.priorities.LOW');
    case 'MEDIUM': return t('support.priorities.MEDIUM');
    case 'HIGH': return t('support.priorities.HIGH');
    case 'CRITICAL': return t('support.priorities.CRITICAL');
  }
}

export function ticketCategoryLabel(category: TicketCategory, t: TFunction): string {
  switch (category) {
    case 'BUG': return t('support.categories.BUG');
    case 'FEATURE_REQUEST': return t('support.categories.FEATURE_REQUEST');
    case 'QUESTION': return t('support.categories.QUESTION');
    case 'ACCOUNT': return t('support.categories.ACCOUNT');
    case 'OTHER': return t('support.categories.OTHER');
  }
}

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
