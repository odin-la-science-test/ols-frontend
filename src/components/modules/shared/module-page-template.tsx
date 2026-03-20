'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Download, Filter, Search as SearchIcon, X, GitCompareArrows, type LucideIcon } from 'lucide-react';
import { Button, IconButtonWithTooltip } from '@/components/ui';
import { exportToCSV, cn } from '@/lib/utils';
import { useViewStore } from '@/stores';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useEditorGroupId } from '@/components/common/editor-group-context';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useSelection, toast, useDensity } from '@/hooks';
import { useStatusBarItems } from '@/hooks/use-status-bar-items';
import type { StatusBarItem } from '@/stores/status-bar-store';
import {
  ModuleLayout,
  useModuleLayout,
} from '@/components/modules/layout/module-layout';
import { ModuleHeader } from '@/components/modules/layout/module-header';
import { ModuleSidebar, SidebarSection } from '@/components/modules/layout/module-sidebar';
import { ModuleContent } from '@/components/modules/layout/module-content';
import {
  SearchInput,
  FilterPanel,
  DataTable,
  DataCardGrid,
  StatsBar,
  EmptyState,
  LoadingState,
  ComparisonPanel,
  createComparisonConfigFromCard,
} from '@/components/modules/shared';
import type { ActiveFilter, SortConfig, ColumnDef, StatItem, FilterConfig, CardConfig } from '@/components/modules/types';
import type { ComparisonField } from './comparison-panel';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE PAGE TEMPLATE - Generic page template with comparison support
// ═══════════════════════════════════════════════════════════════════════════

// Maximum items for comparison
const MAX_COMPARISON_ITEMS = 5;

// Generic Interface
export interface ModulePageTemplateProps<T extends { id: number; confidenceScore?: number }> {
  // Config
  title: string;
  accentColor: string;
  icon: LucideIcon;
  searchPlaceholder: string;
  
  // Data Logic
  useData: () => { data?: T[]; isLoading: boolean; isError: boolean; refetch: () => void };
  useSearch?: (query: string) => { data?: T[]; isLoading: boolean };
  
  // Default sort configuration
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  
  // Columns & Filters
  filters: FilterConfig[];
  getColumns: (data: T[]) => ColumnDef<T>[];
  computeStats: (data: T[], t: TFunction) => StatItem[];
  
  // Card configuration (optional - enables card view)
  getCardConfig?: (t: TFunction) => CardConfig<T>;
  
  // Export configuration (optional)
  getExportColumns?: (data: T[], t: TFunction) => Array<{ key: keyof T; header: string }>;

  // Additional comparison fields (optional - merged with card config fields)
  getComparisonFields?: (t: TFunction) => ComparisonField<T>[];
  
  // Components
  IdentificationToolsComponent?: React.ComponentType<{ onResults: (results: unknown[]) => void; onAction?: () => void }>;
  DetailComponent: React.ElementType;
  detailItemKey: string; // e.g., 'bacterium' or 'fungus'
  
  // Custom header actions (optional - e.g., "New Ticket" button)
  headerActions?: React.ReactNode;
  
  // Extra items to show in the mobile dropdown menu
  mobileMenuItems?: import('@/components/modules/layout/module-header').MobileMenuItem[];
  
  // Form panel component (optional - slide-in form for creating items)
  FormComponent?: React.ElementType;

  // Show/hide built-in header buttons (default: true)
  showCompare?: boolean;
  showExport?: boolean;
  
  // Translation values (translated strings)
  translations: {
    loading: string;
    error: string;
    errorDesc: string;
    emptyTitle: string;
    emptyDatabase: string;
    searchNoResults: (query: string) => string;
    filterNoMatch: string;
  };
}

export function ModulePageTemplate<T extends { id: number; confidenceScore?: number }>(props: ModulePageTemplateProps<T>) {
  return (
    <ModuleLayout accentColor={props.accentColor}>
      <ModulePageContent {...props} />
    </ModuleLayout>
  );
}

