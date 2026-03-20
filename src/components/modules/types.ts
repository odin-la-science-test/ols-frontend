import type { LucideIcon } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE TYPES - Shared types for all module pages
// ═══════════════════════════════════════════════════════════════════════════

export interface ModuleConfig {
  moduleKey: string;
  title: string;
  icon: LucideIcon;
  accentColor: string;
  description?: string;
}

// ─── Data Table Types ───
export interface ColumnDef<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// ─── Filter Types ───
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multi-select' | 'boolean' | 'range';
  options?: FilterOption[];
  icon?: LucideIcon;
}

export interface ActiveFilter {
  key: string;
  value: string | string[] | boolean | [number, number];
}

// ─── Stats Types ───
export interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'default' | 'success' | 'warning' | 'destructive';
}

// ─── Detail Panel Types ───
export interface DetailField {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'list' | 'code' | 'boolean';
  icon?: LucideIcon;
  group?: string;
}

// ─── Sidebar Navigation Types ───
export interface SidebarSection {
  id: string;
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  content: React.ReactNode;
}

// ─── View Mode Types ───
export type ViewMode = 'table' | 'cards';

// ─── Card Configuration Types ───
export interface CardFieldConfig<T> {
  key: keyof T | string;
  /** Short label displayed (can be abbreviated) */
  label?: string;
  /** Full label for tooltip (if different from label) */
  fullLabel?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface CardConfig<T> {
  /** Main title field (e.g., species name) */
  titleField: keyof T;
  /** Optional subtitle field (e.g., strain) */
  subtitleField?: keyof T;
  /** Badges to display (categories, types, etc.) */
  badges?: CardFieldConfig<T>[];
  /** Description or main info field */
  descriptionField?: keyof T;
  /** Label for description field */
  descriptionLabel?: string;
  /** Grid of key info to show at bottom */
  infoFields?: CardFieldConfig<T>[];
}
