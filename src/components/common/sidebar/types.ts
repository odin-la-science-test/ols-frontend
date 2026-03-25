import type { ComponentType, ReactNode } from 'react';

import type { PanelZone, PanelRegistration } from '@/stores/panel-registry-store';

// ─── Context ─────────────────────────────────────────────────────────────

/** Context value for child panels to detect they're inside a unified sidebar */
export interface UnifiedSidebarContextValue {
  /** Which zone this sidebar represents */
  zone: PanelZone;
  /** true when multiple panels are shown simultaneously */
  isMultiPanel: boolean;
  /** Current view mode */
  viewMode: 'tabs' | 'stacked';
  /**
   * When true, child panels should suppress their own module headers
   * because the parent sidebar already provides one.
   */
  suppressModuleHeader: boolean;
}

// ─── Panel Renderer ──────────────────────────────────────────────────────

export type PanelRenderer = ComponentType<{ panelId: string; zone: PanelZone }>;

// ─── Component Props ─────────────────────────────────────────────────────

export interface SortableTabProps {
  panel: PanelRegistration;
  zone: PanelZone;
  isActive: boolean;
  density: string;
  onClick: () => void;
  onClose: () => void;
  showClose: boolean;
  multiTab: boolean;
}

export interface SidebarTabBarProps {
  panels: PanelRegistration[];
  activeTab: string | null;
  onTabClick: (panelId: string) => void;
  onTabClose: (panelId: string) => void;
  density: string;
  zone: PanelZone;
  /** Always show close x on each tab, even when there's only one panel */
  alwaysShowClose?: boolean;
}

export interface SidebarStackedProps {
  zone: PanelZone;
  panels: PanelRegistration[];
  renderPanel: (panelId: string) => ReactNode;
  onPanelClose: (panelId: string) => void;
  panelGroupId: string;
}

export interface UnifiedSidebarContentProps {
  /** Which zone this sidebar renders */
  zone: PanelZone;
  /** Custom renderer map: panelId -> ReactNode. Used by app-shell to inject panel content. */
  renderPanel: (panelId: string) => ReactNode;
  /**
   * 'sidebar' (default) — module-level side panel, bg-card, chevron close button.
   * 'activity' — app-level flyout next to activity bar, bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)], X close button.
   */
  variant?: 'sidebar' | 'activity';
  className?: string;
}
