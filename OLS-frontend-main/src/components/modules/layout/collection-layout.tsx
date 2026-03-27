'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { exportToCSV, cn } from '@/lib/utils';
import { createViewModeAction, createCompareAction, createSelectAction, createExportAction, createNewItemAction } from '@/lib/module-action-builders';
import { logger } from '@/lib/logger';
import { getModuleIcon } from '@/lib/module-icons';
import { useViewStore } from '@/stores';
import { useFavoritesStore } from '@/stores/favorites-store';
import { useSelection, toast, useDensity, useModuleShell, usePagination, useModuleEvent, useRetryFeedback } from '@/hooks';
import { useStatusBarItems } from '@/hooks/use-status-bar-items';
import type { StatusBarItem } from '@/stores/status-bar-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import type { SidebarSectionMeta } from '@/stores/module-filters-store';
import { ModuleLayout } from './module-layout';
import { ModuleHeader } from './module-header';
import { ModuleContent } from './module-content';
import {
  DataTable,
  DataCardGrid,
  Pagination,
  StatsBar,
  EmptyState,
  LoadingState,
  createComparisonConfigFromCard,
} from '@/components/modules/shared';
import type { ActiveFilter, SortConfig } from '@/components/modules/types';
import {
  IdentificationBanner,
  ActiveFiltersBanner,
  SelectionModeBar,
  CollectionSidebar,
} from './collection-header';
import {
  DesktopDetailPortal,
  CollectionComparisonPanel,
  MobileOverlays,
} from './collection-content';
import { MAX_COMPARISON_ITEMS } from './collection-layout-types';
import type { CollectionLayoutProps, FormMode } from './collection-layout-types';

// Re-export types for consumers
export type { CollectionTranslations, CollectionLayoutProps } from './collection-layout-types';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION LAYOUT — Unified layout for all collection/CRUD modules
// ═══════════════════════════════════════════════════════════════════════════

