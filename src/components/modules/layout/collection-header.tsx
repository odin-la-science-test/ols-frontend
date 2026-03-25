'use client';

import { useTranslation } from 'react-i18next';
import { Filter, GitCompareArrows, Search as SearchIcon, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';
import {
  SearchInput,
  FilterPanel,
} from '@/components/modules/shared';
import type { UseSelectionReturn } from '@/hooks/use-selection';
import type { ActiveFilter, FilterConfig } from '@/components/modules/types';
import type { ModuleShellReturn } from '@/hooks/use-module-shell';
import { ModuleSidebar, SidebarSection } from './module-sidebar';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION HEADER — Sidebar, filters, search, and identification tools
// ═══════════════════════════════════════════════════════════════════════════

interface IdentificationBannerProps {
  identificationResults: unknown[] | null;
  onClear: () => void;
}

export function IdentificationBanner({ identificationResults, onClear }: IdentificationBannerProps) {
  const { t } = useTranslation();

  if (identificationResults === null) return null;

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 border backdrop-blur-sm transition-all ${
      identificationResults.length === 0
        ? 'border-muted-foreground/20 bg-muted/50 text-muted-foreground'
        : 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400'
    }`}>
      <span className="text-sm font-medium">
        {identificationResults.length === 0
          ? t('modules.noMatchFound')
          : t('modules.identificationResults', { count: identificationResults.length })}
      </span>
      <Button size="sm" variant="ghost" onClick={onClear} className="h-7 px-2 text-xs hover:bg-background/50">
        <X className="h-3 w-3 mr-1" />
        {t('modules.showAll')}
      </Button>
    </div>
  );
}

interface ActiveFiltersBannerProps {
  activeFilters: ActiveFilter[];
  onClear: () => void;
}

export function ActiveFiltersBanner({ activeFilters, onClear }: ActiveFiltersBannerProps) {
  const { t } = useTranslation();

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-3 text-blue-900 dark:text-blue-300 backdrop-blur-sm transition-all">
      <span className="text-sm font-medium">
        {t('modules.filtersActive', { count: activeFilters.length })}
      </span>
      <Button size="sm" variant="ghost" onClick={onClear} className="h-7 px-2 text-xs text-blue-700 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-500/20">
        <X className="h-3 w-3 mr-1" />
        {t('modules.clearFilters')}
      </Button>
    </div>
  );
}

interface SelectionModeBarProps {
  selection: Pick<UseSelectionReturn<{ id: string | number }>, 'isSelectionMode' | 'selectionCount' | 'clearSelection'>;
  onOpenComparison: () => void;
}

export function SelectionModeBar({ selection, onOpenComparison }: SelectionModeBarProps) {
  const { t } = useTranslation();

  if (!selection.isSelectionMode) return null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 sm:px-4 py-3 backdrop-blur-sm transition-all">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <GitCompareArrows className="h-4 w-4 text-primary shrink-0" />
        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground">
            {selection.selectionCount === 0
              ? t('modules.comparison.selectItems')
              : t('modules.comparison.selected', { count: selection.selectionCount })}
          </span>
          {selection.selectionCount > 0 && selection.selectionCount < 2 && (
            <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
              ({t('modules.comparison.selectMin')})
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {selection.selectionCount > 0 && (
          <Button size="sm" variant="ghost" onClick={selection.clearSelection} className="h-8 px-2 sm:px-3 text-xs">
            <X className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">{t('modules.comparison.deselectAll')}</span>
          </Button>
        )}
        <Button
          size="sm"
          variant="default"
          onClick={onOpenComparison}
          disabled={selection.selectionCount < 2}
          className="h-8 px-4 flex-1 sm:flex-none"
        >
          <GitCompareArrows className="h-4 w-4 mr-2" />
          {t('modules.comparison.viewComparison', { count: selection.selectionCount })}
        </Button>
      </div>
    </div>
  );
}

interface FilterSidebarContentProps {
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  hasFilters: boolean;
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  onCloseSidebarIfMobile: () => void;
  IdentificationToolsComponent?: React.ComponentType<{
    onResults?: (results: unknown[]) => void;
    onAction?: () => void;
  }>;
  onIdentificationResults: (results: unknown[]) => void;
}

function FilterSidebarContent({
  showSearch,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  hasFilters,
  filters,
  activeFilters,
  onFiltersChange,
  onCloseSidebarIfMobile,
  IdentificationToolsComponent,
  onIdentificationResults,
}: FilterSidebarContentProps) {
  const { t } = useTranslation();

  return (
    <>
      {showSearch && (
        <div className="pb-2">
          <SearchInput value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
        </div>
      )}
      {hasFilters && (
        <SidebarSection title={t('common.filters')} icon={Filter} defaultOpen={true}>
          <FilterPanel filters={filters} activeFilters={activeFilters} onChange={onFiltersChange} />
          <div className="pt-3 lg:hidden">
            <Button size="sm" className="w-full" disabled={activeFilters.length === 0} onClick={onCloseSidebarIfMobile}>
              <SearchIcon className="h-4 w-4 mr-2" />
              {t('common.search')}
            </Button>
          </div>
        </SidebarSection>
      )}
      {IdentificationToolsComponent && (
        <IdentificationToolsComponent onResults={onIdentificationResults} onAction={onCloseSidebarIfMobile} />
      )}
    </>
  );
}

export interface CollectionSidebarProps {
  hasSidebarSections: boolean;
  hasSearch: boolean;
  searchInSidebar: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  hasFilters: boolean;
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  shell: ModuleShellReturn;
  IdentificationToolsComponent?: React.ComponentType<{
    onResults?: (results: unknown[]) => void;
    onAction?: () => void;
  }>;
  onIdentificationResults: (results: unknown[]) => void;
}

export function CollectionSidebar({
  hasSidebarSections,
  hasSearch,
  searchInSidebar,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  hasFilters,
  filters,
  activeFilters,
  onFiltersChange,
  shell,
  IdentificationToolsComponent,
  onIdentificationResults,
}: CollectionSidebarProps) {
  const filterContentProps: FilterSidebarContentProps = {
    showSearch: false,
    searchQuery,
    onSearchChange,
    searchPlaceholder,
    hasFilters,
    filters,
    activeFilters,
    onFiltersChange,
    onCloseSidebarIfMobile: shell.closeSidebarIfMobile,
    IdentificationToolsComponent,
    onIdentificationResults,
  };

  return (
    <>
      {/* Mobile Sidebar (mobile always needs sidebar for search since toolbar is desktop-only) */}
      {(hasSidebarSections || hasSearch) && (
        <div className="lg:hidden">
          <ModuleSidebar>
            <FilterSidebarContent {...filterContentProps} showSearch={hasSearch} />
          </ModuleSidebar>
        </div>
      )}

      {/* Desktop: portal filter content into GlobalSidebar (only when sidebar has sections) */}
      {shell.isDesktop && shell.filterPortalTarget && hasSidebarSections &&
        createPortal(
          <FilterSidebarContent {...filterContentProps} showSearch={searchInSidebar} />,
          shell.filterPortalTarget,
        )}
    </>
  );
}
