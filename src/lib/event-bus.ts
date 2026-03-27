// ═══════════════════════════════════════════════════════════════════════════
// EVENT BUS - Typed pub/sub for inter-module communication
//
// Lightweight event bus mirroring backend domain events (ModuleEvent).
// Modules extend the ModuleEvents interface to register their events.
// ═══════════════════════════════════════════════════════════════════════════

import { logger } from '@/lib/logger';

// Type-safe event map — modules extend this via declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ModuleEvents {
  /** Emitted from the command palette to toggle comparison mode in the active collection */
  'platform:toggleComparison': undefined;

  // ── Contacts events ──
  'contacts:created': { contact: { id: number } };
  'contacts:updated': { contact: { id: number } };
  'contacts:deleted': { id: number };

  // ── Notes events ──
  'notes:created': { note: { id: number } };
  'notes:updated': { note: { id: number } };
  'notes:deleted': { id: number };

  [event: string]: unknown;
}

type EventHandler<T> = (payload: T) => void;

export function createEventBus<TEvents extends Record<string, unknown>>() {
  const listeners = new Map<keyof TEvents, Set<EventHandler<never>>>();

  return {
    emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
      logger.debug(`[EventBus] emit: ${String(event)}`, payload);
      const handlers = listeners.get(event);
      if (handlers) {
        handlers.forEach((handler) => handler(payload as never));
      }
    },

    on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): () => void {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler as EventHandler<never>);
      return () => {
        listeners.get(event)?.delete(handler as EventHandler<never>);
      };
    },

    off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
      listeners.get(event)?.delete(handler as EventHandler<never>);
    },

    clear(): void {
      listeners.clear();
    },
  };
}

/** Singleton event bus — use ModuleEvents declaration merging to add events */
export const eventBus = createEventBus<ModuleEvents>();
