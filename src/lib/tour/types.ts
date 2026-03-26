// ═══════════════════════════════════════════════════════════════════════════
// TOUR TYPES — Shared types for the guided tour system
// ═══════════════════════════════════════════════════════════════════════════

/** A single step in a guided tour */
export interface TourStep {
  /** CSS selector for the target element (omit for popover-only step) */
  element?: string;
  /** i18n key for the step title */
  titleKey: string;
  /** i18n key for the step description */
  descriptionKey: string;
  /** Popover placement relative to target */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Popover alignment */
  align?: 'start' | 'center' | 'end';
}

/** A complete tour definition */
export interface TourDefinition {
  /** Unique tour identifier, e.g. 'global-shell' or 'tour-bacteriology' */
  id: string;
  /** i18n key for the tour name (shown in help menu) */
  nameKey: string;
  /** Ordered list of steps */
  steps: TourStep[];
}

/** Lightweight single-step contextual hint */
export interface ContextualTip {
  /** Unique tip ID, e.g. 'bacteriology-first-search' */
  id: string;
  /** CSS selector for the anchor element */
  element: string;
  /** i18n key for the tip text */
  descriptionKey: string;
  /** Popover placement */
  side?: 'top' | 'right' | 'bottom' | 'left';
}
