// ═══════════════════════════════════════════════════════════════════════════
// HISTORY TYPES — Command pattern for undo/redo
// ═══════════════════════════════════════════════════════════════════════════

export interface HistoryCommand {
  id: string;
  /** i18n key for the action label */
  labelKey: string;
  /** Lucide icon name */
  icon?: string;
  timestamp: number;
  execute: () => void | Promise<void>;
  undo: () => void | Promise<void>;
}

export interface HistoryScope {
  entries: HistoryCommand[];
  /** Index of the last executed command. -1 = nothing executed. */
  pointer: number;
}
