import type { ComponentType } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// PANEL REGISTRY TYPES — Type definitions for the panel registry store
// ═══════════════════════════════════════════════════════════════════════════

/** Zone where a panel can live */
export type PanelZone = 'activity-panel' | 'primary' | 'secondary';

/** Category of the panel */
export type PanelCategory = 'app' | 'module';

/** View mode for sidebar when multiple panels are present */
export type SidebarViewMode = 'tabs' | 'stacked';

/** A registered panel in the workspace */
export interface PanelRegistration {
  /** Unique panel id (e.g. 'explorer', 'notes', 'bacteriology-filters') */
  id: string;
  /** Display label (translation key or plain text) */
  label: string;
  /** Lucide icon name */
  icon: string;
  /** Accent color (optional, for module panels) */
  accentColor?: string;
  /** Category: 'app' for built-in panels, 'module' for contextual */
  category: PanelCategory;
  /** Which zone this panel is currently placed in */
  zone: PanelZone;
  /** Sort priority within its zone (lower = first, default 50) */
  priority?: number;
  /** Whether this is a portal-based panel (module content via createPortal) */
  isPortal?: boolean;
  /** Module key that owns this panel (for module panels) */
  moduleKey?: string;
  /** Editor group id for split-aware panels */
  editorGroupId?: string;
  /** React component to render this panel's content (for registry-driven panels) */
  renderComponent?: ComponentType;
}

/** Per-zone sidebar state */
export interface SidebarZoneState {
  /** Ordered list of visible panel IDs in this zone */
  stack: string[];
  /** Active tab (when in tabs mode) */
  activeTab: string | null;
  /** View mode: tabs or stacked */
  viewMode: SidebarViewMode;
  /** Whether this sidebar is open */
  isOpen: boolean;
}

export interface PanelRegistryState {
  /** All registered panels (id → registration) */
  panels: Record<string, PanelRegistration>;

  /** Per-zone sidebar state */
  zones: Record<PanelZone, SidebarZoneState>;

  /** User's preferred zone for app panels (persisted so drag changes stick) */
  panelPlacements: Record<string, PanelZone>;

  // ── Panel registration ──

  /** Register a panel (idempotent — updates if already exists) */
  registerPanel: (panel: PanelRegistration) => void;

  /** Unregister a panel by id */
  unregisterPanel: (panelId: string) => void;

  // ── Zone / sidebar management ──

  /** Open a sidebar zone (makes it visible) */
  openZone: (zone: PanelZone) => void;

  /** Close a sidebar zone */
  closeZone: (zone: PanelZone) => void;

  /** Toggle a sidebar zone */
  toggleZone: (zone: PanelZone) => void;

  /** Add a panel to a zone's stack (shows it) */
  addToZone: (zone: PanelZone, panelId: string) => void;

  /** Remove a panel from a zone's stack */
  removeFromZone: (zone: PanelZone, panelId: string) => void;

  /** Set the entire stack for a zone */
  setZoneStack: (zone: PanelZone, panelIds: string[]) => void;

  /** Set active tab for a zone */
  setActiveTab: (zone: PanelZone, panelId: string) => void;

  /** Toggle view mode for a zone */
  toggleViewMode: (zone: PanelZone) => void;

  /** Set view mode explicitly */
  setViewMode: (zone: PanelZone, mode: SidebarViewMode) => void;

  // ── Panel movement (drag & drop) ──

  /** Move a panel from one zone to another */
  movePanel: (panelId: string, toZone: PanelZone) => void;

  /** Reorder panels within a zone's stack */
  reorderInZone: (zone: PanelZone, fromIndex: number, toIndex: number) => void;

  // ── Toggle panel (Activity Bar click behavior) ──

  /**
   * Toggle a panel in a zone:
   * - If the panel is the only one in the zone → toggle zone open/closed
   * - If the panel is in a multi-panel stack → make it active tab
   * - If the panel is not in the zone → add it and open the zone
   */
  togglePanel: (panelId: string, zone: PanelZone) => void;

  /**
   * Stack a panel (Ctrl+Click): add to existing stack without replacing.
   * If already in stack → remove it (toggle off).
   */
  stackPanel: (panelId: string, zone: PanelZone) => void;

  // ── Queries ──

  /** Get all panels for a specific zone */
  getPanelsForZone: (zone: PanelZone) => PanelRegistration[];

  /** Check if a panel is in a zone's stack */
  isInZoneStack: (zone: PanelZone, panelId: string) => boolean;

  /** Get active panel ID for a zone */
  getActivePanel: (zone: PanelZone) => string | null;

  /**
   * Resolve the current zone of a panel.
   * Respects user-overridden placements (drag & drop) over the panel's default zone.
   * Falls back to the panel registration's zone, then to `fallback`.
   */
  getZoneForPanel: (panelId: string, fallback?: PanelZone) => PanelZone;

  /** Reset to defaults */
  resetToDefaults: () => void;
}
