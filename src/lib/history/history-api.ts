import api from '@/api/axios';
import type { HistoryEntryDTO } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY API — Backend endpoints for persistent history
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/history';

/** Fetch all history entries for a module scope (sorted ASC). */
export async function fetchHistory(moduleSlug: string): Promise<HistoryEntryDTO[]> {
  const res = await api.get<HistoryEntryDTO[]>(BASE, { params: { module: moduleSlug } });
  return res.data;
}

/** Clear all history entries for a module scope. */
export async function clearHistory(moduleSlug: string): Promise<void> {
  await api.delete(BASE, { params: { module: moduleSlug } });
}

/** Truncate the redo stack: delete all entries created after the given entry. */
export async function truncateAfter(entryId: number, moduleSlug: string): Promise<void> {
  await api.delete(`${BASE}/truncate-after/${entryId}`, { params: { module: moduleSlug } });
}
