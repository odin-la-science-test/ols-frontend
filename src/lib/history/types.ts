// ═══════════════════════════════════════════════════════════════════════════
// HISTORY TYPES — Persistent undo/redo with action descriptors
//
// Replaces closure-based commands with serializable descriptors.
// The CommandResolver reconstructs execute/undo functions at runtime.
// ═══════════════════════════════════════════════════════════════════════════

export type HistoryActionType = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * Serializable descriptor of a CRUD action.
 * Stored in backend, used by CommandResolver to reconstruct undo/redo.
 */
export interface ActionDescriptor {
  actionType: HistoryActionType;
  moduleSlug: string;
  entityId: number;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}

/**
 * Persistent history command — loaded from backend.
 * No closures, fully serializable.
 */
export interface HistoryCommand {
  id: number;
  labelKey: string;
  icon?: string;
  timestamp: number;
  descriptor: ActionDescriptor;
}

/**
 * History scope — entries + pointer for undo/redo navigation.
 * Pointer is local only (not persisted), reset to latest on load.
 */
export interface HistoryScope {
  entries: HistoryCommand[];
  /** Index of the last executed command. -1 = nothing executed. */
  pointer: number;
  /** Whether this scope is currently loading from backend. */
  isLoading: boolean;
}

/**
 * Backend DTO for history entries.
 */
export interface HistoryEntryDTO {
  id: number;
  moduleSlug: string;
  actionType: HistoryActionType;
  entityId: number;
  labelKey: string;
  icon?: string;
  previousData?: string;
  newData?: string;
  createdAt: string;
}
