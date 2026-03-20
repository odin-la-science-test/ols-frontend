import type { ComponentType, ElementType } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getModuleIcon } from './module-icons';
import { ModulePageTemplate } from '@/components/modules/shared';
import { useWorkspaceStore, useTabsStore } from '@/stores';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { TFunction } from 'i18next';

// ═══════════════════════════════════════════════════════════════════════════
// CREATE MODULE PAGE - Factory for generating module pages
// ═══════════════════════════════════════════════════════════════════════════

/**
 * No-op hook that returns undefined when no mobile menu items are provided.
 * This ensures consistent hook call order across all module pages.
 */
const useNoMobileMenuItems = () => undefined;

/**
 * Translations for a module page
 */
export interface ModuleTranslations {
  /** Page title (e.g., 'Bacteriology') */
  title: string;
  /** Search placeholder (e.g., 'Search bacteria...') */
  searchPlaceholder: string;
  /** Loading message */
  loading: string;
  /** Error title */
  error: string;
  /** Error description */
  errorDesc: string;
  /** Empty state title */
  emptyTitle: string;
  /** Empty database message */
  emptyDatabase: string;
  /** Search no results message - function receiving query */
  searchNoResults: (query: string) => string;
  /** Filter no match message */
  filterNoMatch: string;
}

/**
 * Configuration for creating a module page
 */
export interface ModulePageConfig<T extends { id: number; confidenceScore?: number }, P> {
  /** Function to get translations */
  translations: (t: TFunction) => ModuleTranslations;
  
  /** Module accent color (HSL format) */
  accentColor: string;
  
  /** Icon name for the module (lucide icon name or custom) */
  iconName: string;
  
  /** Hook to fetch all entities */
  useData: (params?: P) => { data?: T[]; isLoading: boolean; isError: boolean; refetch: () => void };
  
  /** Hook to search entities (optional - if not provided, search filters client-side) */
  useSearch?: (query: string) => { data?: T[]; isLoading: boolean };
  
  /** Default sort configuration (optional - defaults to first column asc) */
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  
  /** Filter configuration for the module or function returning filters */
  filters: FilterConfig[] | ((t: TFunction) => FilterConfig[]);
  
  /** Function to get table columns based on data and translation */
  getColumns: (data: T[], t: TFunction) => ColumnDef<T>[];
  
  /** Function to compute statistics from data */
  computeStats: (data: T[], t: TFunction) => StatItem[];
  
  /** Function to get export columns (optional) */
  getExportColumns?: (data: T[], t: TFunction) => Array<{ key: keyof T; header: string }>;

  /** Function to get card configuration (optional - enables card view) */
  getCardConfig?: (t: TFunction) => CardConfig<T>;

  /** Identification tools component (optional - only for scientific modules) */
  IdentificationToolsComponent?: ComponentType<{
    onResults?: (results: unknown[]) => void;
    onAction?: () => void;
  }>;
  
  /** Detail component */
  DetailComponent: ElementType;
  
  /** Key name for the detail component prop (e.g., 'bacterium', 'fungus') */
  detailItemKey: string;
  
  /** Custom header actions (optional - e.g., "New Ticket" button for support) */
  headerActions?: ComponentType;

  /** Hook returning extra items for the mobile dropdown menu */
  useMobileMenuItems?: () => import('@/components/modules/layout/module-header').MobileMenuItem[];
  
  /** Form panel component (optional - slide-in form for creating items) */
  FormComponent?: ElementType;

  /** Show the built-in Compare button (default: true) */
  showCompare?: boolean;

  /** Show the built-in Export button (default: true) */
  showExport?: boolean;
}

/**
 * Creates a module page component with standardized behavior.
 * This factory eliminates code duplication by generating consistent page implementations.
 * 
 * @template T - Entity type (e.g., Bacterium, Fungus) - must have id and optional confidenceScore
 * @template P - Search parameters type
 * 
 * @param config - Module page configuration
 * @returns React component for the module page
 * 
 * @example
 * // bacteriology/page.tsx
 * export const BacteriologyPage = createModulePage({
 *   translations: (t) => ({
 *     title: t('bacteriology.title'),
 *     searchPlaceholder: t('common.searchPlaceholder'),
 *     loading: t('common.loading'),
 *     error: t('modules.loadError'),
 *     errorDesc: t('modules.loadErrorDesc'),
 *     emptyTitle: t('modules.emptyTitle'),
 *     emptyDatabase: t('modules.emptyDatabase'),
 *     searchNoResults: (query) => t('modules.searchNoResults', { query }),
 *     filterNoMatch: t('modules.filterNoMatch'),
 *   }),
 *   accentColor: BACTERIOLOGY_ACCENT,
 *   iconName: 'bug',
 *   useData: useBacteria,
 *   useSearch: useBacteriaSearch,
 *   filters: bacteriaFilters,
 *   getColumns: getBacteriaColumns,
 *   computeStats: computeBacteriaStats,
 *   IdentificationToolsComponent: IdentificationTools,
 *   DetailComponent: BacteriumDetail,
 *   detailItemKey: 'bacterium',
 * });
 */
export function createModulePage<T extends { id: number; confidenceScore?: number }, P>(
  config: ModulePageConfig<T, P>
) {
  return function ModulePage() {
    const { t } = useTranslation();
    const addRecent = useWorkspaceStore((state) => state.addRecent);
    const addTab = useTabsStore((state) => state.addTab);
    
    // Resolve filters if it's a function
    const filters = typeof config.filters === 'function' ? config.filters(t) : config.filters;
    const translations = config.translations(t);

    // Resolve mobile menu items via hook - ALWAYS call hook to maintain consistent hook order
    // Use the no-op hook when useMobileMenuItems is not provided
    const useMobileMenuItemsHook = config.useMobileMenuItems ?? useNoMobileMenuItems;
    const mobileMenuItems = useMobileMenuItemsHook();

    // Track module visit in recents and tabs
    useEffect(() => {
      const path = window.location.pathname;
      
      // Add to recent modules
      addRecent({
        path,
        title: translations.title,
        icon: config.iconName,
      });
      
      // Add to tabs
      addTab({
        path,
        title: translations.title,
        icon: config.iconName,
      });
    }, [addRecent, addTab, translations.title]);

    return (
      <ModulePageTemplate<T>
        title={translations.title}
        accentColor={config.accentColor}
        icon={getModuleIcon(config.iconName)}
        searchPlaceholder={translations.searchPlaceholder}
        useData={config.useData}
        useSearch={config.useSearch}
        defaultSort={config.defaultSort}
        filters={filters}
        getColumns={(data) => config.getColumns(data, t)}
        computeStats={config.computeStats}
        getExportColumns={config.getExportColumns}
        getCardConfig={config.getCardConfig}
        IdentificationToolsComponent={config.IdentificationToolsComponent as React.ComponentType<{ onResults: (results: unknown[]) => void; onAction?: () => void }> | undefined}
        DetailComponent={config.DetailComponent}
        detailItemKey={config.detailItemKey}
        translations={translations}
        headerActions={config.headerActions ? <config.headerActions /> : undefined}
        mobileMenuItems={mobileMenuItems}
        FormComponent={config.FormComponent}
        showCompare={config.showCompare}
        showExport={config.showExport}
      />
    );
  };
}
