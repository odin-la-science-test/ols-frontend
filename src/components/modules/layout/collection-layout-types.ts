import type { ComponentType, ReactNode } from 'react';

import type { TFunction } from 'i18next';
import type { ColumnDef, StatItem, FilterConfig, CardConfig } from '@/components/modules/types';
import type { ComparisonField } from '@/components/modules/shared/comparison-panel';
import type { MobileMenuItem } from './module-header';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION LAYOUT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const MAX_COMPARISON_ITEMS = 5;

// ─── Render prop types ───

export interface DetailRenderProps<T> {
  item: T;
  onClose: () => void;
  onEdit?: () => void;
}

export interface EditorRenderProps<T> {
  item?: T;
  onSaved: (item: T) => void;
  onCancel: () => void;
  moduleKey: string;
}

// ─── Translation keys ───

export interface CollectionTranslations {
  title: string;
  searchPlaceholder: string;
  loading: string;
  error: string;
  errorDesc: string;
  emptyTitle: string;
  emptyDatabase: string;
  searchNoResults: (query: string) => string;
  filterNoMatch: string;
}

// ─── Props ───

export interface CollectionLayoutProps<T extends { id: number; confidenceScore?: number }> {
  // Identity
  moduleKey: string;
  title: string;
  icon: string;
  backTo?: string;

  // Data
  useData: () => { data?: T[]; isLoading: boolean; isError?: boolean; refetch?: () => void };
  useSearch?: (query: string) => { data?: T[]; isLoading: boolean };

  // Rendering (declarative)
  columns: (data: T[], t: TFunction) => ColumnDef<T>[];
  cardConfig?: (t: TFunction) => CardConfig<T>;

  // Optional features
  filters?: FilterConfig[] | ((t: TFunction) => FilterConfig[]);
  computeStats?: (data: T[], t: TFunction) => StatItem[];
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  search?: boolean;

  // Item click — if provided, clicking a row calls this instead of opening detail panel (drill-down pattern)
  onItemClick?: (item: T) => void;

  // Detail/Editor
  renderDetail: (props: DetailRenderProps<T>) => ReactNode;
  renderEditor?: (props: EditorRenderProps<T>) => ReactNode;
  hasEdit?: boolean;

  // Comparison
  comparison?: { fields: (t: TFunction) => ComparisonField<T>[] };
  showCompare?: boolean;

  // Export
  exportConfig?: { getColumns: (data: T[], t: TFunction) => Array<{ key: keyof T; header: string }> };
  showExport?: boolean;

  // Identification (scientific modules only)
  IdentificationToolsComponent?: ComponentType<{
    onResults?: (results: unknown[]) => void;
    onAction?: () => void;
  }>;

  // New item
  newItemConfig?: { labelKey: string; createTitle?: string; editTitle?: string };

  // Mobile menu
  useMobileMenuItems?: () => MobileMenuItem[];

  // Translations
  translations: CollectionTranslations;
}

export type FormMode = 'create' | 'edit' | null;
