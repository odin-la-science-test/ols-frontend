import type { ComponentType, LazyExoticComponent } from 'react';
import type { DynamicBottomTab } from '@/stores/bottom-panel-store';
import type { TourStep, ContextualTip } from '@/lib/tour/types';
export type { TourStep, ContextualTip } from '@/lib/tour/types';

// ─── Activity Panel ──────────────────────────────────────────────────────

/** Compact panel that a module contributes to the activity bar sidebar */
export interface ModuleActivityPanel {
  /** Unique panel id (defaults to module id if not provided) */
  id?: string;
  /** i18n key for the panel title */
  titleKey: string;
  /** Lucide icon name for the activity bar button */
  icon: string;
  /** Lazy-loaded React component to render as compact panel content */
  component: LazyExoticComponent<ComponentType<unknown>>;
  /** Sort priority in activity bar (lower = higher, default 50) */
  priority?: number;
  /** Optional React hook returning the current badge count (reactive, no polling) */
  useBadgeCount?: () => number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRY TYPES — The contract every module must implement
//
// This is the "extension API" of OLS. Like VS Code, the core provides
// the environment (sidebar, panels, tabs, command palette, etc.) and
// modules plug their content via this standardized contract.
//
// Rule: adding a module = creating files in src/features/{module}/ only.
// The core never references modules by name — it reads from the registry.
// ═══════════════════════════════════════════════════════════════════════════

/** Route definition for a module */
export interface ModuleRoute {
  /** Route path relative to root, e.g. 'atlas/bacteriology' */
  path: string;
  /** Lazy-loaded page component */
  element: LazyExoticComponent<ComponentType<unknown>>;
  /** Optional child routes */
  children?: ModuleRoute[];
  /** If true, route is accessible without authentication */
  public?: boolean;
}

/** Search result returned by a module's search provider */
export interface ModuleSearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  tags?: string[];
}

/** Search provider that a module can register for federated search */
export interface ModuleSearchProvider {
  /** Translation key for search result group header */
  resultTypeKey: string;
  /** Lucide icon name for search results */
  resultIcon: string;
  /** Route path to navigate when a result is selected */
  resultRoute: string;
  /** Full-text entity search (@ mode) — searches across entity fields */
  search: (query: string) => Promise<ModuleSearchResult[]>;
  /** Tag-specific search (# mode) — cheap prefix match on tags. Presence = module supports tag search. */
  searchByTag?: (tag: string) => Promise<ModuleSearchResult[]>;
}

/** Command that a module contributes to the command palette */
export interface ModuleCommand {
  id: string;
  /** i18n key for the command label */
  labelKey: string;
  /** Lucide icon name */
  icon?: string;
  /** Action to execute */
  action: () => void;
  /** Keyboard shortcut (display only) */
  shortcut?: string;
}

/** Action that a module contributes to toolbar/menu bar */
export interface ModuleAction {
  id: string;
  /** i18n key for the action label */
  labelKey: string;
  /** Lucide icon name */
  icon: string;
  /** Where the action appears: toolbar (breadcrumbs zone), menu (menu bar), or both */
  placement: 'toolbar' | 'menu' | 'both';
  /** Whether this action is available on mobile */
  mobile: boolean;
  /** Action callback */
  action: () => void;
  /** Returns true when the action is in an "active" state (e.g., compare mode on) */
  isActive?: () => boolean;
  /** Returns true when the action should be disabled */
  isDisabled?: () => boolean;
  /** Show a visual separator before this action */
  separator?: boolean;
}

// ─── Widget Settings ─────────────────────────────────────────────────────

/** A single configurable setting for a widget */
export type WidgetSettingDef =
  | { key: string; type: 'boolean'; labelKey: string; defaultValue: boolean }
  | { key: string; type: 'select'; labelKey: string; defaultValue: string; options: { value: string; labelKey: string }[] };

/** Grid size expressed in columns and rows */
export interface WidgetGridSize {
  /** Number of columns to span (on a 4-column grid) */
  w: number;
  /** Number of rows to span */
  h: number;
}

