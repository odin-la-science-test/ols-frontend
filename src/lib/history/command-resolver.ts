import api from '@/api/axios';
import { QueryClient } from '@tanstack/react-query';
import type { ActionDescriptor } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND RESOLVER — Reconstructs execute/undo from ActionDescriptor
//
// Uses axios directly with generic URL pattern /{moduleSlug}/{entityId}.
// All requests include X-History-Skip header to prevent double-recording.
// ═══════════════════════════════════════════════════════════════════════════

const SKIP_HEADER = { 'X-History-Skip': 'true' };

interface ResolvedCommand {
  execute: () => Promise<void>;
  undo: () => Promise<void>;
}

/**
 * Resolves an ActionDescriptor into executable functions for undo/redo.
 * After each operation, invalidates the module's React Query cache.
 */
export function resolveCommand(descriptor: ActionDescriptor, queryClient: QueryClient): ResolvedCommand {
  const { actionType, moduleSlug, entityId, previousData, newData } = descriptor;
  const baseUrl = `/${moduleSlug}`;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [moduleSlug] });

  switch (actionType) {
    case 'CREATE':
      return {
        // Redo create = restore the soft-deleted entity
        execute: async () => {
          await api.patch(`${baseUrl}/${entityId}/restore`, null, { headers: SKIP_HEADER });
          await invalidate();
        },
        // Undo create = soft-delete the entity
        undo: async () => {
          await api.delete(`${baseUrl}/${entityId}`, { headers: SKIP_HEADER });
          await invalidate();
        },
      };

    case 'UPDATE':
      return {
        // Redo update = apply newData
        execute: async () => {
          await api.put(`${baseUrl}/${entityId}`, newData, { headers: SKIP_HEADER });
          await invalidate();
        },
        // Undo update = apply previousData
        undo: async () => {
          await api.put(`${baseUrl}/${entityId}`, previousData, { headers: SKIP_HEADER });
          await invalidate();
        },
      };

    case 'DELETE':
      return {
        // Redo delete = soft-delete the entity
        execute: async () => {
          await api.delete(`${baseUrl}/${entityId}`, { headers: SKIP_HEADER });
          await invalidate();
        },
        // Undo delete = restore the entity
        undo: async () => {
          await api.patch(`${baseUrl}/${entityId}/restore`, null, { headers: SKIP_HEADER });
          await invalidate();
        },
      };

    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}