function ModulePageContent<T extends { id: number; confidenceScore?: number }>({
  title,
  accentColor,
  icon: Icon,
  searchPlaceholder,
  useData,
  useSearch,
  defaultSort,
  filters,
  getColumns,
  computeStats,
  getCardConfig,
  getComparisonFields,
  IdentificationToolsComponent,
  DetailComponent,
  detailItemKey,
  translations,
  getExportColumns,
  headerActions,
  mobileMenuItems,
  FormComponent,
  showCompare = true,
  showExport = true,
}: ModulePageTemplateProps<T>) {
  const { t } = useTranslation();
  const { setSidebarOpen } = useModuleLayout();
  const d = useDensity();

  const [isDesktop, setIsDesktop] = React.useState(false);
  const editorGroupId = useEditorGroupId();
  const registerFilters = useModuleFiltersStore((s) => s.register);
  const unregisterFilters = useModuleFiltersStore((s) => s.unregister);
  const registerDetail = useModuleDetailStore((s) => s.register);
  const unregisterDetail = useModuleDetailStore((s) => s.unregister);
  const setDetailStoreOpen = useModuleDetailStore((s) => s.setOpen);
  const registerToolbar = useModuleToolbarStore((s) => s.register);
  const updateToolbar = useModuleToolbarStore((s) => s.update);
  const unregisterToolbar = useModuleToolbarStore((s) => s.unregister);
  const closeZone = usePanelRegistryStore((s) => s.closeZone);
  const setZoneStack = usePanelRegistryStore((s) => s.setZoneStack);
  
  // View mode from store (persisted)
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);
  
  // State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([]);
  const [sort, setSort] = React.useState<SortConfig>(defaultSort ?? { key: 'species', direction: 'asc' });
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [identificationResults, setIdentificationResults] = React.useState<T[] | null>(null);
  const [comparisonPanelOpen, setComparisonPanelOpen] = React.useState(false);

  // Data fetching
  const { data: allItems, isLoading, isError, refetch } = useData();
  // Default no-op search for modules without server-side search
  const defaultSearch = React.useMemo(
    () => (_q: string) => ({ data: undefined as T[] | undefined, isLoading: false }),
    []
  );
  const { data: searchResults, isLoading: isSearching } = (useSearch ?? defaultSearch)(searchQuery);

  // Prioritize identification results when present, otherwise use search or all data
  const items = identificationResults ?? (searchQuery.length >= 2 ? searchResults : allItems);

  // Selection hook for comparison - initialize with items
  const selection = useSelection<T>(items || [], {
    maxSelection: MAX_COMPARISON_ITEMS,
    onMaxReached: () => {
      toast({
        variant: 'warning',
        title: t('modules.comparison.maxReached', { max: MAX_COMPARISON_ITEMS }),
      });
    },
  });

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // ── Register module filters in global sidebar (desktop) ──
  // Derive a stable module key from the title
  const moduleKey = React.useMemo(() => title.toLowerCase().replace(/\s+/g, '-'), [title]);
  const portalTarget = useModuleFiltersStore((s) => s.portalTargets[editorGroupId] ?? null);

  // Register metadata so the filters panel icon appears in the activity bar
  React.useEffect(() => {
    registerFilters({ moduleKey, moduleTitle: title, accentColor, content: null }, editorGroupId);
    registerDetail({ moduleKey, moduleTitle: title, accentColor, isOpen: false }, editorGroupId);
    // Restore the filter panel state from the last visit to this module.
    // Open → reopen. Closed (or first visit) → keep closed.
    const wasOpen = useModuleFiltersStore.getState().filterPanelOpen[moduleKey] ?? false;
    if (wasOpen) {
      // Open tools panel in its current zone (user may have moved it)
      const toolsZone = usePanelRegistryStore.getState().getZoneForPanel('tools', 'primary');
      setZoneStack(toolsZone, ['tools']);
    } else {
      // If the tools panel is open from a previous module, close its zone
      const toolsZone = usePanelRegistryStore.getState().getZoneForPanel('tools', 'primary');
      const pZone = usePanelRegistryStore.getState().zones[toolsZone];
      const current = pZone.isOpen ? pZone.activeTab : null;
      if (current === 'tools') closeZone(toolsZone);
    }
    return () => {
      // Save whether the filters panel was open when leaving this module
      const toolsZone = usePanelRegistryStore.getState().getZoneForPanel('tools', 'primary');
      const pZone = usePanelRegistryStore.getState().zones[toolsZone];
      const current = pZone.isOpen ? pZone.activeTab : null;
      useModuleFiltersStore.getState().setFilterPanelOpen(moduleKey, current === 'tools');
      unregisterFilters(moduleKey, editorGroupId);
      unregisterDetail(moduleKey, editorGroupId);
      unregisterToolbar(moduleKey);
      // Close the tools panel so it doesn't stay open as empty on pages without filters
      if (current === 'tools') closeZone(toolsZone);
    };
  }, [moduleKey, title, accentColor, editorGroupId, registerFilters, unregisterFilters, registerDetail, unregisterDetail, unregisterToolbar, setZoneStack, closeZone]);

  // Sync detail open state with the module-detail-store (drives SecondarySidebar)
  React.useEffect(() => {
    setDetailStoreOpen(moduleKey, detailOpen, editorGroupId);
  }, [detailOpen, moduleKey, editorGroupId, setDetailStoreOpen]);

  // React to external close (zone X button sets store isOpen=false directly).
  // We use a ref to track the PREVIOUS storeIsOpen so we only react when
  // the store transitions from true→false, not when it starts at false on mount.
  const storeIsOpen = useModuleDetailStore((s) => s.registrations[editorGroupId]?.isOpen ?? false);
  const prevStoreIsOpenRef = React.useRef(storeIsOpen);
  React.useEffect(() => {
    const wasOpen = prevStoreIsOpenRef.current;
    prevStoreIsOpenRef.current = storeIsOpen;
    // Only act when the store itself transitioned true → false AND local is still open
    if (wasOpen && !storeIsOpen && detailOpen) {
      setDetailOpen(false);
      setTimeout(() => setSelectedItem(null), 200);
    }
  }, [storeIsOpen, detailOpen]);

  const closeSidebarIfMobile = React.useCallback(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [isDesktop, setSidebarOpen]);

  // Apply filters
  const filteredItems = React.useMemo(() => {
    if (!items) return [];
    
    return items.filter((item) => {
      return activeFilters.every((filter) => {
        const value = item[filter.key as keyof T];
        if (filter.value === undefined) return true;
        if (typeof filter.value === 'boolean') return value === filter.value;
        return value === filter.value;
      });
    });
  }, [items, activeFilters]);

  // Apply sorting
  const sortedItems = React.useMemo(() => {
    if (!filteredItems.length) return [];
    
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

  // Stats
  const stats = React.useMemo(() => {
    return computeStats(filteredItems, t);
  }, [filteredItems, computeStats, t]);

  // Dynamic columns based on whether we have confidence scores
  const columns = React.useMemo(() => {
    return getColumns(sortedItems);
  }, [sortedItems, getColumns]);

  // Card configuration (memoized)
  const cardConfig = React.useMemo(() => {
    return getCardConfig?.(t);
  }, [getCardConfig, t]);

  // Check if card view is available
  const hasCardView = !!cardConfig;

  // ─── Status Bar items ───
  // Build a stable prefix from the title (e.g. "Bacteriology" → "bacteriology")
  const statusPrefix = React.useMemo(
    () => title.toLowerCase().replace(/\s+/g, '-'),
    [title]
  );

  const statusBarItems: StatusBarItem[] = React.useMemo(() => {
    const items: StatusBarItem[] = [];
    const totalCount = allItems?.length ?? 0;
    const filteredCount = filteredItems.length;
    const selectedCount = selection.selectionCount;
    const gid = editorGroupId;

    // Total count
    if (totalCount > 0) {
      items.push({
        id: `${statusPrefix}:count`,
        position: 'left',
        text: t('statusBar.items', { count: totalCount }),
        icon: 'database',
        priority: 10,
        groupId: gid,
      });
    }

    // Filtered count (only if different from total)
    if (totalCount > 0 && filteredCount !== totalCount) {
      items.push({
        id: `${statusPrefix}:filtered`,
        position: 'left',
        text: t('statusBar.filtered', { count: filteredCount }),
        icon: 'filter',
        priority: 20,
        groupId: gid,
      });
    }

    // Selection count (comparison mode)
    if (selectedCount > 0) {
      items.push({
        id: `${statusPrefix}:selected`,
        position: 'left',
        text: t('statusBar.selected', { count: selectedCount }),
        icon: 'check-square',
        priority: 30,
        groupId: gid,
      });
    }

    // View mode
    if (hasCardView) {
      items.push({
        id: `${statusPrefix}:view`,
        position: 'right',
        text: t('statusBar.view', { mode: viewMode === 'table' ? t('common.viewTable') : t('common.viewCards') }),
        priority: 10,
        groupId: gid,
      });
    }

    // Sort info
    if (sort.key) {
      items.push({
        id: `${statusPrefix}:sort`,
        position: 'right',
        text: t('statusBar.sort', { field: sort.key }) + (sort.direction === 'asc' ? ' ↑' : ' ↓'),
        priority: 20,
        groupId: gid,
      });
    }

    return items;
  }, [statusPrefix, editorGroupId, allItems?.length, filteredItems.length, selection.selectionCount, viewMode, hasCardView, sort, t]);

  useStatusBarItems(statusPrefix, statusBarItems);

  // Comparison configuration (derived from card config + additional fields)
  const comparisonConfig = React.useMemo(() => {
    if (!cardConfig) return null;
    
    const additionalFields = getComparisonFields?.(t);
    return createComparisonConfigFromCard(cardConfig, additionalFields);
  }, [cardConfig, getComparisonFields, t]);

  // Handlers
  const handleSelect = (item: T) => {
    // Don't open detail if in selection mode
    if (selection.isSelectionMode) return;
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    // Delay clearing selection for animation
    setTimeout(() => setSelectedItem(null), 200);
  };

  const handleIdentificationResults = (results: unknown[]) => {
    const safeResults = Array.isArray(results) ? (results as T[]) : [];
    setIdentificationResults(safeResults);
    setSearchQuery('');
    setActiveFilters([]);
    setSelectedItem(null);
    setDetailOpen(false);
    // Exit selection mode when new results arrive
    selection.exitSelectionMode();
    // Auto-sort by confidence score when identification results arrive
    if (safeResults.length > 0 && safeResults[0].confidenceScore !== undefined) {
      setSort({ key: 'confidenceScore', direction: 'desc' });
    }
  };

  const handleClearIdentification = () => {
    setIdentificationResults(null);
    // Reset sort to default when clearing identification
    setSort({ key: 'species', direction: 'asc' });
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
  };

  const handleExport = React.useCallback(() => {
    if (!sortedItems || sortedItems.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Generate filename with timestamp (use title as base)
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${title.replace(/\s+/g, '_').toLowerCase()}_${timestamp}`;

    // Use custom export columns if provided, otherwise use default columns from getExportColumns
    const exportCols = getExportColumns ? getExportColumns(sortedItems, t) : undefined;

    exportToCSV(sortedItems, filename, exportCols);
  }, [sortedItems, title, getExportColumns, t]);

  // ── Register toolbar capabilities for shell components (Breadcrumbs, Menu Bar) ──
  const toggleViewMode = useViewStore((s) => s.toggleViewMode);
  React.useEffect(() => {
    registerToolbar({
      moduleKey,
      hasCardView,
      hasCompare: showCompare && !!cardConfig,
      hasExport: showExport,
      isCompareMode: selection.isSelectionMode,
      canExport: sortedItems.length > 0,
      onToggleViewMode: toggleViewMode,
      onToggleCompareMode: selection.toggleSelectionMode,
      onExport: handleExport,
    });
  }, [moduleKey, hasCardView, showCompare, cardConfig, showExport, selection.isSelectionMode, sortedItems.length, toggleViewMode, selection.toggleSelectionMode, handleExport, registerToolbar]);

  // Comparison handlers
  const handleOpenComparison = () => {
    if (selection.selectionCount >= 2) {
      setComparisonPanelOpen(true);
    }
  };

  const handleCloseComparison = () => {
    setComparisonPanelOpen(false);
  };

  const handleRemoveFromComparison = (id: string | number) => {
    selection.deselect(id);
    // Close panel if less than 2 items
    if (selection.selectionCount <= 2) {
      setComparisonPanelOpen(false);
    }
  };

  const detailProps = {
    [detailItemKey]: selectedItem,
    isOpen: detailOpen,
    onClose: handleCloseDetail
  };

  return (
    <>
      <ModuleHeader
          title={title}
          icon={Icon}
          backTo="/atlas"
          mobileMenuItems={mobileMenuItems}
          actions={headerActions}
        />

        <div className="relative flex flex-1 overflow-hidden">
          {/* Mobile Sidebar (SlidePanel) — only visible on small screens */}
          <div className="lg:hidden">
            <ModuleSidebar>
              {/* Search */}
              <div className="pb-2">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={searchPlaceholder}
                />
              </div>

              {/* Filters */}
              <SidebarSection title={t('common.filters')} icon={Filter} defaultOpen={true}>
                <FilterPanel
                  filters={filters}
                  activeFilters={activeFilters}
                  onChange={setActiveFilters}
                />
                <div className="pt-3">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={activeFilters.length === 0}
                    onClick={closeSidebarIfMobile}
                  >
                    <SearchIcon className="h-4 w-4 mr-2" />
                    {t('common.search')}
                  </Button>
                </div>
              </SidebarSection>

              {/* Identification Tools (optional) */}
              {IdentificationToolsComponent && (
                <IdentificationToolsComponent 
                  onResults={handleIdentificationResults}
                  onAction={closeSidebarIfMobile}
                />
              )}
            </ModuleSidebar>
          </div>

          {/* Desktop: portal filter content into GlobalSidebar's Filters panel */}
          {isDesktop && portalTarget && createPortal(
            <>
              {/* Search */}
              <div className="pb-2">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={searchPlaceholder}
                />
              </div>

              {/* Filters */}
              <SidebarSection title={t('common.filters')} icon={Filter} defaultOpen={true}>
                <FilterPanel
                  filters={filters}
                  activeFilters={activeFilters}
                  onChange={setActiveFilters}
                />
              </SidebarSection>

              {/* Identification Tools (optional) */}
              {IdentificationToolsComponent && (
                <IdentificationToolsComponent 
                  onResults={handleIdentificationResults}
                  onAction={closeSidebarIfMobile}
                />
              )}
            </>,
            portalTarget
          )}

          {/* Main Content */}
          <ModuleContent>
            <div className={cn('flex-1 overflow-y-auto', d.contentPadding, d.contentGap)}>
              {identificationResults !== null && (
                <div className={`
                  flex items-center justify-between gap-3 rounded-lg px-4 py-3
                  border backdrop-blur-sm transition-all
                  ${identificationResults.length === 0 
                    ? 'border-muted-foreground/20 bg-muted/50 text-muted-foreground' 
                    : 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400'}
                `}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {identificationResults.length === 0
                        ? t('modules.noMatchFound')
                        : t('modules.identificationResults', { count: identificationResults.length })}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleClearIdentification}
                    className="h-7 px-2 text-xs hover:bg-background/50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t('modules.showAll')}
                  </Button>
                </div>
              )}

              {activeFilters.length > 0 && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-3 text-blue-900 dark:text-blue-300 backdrop-blur-sm transition-all">
                  <span className="text-sm font-medium">
                    {t('modules.filtersActive', { count: activeFilters.length })}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="h-7 px-2 text-xs text-blue-700 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-500/20"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t('modules.clearFilters')}
                  </Button>
                </div>
              )}

              {/* Selection Mode Bar */}
              {selection.isSelectionMode && (
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={selection.clearSelection}
                        className="h-8 px-2 sm:px-3 text-xs"
                      >
                        <X className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">{t('modules.comparison.deselectAll')}</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleOpenComparison}
                      disabled={selection.selectionCount < 2}
                      className="h-8 px-4 flex-1 sm:flex-none"
                    >
                      <GitCompareArrows className="h-4 w-4 mr-2" />
                      {t('modules.comparison.viewComparison', { count: selection.selectionCount })}
                    </Button>
                  </div>
                </div>
              )}

              {/* Stats */}
              {!isLoading && items && items.length > 0 && (
                <StatsBar stats={stats} />
              )}

              {/* Data Table */}
              {isLoading || isSearching ? (
                <LoadingState message={translations.loading} customColor={accentColor} />
              ) : isError ? (
                <EmptyState
                  title={translations.error}
                  description={translations.errorDesc}
                  action={
                    <Button onClick={() => refetch()} variant="outline">
                      {t('common.retry')}
                    </Button>
                  }
                />
              ) : sortedItems.length === 0 ? (
                <EmptyState
                  icon={searchQuery ? SearchIcon : Icon}
                  title={searchQuery ? t('common.noResults') : translations.emptyTitle}
                  description={
                    searchQuery
                      ? translations.searchNoResults(searchQuery)
                      : activeFilters.length > 0
                      ? translations.filterNoMatch
                      : translations.emptyDatabase
                  }
                />
              ) : viewMode === 'cards' && cardConfig ? (
                <DataCardGrid
                  data={sortedItems}
                  config={cardConfig}
                  selectedId={selectedItem?.id}
                  onSelect={handleSelect}
                  isSelectionMode={selection.isSelectionMode}
                  selectedIds={selection.selectedIds}
                  onToggleSelection={selection.toggleSelection}
                  isMaxSelectionReached={selection.isMaxReached}
                />
              ) : (
                <DataTable
                  data={sortedItems}
                  columns={columns}
                  sort={sort}
                  onSort={setSort}
                  selectedId={selectedItem?.id}
                  onSelect={handleSelect}
                  isSelectionMode={selection.isSelectionMode}
                  selectedIds={selection.selectedIds}
                  onToggleSelection={selection.toggleSelection}
                  isMaxSelectionReached={selection.isMaxReached}
                />
              )}
          </div>
        </ModuleContent>

        {/* Comparison Panel - inside relative wrapper so it respects the content area */}
        {comparisonConfig && (
          <ComparisonPanel
            isOpen={comparisonPanelOpen}
            onClose={handleCloseComparison}
            items={selection.selectedItems}
            config={comparisonConfig}
            onRemoveItem={handleRemoveFromComparison}
          />
        )}

        {/* Detail Panel - inside relative wrapper so it respects the content area */}
        <DetailComponent {...detailProps} />

        {/* Form Panel (optional - e.g., create ticket) */}
        {FormComponent && <FormComponent />}
      </div>
    </>
  );
}