export function CollectionLayout<T extends { id: number; confidenceScore?: number }>({
  moduleKey: moduleKeyProp,
  title,
  icon: iconName,
  backTo = '/',
  useData,
  useSearch,
  columns: getColumns,
  cardConfig: getCardConfig,
  filters: filtersProp,
  computeStats,
  defaultSort,
  search: hasSearch = true,
  onItemClick,
  renderDetail,
  renderEditor,
  hasEdit = !!renderEditor,
  comparison,
  showCompare = true,
  exportConfig,
  showExport = true,
  IdentificationToolsComponent,
  onBatchDelete,
  newItemConfig,
  entityActions,
  useMobileMenuItems,
  translations,
}: CollectionLayoutProps<T>) {
  const { t } = useTranslation();
  const d = useDensity();
  const Icon = getModuleIcon(iconName);
  const hasFilters = !!filtersProp;

  const sidebarSections = useMemo(() => {
    const s: SidebarSectionMeta[] = [];
    if (hasFilters) s.push({ id: 'filters', labelKey: 'common.filters' });
    if (IdentificationToolsComponent) s.push({ id: 'identification', labelKey: 'modules.identification' });
    return s;
  }, [hasFilters, IdentificationToolsComponent]);

  const hasSidebarSections = sidebarSections.length > 0;
  const searchInToolbar = hasSearch && !hasSidebarSections;
  const searchInSidebar = hasSearch && hasSidebarSections;

  const shell = useModuleShell({ moduleKey: moduleKeyProp, title, iconName, hasDetail: true, sidebarSections });
  const setToolbarSearch = useModuleFiltersStore((s) => s.setToolbarSearch);
  const viewMode = useViewStore((s) => s.viewMode);
  const toggleViewMode = useViewStore((s) => s.toggleViewMode);

  const [searchQuery, setSearchQuery] = useState((shell.savedState?.searchQuery as string) ?? '');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>((shell.savedState?.activeFilters as ActiveFilter[]) ?? []);
  const [sort, setSort] = useState<SortConfig>((shell.savedState?.sort as SortConfig) ?? defaultSort ?? { key: '', direction: 'asc' });
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [identificationResults, setIdentificationResults] = useState<T[] | null>(null);
  const [comparisonPanelOpen, setComparisonPanelOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>((shell.savedState?.formMode as FormMode) ?? null);

  useEffect(() => {
    if (searchInToolbar) {
      setToolbarSearch({ query: searchQuery, setQuery: setSearchQuery, placeholder: translations.searchPlaceholder });
    }
    return () => { if (searchInToolbar) setToolbarSearch(null); };
  }, [searchInToolbar, searchQuery, translations.searchPlaceholder, setToolbarSearch]);

  const { data: allItems, isLoading, isError, refetch } = useData();
  const refetchAsync = useCallback(async () => { await refetch?.(); }, [refetch]);
  const { execute: retryWithFeedback, isRetrying } = useRetryFeedback(refetchAsync);
  useEffect(() => {
    shell.restoreItem(allItems, setSelectedItem, () => shell.setDetailOpen(false));
  }, [allItems, shell.restoreItem]);

  const defaultSearchHook = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    () => (_q: string) => ({ data: undefined as T[] | undefined, isLoading: false }),
    []
  );
  const { data: searchResults, isLoading: isSearching } = (useSearch ?? defaultSearchHook)(searchQuery);

  const items = identificationResults ?? (searchQuery.length >= 2 ? searchResults : allItems);
  const filters = useMemo(() => (typeof filtersProp === 'function' ? filtersProp(t) : filtersProp) ?? [], [filtersProp, t]);
  const allFavorites = useFavoritesStore((s) => s.favorites);
  const favoriteEntityIds = useMemo(
    () => new Set(allFavorites.filter((f) => f.moduleId === moduleKeyProp).map((f) => f.entityId)),
    [allFavorites, moduleKeyProp],
  );
  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) =>
      activeFilters.every((af) => {
        if (af.value === undefined) return true;
        const filterConfig = filters.find((f) => f.key === af.key);
        if (filterConfig?.type === 'favorite') {
          return af.value === true ? favoriteEntityIds.has(item.id) : true;
        }
        const value = item[af.key as keyof T];
        if (typeof af.value === 'boolean') return value === af.value;
        return value === af.value;
      })
    );
  }, [items, activeFilters, filters, favoriteEntityIds]);

  const sortedItems = useMemo(() => {
    if (!filteredItems.length) return [];
    if (!sort.key) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      const aVal = a[sort.key as keyof T];
      const bVal = b[sort.key as keyof T];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = aVal < bVal ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sort]);
  const pagination = usePagination({ items: sortedItems, initialPage: (shell.savedState?.currentPage as number) ?? 1, resetDeps: [searchQuery, activeFilters, sort] });
  shell.persistRef.current = { searchQuery, activeFilters, sort, selectedItemId: selectedItem?.id ?? undefined, formMode, currentPage: pagination.currentPage };

  const stats = useMemo(() => computeStats?.(filteredItems, t) ?? [], [filteredItems, computeStats, t]);
  const columns = useMemo(() => getColumns(sortedItems, t), [sortedItems, getColumns, t]);
  const cardConfig = useMemo(() => getCardConfig?.(t), [getCardConfig, t]);
  const hasCardView = !!cardConfig;
  const selection = useSelection<T>(items || [], {
    maxSelection: MAX_COMPARISON_ITEMS,
    onMaxReached: () => {
      toast({ variant: 'warning', title: t('modules.comparison.maxReached', { max: MAX_COMPARISON_ITEMS }) });
    },
  });
  const handleBatchDelete = useMemo(() => {
    if (!onBatchDelete) return undefined;
    return (ids: Set<string | number>) => {
      onBatchDelete(ids);
      selection.exitSelectionMode();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBatchDelete, selection.exitSelectionMode]);
  const statusPrefix = moduleKeyProp;
  const statusBarItems: StatusBarItem[] = useMemo(() => {
    const sbi: StatusBarItem[] = [];
    const totalCount = allItems?.length ?? 0;
    const filteredCount = filteredItems.length;
    const selectedCount = selection.selectionCount;
    const gid = shell.editorGroupId;
    if (totalCount > 0) sbi.push({ id: `${statusPrefix}:count`, position: 'left', text: t('statusBar.items', { count: totalCount }), icon: 'database', priority: 10, groupId: gid });
    if (totalCount > 0 && filteredCount !== totalCount) sbi.push({ id: `${statusPrefix}:filtered`, position: 'left', text: t('statusBar.filtered', { count: filteredCount }), icon: 'filter', priority: 20, groupId: gid });
    if (selectedCount > 0) sbi.push({ id: `${statusPrefix}:selected`, position: 'left', text: t('statusBar.selected', { count: selectedCount }), icon: 'check-square', priority: 30, groupId: gid });
    if (pagination.shouldShowPagination) sbi.push({ id: `${statusPrefix}:page`, position: 'left', text: `${t('common.page')} ${pagination.currentPage}/${pagination.totalPages}`, icon: 'file-text', priority: 25, groupId: gid });
    if (hasCardView) sbi.push({ id: `${statusPrefix}:view`, position: 'right', text: t('statusBar.view', { mode: viewMode === 'table' ? t('common.viewTable') : t('common.viewCards') }), priority: 10, groupId: gid });
    if (sort.key) sbi.push({ id: `${statusPrefix}:sort`, position: 'right', text: t('statusBar.sort', { field: sort.key }) + (sort.direction === 'asc' ? ' ↑' : ' ↓'), priority: 20, groupId: gid });
    return sbi;
  }, [statusPrefix, shell.editorGroupId, allItems?.length, filteredItems.length, selection.selectionCount, viewMode, hasCardView, sort, pagination.shouldShowPagination, pagination.currentPage, pagination.totalPages, t]);

  useStatusBarItems(statusPrefix, statusBarItems);
  const comparisonConfig = useMemo(() => {
    if (!cardConfig) return null;
    const additionalFields = comparison?.fields(t);
    return createComparisonConfigFromCard(cardConfig, additionalFields);
  }, [cardConfig, comparison, t]);
  const handleExport = useCallback(() => {
    if (!sortedItems?.length) { logger.warn('No data to export'); return; }
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${moduleKeyProp}_${timestamp}`;
    const exportCols = exportConfig?.getColumns(sortedItems, t);
    exportToCSV(sortedItems, filename, exportCols);
  }, [sortedItems, moduleKeyProp, exportConfig, t]);
  const handleSelect = (item: T) => { if (selection.isSelectionMode) return; if (onItemClick) { onItemClick(item); return; } setFormMode(null); setSelectedItem(item); shell.setDetailOpen(true); };
  const handleCloseDetail = () => { shell.setDetailOpen(false); setTimeout(() => { setSelectedItem(null); setFormMode(null); }, 200); };
  const handleEdit = useCallback(() => { if (selectedItem && hasEdit && renderEditor) setFormMode('edit'); }, [selectedItem, hasEdit, renderEditor]);
  const handleOpenCreate = useCallback(() => { setFormMode('create'); setSelectedItem(null); shell.setDetailOpen(true); }, [shell]);
  const handleCancelForm = useCallback(() => { setFormMode(null); if (!selectedItem) shell.setDetailOpen(false); }, [selectedItem, shell]);
  const handleCreated = useCallback((item: T) => { setFormMode(null); setSelectedItem(item); }, []);
  const handleUpdated = useCallback((item: T) => { setFormMode(null); setSelectedItem(item); }, []);

  const handleIdentificationResults = (results: unknown[]) => {
    const safeResults = Array.isArray(results) ? (results as T[]) : [];
    setIdentificationResults(safeResults);
    setSearchQuery(''); setActiveFilters([]); setSelectedItem(null);
    shell.setDetailOpen(false); selection.exitSelectionMode();
    if (safeResults.length > 0 && safeResults[0].confidenceScore !== undefined) setSort({ key: 'confidenceScore', direction: 'desc' });
  };

  const handleClearIdentification = () => { setIdentificationResults(null); if (defaultSort) setSort(defaultSort); };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mobileMenuItems = useMobileMenuItems ? useMobileMenuItems() : undefined;
  useEffect(() => {
    const actions: import('@/lib/module-registry/types').ModuleAction[] = [];
    if (newItemConfig && renderEditor) actions.push(createNewItemAction({ labelKey: newItemConfig.labelKey, onNew: handleOpenCreate }));
    if (hasCardView) actions.push(createViewModeAction({ viewMode, onToggle: toggleViewMode }));
    if (showCompare && !!cardConfig) actions.push(createCompareAction({ isActive: selection.isSelectionMode, onToggle: selection.toggleSelectionMode }));
    if (!showCompare && !!onBatchDelete) actions.push(createSelectAction({ isActive: selection.isSelectionMode, onToggle: selection.toggleSelectionMode }));
    if (showExport) actions.push(createExportAction({ onExport: handleExport, canExport: sortedItems.length > 0 }));
    shell.registerToolbar({ moduleKey: moduleKeyProp, actions });
  }, [moduleKeyProp, newItemConfig, renderEditor, hasCardView, viewMode, showCompare, cardConfig, showExport, onBatchDelete, selection.isSelectionMode, sortedItems.length, toggleViewMode, selection.toggleSelectionMode, handleExport, handleOpenCreate, shell.registerToolbar]);
  // Listen for comparison toggle from the command palette
  useModuleEvent('platform:toggleComparison', useCallback(() => {
    if (showCompare && !!cardConfig) {
      selection.toggleSelectionMode();
    }
  }, [showCompare, cardConfig, selection.toggleSelectionMode]));

  const prevDetailOpen = useRef(shell.detailOpen);
  useEffect(() => {
    const was = prevDetailOpen.current;
    prevDetailOpen.current = shell.detailOpen;
    if (was && !shell.detailOpen) setTimeout(() => { setSelectedItem(null); setFormMode(null); }, 200);
  }, [shell.detailOpen]);
  const showForm = !!formMode && !!renderEditor;
  const showDetail = !!selectedItem && !formMode;

  return (
    <ModuleLayout>
      <ModuleHeader title={title} icon={Icon} backTo={backTo} mobileMenuItems={mobileMenuItems} showFilters={hasSidebarSections || hasSearch} />

      <div className="relative flex flex-1 overflow-hidden">
        <CollectionSidebar
          hasSidebarSections={hasSidebarSections}
          hasSearch={hasSearch}
          searchInSidebar={searchInSidebar}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={translations.searchPlaceholder}
          hasFilters={hasFilters}
          filters={filters}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
          shell={shell}
          IdentificationToolsComponent={IdentificationToolsComponent}
          onIdentificationResults={handleIdentificationResults}
        />

        {/* Main Content */}
        <ModuleContent data-tour="module-content">
          <div className={cn('flex-1 overflow-y-auto', d.contentPadding, d.contentGap)}>
            <IdentificationBanner identificationResults={identificationResults} onClear={handleClearIdentification} />
            <ActiveFiltersBanner activeFilters={activeFilters} onClear={() => setActiveFilters([])} />
            <SelectionModeBar selection={selection} onOpenComparison={() => { if (selection.selectionCount >= 2) setComparisonPanelOpen(true); }} onBatchDelete={handleBatchDelete} />

            {/* Stats bar */}
            {!isLoading && items && items.length > 0 && stats.length > 0 && <StatsBar stats={stats} />}

            {/* Data display */}
            {isLoading || isSearching ? (
              <LoadingState message={translations.loading} customColor={shell.accentColor} />
            ) : isError ? (
              <EmptyState title={translations.error} description={translations.errorDesc} action={refetch && <Button onClick={() => retryWithFeedback()} variant="outline" disabled={isRetrying}>{t('common.retry')}</Button>} />
            ) : sortedItems.length === 0 ? (
              <EmptyState
                icon={searchQuery ? SearchIcon : Icon}
                title={searchQuery ? t('common.noResults') : translations.emptyTitle}
                description={searchQuery ? translations.searchNoResults(searchQuery) : activeFilters.length > 0 ? translations.filterNoMatch : translations.emptyDatabase}
              />
            ) : viewMode === 'cards' && cardConfig ? (
              <DataCardGrid data={pagination.paginatedItems} config={cardConfig} selectedId={selectedItem?.id} onSelect={handleSelect} isSelectionMode={selection.isSelectionMode} selectedIds={selection.selectedIds} onToggleSelection={selection.toggleSelection} isMaxSelectionReached={selection.isMaxReached} />
            ) : (
              <DataTable data={pagination.paginatedItems} columns={columns} sort={sort} onSort={setSort} selectedId={selectedItem?.id} onSelect={handleSelect} isSelectionMode={selection.isSelectionMode} selectedIds={selection.selectedIds} onToggleSelection={selection.toggleSelection} isMaxSelectionReached={selection.isMaxReached} />
            )}

            {/* Pagination */}
            {pagination.shouldShowPagination && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={sortedItems.length} pageSize={pagination.pageSize} onPageChange={pagination.setCurrentPage} />
            )}
          </div>
        </ModuleContent>

        <CollectionComparisonPanel comparisonConfig={comparisonConfig} comparisonPanelOpen={comparisonPanelOpen} onClose={() => setComparisonPanelOpen(false)} selection={selection} />

        <DesktopDetailPortal
          shell={shell} showForm={showForm} showDetail={showDetail} formMode={formMode}
          selectedItem={selectedItem} newItemConfig={newItemConfig} moduleKeyProp={moduleKeyProp}
          hasEdit={hasEdit} renderDetail={renderDetail} renderEditor={renderEditor}
          onCloseDetail={handleCloseDetail} onEdit={handleEdit} onCreated={handleCreated}
          onUpdated={handleUpdated} onCancelForm={handleCancelForm}
          entityActions={entityActions}
        />

        <MobileOverlays
          shell={shell} showForm={showForm} showDetail={showDetail} formMode={formMode}
          selectedItem={selectedItem} newItemConfig={newItemConfig} moduleKeyProp={moduleKeyProp}
          hasEdit={hasEdit} renderDetail={renderDetail} renderEditor={renderEditor}
          onCloseDetail={handleCloseDetail} onEdit={handleEdit} onCreated={handleCreated}
          onUpdated={handleUpdated} onCancelForm={handleCancelForm}
          entityActions={entityActions}
        />
      </div>
    </ModuleLayout>
  );
}
