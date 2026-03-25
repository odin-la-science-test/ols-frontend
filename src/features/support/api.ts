import api from '@/api/axios';
import type {
  SupportTicket,
  CreateTicketRequest,
  UpdateTicketRequest,
  SendMessageRequest,
  TicketMessage,
  TicketStats,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT API - Endpoints for support ticket module
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/support';

export const supportApi = {
  // ─── User endpoints ───

  /** Créer un ticket de support */
  create: (data: CreateTicketRequest) =>
    api.post<SupportTicket>(BASE, data),

  /** Lister mes tickets */
  getMyTickets: () =>
    api.get<SupportTicket[]>(BASE),

  /** Rechercher dans mes tickets */
  search: (query: string) =>
    api.get<SupportTicket[]>(`${BASE}/search`, { params: { query } }),

  /** Détail d'un ticket par ID */
  getById: (id: number) =>
    api.get<SupportTicket>(`${BASE}/${id}`),

  /** Mettre à jour un ticket (tant qu'il est OPEN) */
  update: (id: number, data: UpdateTicketRequest) =>
    api.put<SupportTicket>(`${BASE}/${id}`, data),

  /** Supprimer un ticket (tant qu'il est OPEN) */
  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),

  /** Envoyer un message utilisateur dans un ticket */
  sendMessage: (id: number, data: SendMessageRequest) =>
    api.post<TicketMessage>(`${BASE}/${id}/messages`, data),

  // ─── Admin endpoints ───

  /** Lister tous les tickets (admin) */
  getAllTickets: () =>
    api.get<SupportTicket[]>(`${BASE}/admin`),

  /** Statistiques des tickets (admin) */
  getStats: () =>
    api.get<TicketStats>(`${BASE}/admin/stats`),

  /** Envoyer un message admin dans un ticket */
  sendAdminMessage: (id: number, data: SendMessageRequest) =>
    api.post<TicketMessage>(`${BASE}/admin/${id}/messages`, data),

  /** Changer le statut d'un ticket (admin) */
  updateStatus: (id: number, status: string) =>
    api.patch<SupportTicket>(`${BASE}/admin/${id}/status`, null, {
      params: { status },
    }),

  /** Changer la priorité d'un ticket (admin) */
  updatePriority: (id: number, priority: string) =>
    api.patch<SupportTicket>(`${BASE}/admin/${id}/priority`, null, {
      params: { priority },
    }),
};
