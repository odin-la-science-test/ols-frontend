import type { ComponentType, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import type { TFunction } from 'i18next';
import { CollectionLayout, type CollectionTranslations } from '@/components/modules/layout/collection-layout';
import { useGuestGuard } from '@/hooks/use-guest-guard';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { ComparisonField } from '@/components/modules/shared/comparison-panel';
import type { MobileMenuItem } from '@/components/modules/layout/module-header';

// ═══════════════════════════════════════════════════════════════════════════
// CREATE COLLECTION PAGE — Factory for generating collection module pages
//
// Wraps CollectionLayout with a typed config object.
// Each module calls createCollectionPage({ ... }) to get a page component.
// ═══════════════════════════════════════════════════════════════════════════

export interface CollectionPageConfig<T extends { id: number; confidenceScore?: number }> {
  moduleKey: string;
  iconName: string;
  backTo?: string;

  translations: (t: TFunction) => CollectionTranslations;

  useData: () => { data?: T[]; isLoading: boolean; isError?: boolean; refetch?: () => void };
  useSearch?: (query: string) => { data?: T[]; isLoading: boolean };

  columns: (data: T[], t: TFunction) => ColumnDef<T>[];
  cardConfig?: (t: TFunction) => CardConfig<T>;

  filters?: FilterConfig[] | ((t: TFunction) => FilterConfig[]);
  computeStats?: (data: T[], t: TFunction) => StatItem[];
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  search?: boolean;

  onItemClick?: (item: T) => void;
  renderDetail: (props: { item: T; onClose: () => void; onEdit?: () => void }) => ReactNode;
  renderEditor?: (props: { item?: T; onSaved: (item: T) => void; onCancel: () => void; moduleKey: string }) => ReactNode;
  hasEdit?: boolean;

  comparison?: { fields: (t: TFunction) => ComparisonField<T>[] };
  showCompare?: boolean;

  exportConfig?: { getColumns: (data: T[], t: TFunction) => Array<{ key: keyof T; header: string }> };
  showExport?: boolean;

  IdentificationToolsComponent?: ComponentType<{
    onResults?: (results: unknown[]) => void;
    onAction?: () => void;
  }>;

  /** Hook that returns a batch delete handler. Called inside the rendered component. */
  useBatchDelete?: () => (ids: Set<string | number>) => void;

  newItemConfig?: { labelKey: string; createTitle?: string; editTitle?: string };
  useMobileMenuItems?: () => MobileMenuItem[];

  entityActions?: {
    annotations?: { entityType: string };
    collections?: { moduleId: string };
    favorite?: boolean;
    renderFavoriteAction?: (props: { entityId: number }) => ReactNode;
  };
}

export function createCollectionPage<T extends { id: number; confidenceScore?: number }>(
  config: CollectionPageConfig<T>
) {
  return function CollectionPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isGuest } = useGuestGuard();
    const translations = config.translations(t);
    const batchDeleteHandler = config.useBatchDelete ? config.useBatchDelete() : undefined;

    return (
      <>
      {isGuest && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/15 text-sm">
          <span className="text-muted-foreground">{t('guest.dataLimited')}</span>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <UserPlus className="w-3 h-3" />
            {t('guest.signUp')}
          </button>
        </div>
      )}
      <CollectionLayout<T>
        moduleKey={config.moduleKey}
        title={translations.title}
        icon={config.iconName}
        backTo={config.backTo}
        useData={config.useData}
        useSearch={config.useSearch}
        columns={config.columns}
        cardConfig={config.cardConfig}
        filters={typeof config.filters === 'function' ? config.filters(t) : config.filters}
        computeStats={config.computeStats}
        defaultSort={config.defaultSort}
        search={config.search}
        onItemClick={config.onItemClick}
        renderDetail={config.renderDetail}
        renderEditor={config.renderEditor}
        hasEdit={config.hasEdit}
        comparison={config.comparison}
        showCompare={config.showCompare}
        exportConfig={config.exportConfig}
        showExport={config.showExport}
        IdentificationToolsComponent={config.IdentificationToolsComponent}
        onBatchDelete={batchDeleteHandler}
        newItemConfig={config.newItemConfig}
        useMobileMenuItems={config.useMobileMenuItems}
        entityActions={config.entityActions}
        translations={translations}
      />
      </>
    );
  };
}
