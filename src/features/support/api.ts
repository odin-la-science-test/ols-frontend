import api from '@/api/axios';
import { createCrudApi } from '@/api/module-api-factory';
import type {
  SupportTicket,
  CreateTicketRequest,
  UpdateTicketRequest,
  SendMessageRequest,
  TicketMessage,
  TicketStats,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT API - Standard CRUD via factory + custom admin/message endpoints
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/support';

/** Standard user CRUD endpoints (getAll, getById, search, create, update, delete, restore) */
export const supportApi = createCrudApi<SupportTicket, CreateTicketRequest, UpdateTicketRequest>(
  api, BASE, {
    restore: true,
  },
);

// ─── User message endpoint ───

/** Envoyer un message utilisateur dans un ticket */
export const sendMessage = (id: number, data: SendMessageRequest) =>
  api.post<TicketMessage>(`${BASE}/${id}/messages`, data);

// ─── Admin endpoints (not covered by factory) ───

/** Lister tous les tickets (admin) */
export const getAllTickets = () =>
  api.get<SupportTicket[]>(`${BASE}/admin`);

/** Statistiques des tickets (admin) */
export const getStats = () =>
  api.get<TicketStats>(`${BASE}/admin/stats`);

/** Envoyer un message admin dans un ticket */
export const sendAdminMessage = (id: number, data: SendMessageRequest) =>
  api.post<TicketMessage>(`${BASE}/admin/${id}/messages`, data);

/** Changer le statut d'un ticket (admin) */
export const updateStatus = (id: number, status: string) =>
  api.patch<SupportTicket>(`${BASE}/admin/${id}/status`, null, {
    params: { status },
  });

/** Changer la priorité d'un ticket (admin) */
export const updatePriority = (id: number, priority: string) =>
  api.patch<SupportTicket>(`${BASE}/admin/${id}/priority`, null, {
    params: { priority },
  });