/** Widget that a module contributes to the dashboard */
export interface ModuleWidget {
  /** Unique widget id, e.g. 'bacteriology-recent-ids' */
  id: string;
  /** i18n key for widget title */
  titleKey: string;
  /** Lucide icon name */
  icon: string;
  /** React component to render as widget content */
  component: ComponentType;
  /** Default grid dimensions (on a 4-column grid) */
  defaultSize: WidgetGridSize;
  /** Minimum resize constraints */
  minSize?: WidgetGridSize;
  /** Maximum resize constraints */
  maxSize?: WidgetGridSize;
  /** Whether visible by default on the dashboard */
  defaultVisible: boolean;
  /** Optional configurable settings for this widget */
  settings?: WidgetSettingDef[];
}

/** Lifecycle hooks for module activation/deactivation */
export interface ModuleLifecycle {
  /** Called when the module route is entered. Return a cleanup function (optional). */
  onActivate?: () => void | (() => void);
  /** Called when the module route is exited */
  onDeactivate?: () => void;
}

/** A single configurable setting field contributed by a module */
export type ModuleSettingField =
  | { key: string; type: 'toggle'; labelKey: string; defaultValue: boolean }
  | { key: string; type: 'select'; labelKey: string; defaultValue: string; options: { value: string; labelKey: string }[] }
  | { key: string; type: 'number'; labelKey: string; defaultValue: number; min?: number; max?: number }
  | { key: string; type: 'text'; labelKey: string; defaultValue: string };

/** Settings section that a module contributes to the global Settings page */
export interface ModuleSettingsSection {
  /** i18n key for the section title */
  titleKey: string;
  /** Setting fields in this section */
  fields: ModuleSettingField[];
}

/**
 * The contract every module must implement.
 *
 * Modules register a ModuleDefinition and the core shell uses it to:
 * - Generate routes (router)
 * - Populate the command palette (navigation + commands)
 * - Run federated search (@)
 * - Show breadcrumbs, status bar labels, menu bar labels
 * - Render in split view
 * - Display dashboard widgets
 * - Register bottom panel tabs
 * - Show compact activity bar panels with optional badges
 */
export interface ModuleDefinition {
  /** Unique module identifier */
  id: string;
  /** Backend catalogue key for API correlation, e.g. 'MUNIN_BACTERIO' */
  moduleKey: string;
  /** i18n key for the module title, e.g. 'bacteriology.title' */
  translationKey: string;
  /** i18n key for the module description (used in hub cards) */
  descriptionKey?: string;
  /** Lucide icon name (must exist in MODULE_ICONS_MAP) */
  icon: string;
  /** Module accent color as HSL string */
  accentColor: string;
  /** Platform this module belongs to */
  platform: 'atlas' | 'lab' | 'system';
  /** Route configuration */
  route: ModuleRoute;
  /** Optional: admin view component — rendered instead of user view when user is ADMIN */
  adminView?: LazyExoticComponent<ComponentType<unknown>>;
  /** Optional: federated search provider for @ and # modes */
  search?: ModuleSearchProvider;
  /** Optional: commands for command palette > mode */
  commands?: ModuleCommand[];
  /** Optional: bottom panel tabs (registered on module mount) */
  bottomPanelTabs?: DynamicBottomTab[];
  /** Optional: dashboard widgets */
  widgets?: ModuleWidget[];
  /** Optional: compact panel for the activity bar sidebar */
  activityPanel?: ModuleActivityPanel;
  /** Optional: guided tour steps for this module (auto-triggered on first visit) */
  tour?: TourStep[];
  /** Optional: lifecycle hooks (called on route enter/exit) */
  lifecycle?: ModuleLifecycle;
  /** Optional: settings sections contributed to the global Settings page */
  settings?: ModuleSettingsSection[];
  /** Optional: contextual tips (single-step hints, auto-triggered based on conditions) */
  tips?: ContextualTip[];
}
