'use client';

import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  ComparisonPanel,
} from '@/components/modules/shared';
import { EntityActionsBar } from '@/components/modules/shared/entity-actions-bar';
import type { ComparisonConfig } from '@/components/modules/shared/comparison-panel';
import type { UseSelectionReturn } from '@/hooks/use-selection';
import type { ModuleShellReturn } from '@/hooks/use-module-shell';
import type { FormMode } from './collection-layout-types';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION CONTENT — Detail/form panels, comparison, and mobile overlays
// ═══════════════════════════════════════════════════════════════════════════

// ─── Desktop sidebar content (detail/form portaled into secondary sidebar) ───

interface DesktopDetailPortalProps<T extends { id: number }> {
  shell: ModuleShellReturn;
  showForm: boolean;
  showDetail: boolean;
  formMode: FormMode;
  selectedItem: T | null;
  newItemConfig?: { labelKey: string; createTitle?: string; editTitle?: string };
  moduleKeyProp: string;
  hasEdit: boolean;
  renderDetail: (props: { item: T; onClose: () => void; onEdit?: () => void }) => ReactNode;
  renderEditor?: (props: { item?: T; onSaved: (item: T) => void; onCancel: () => void; moduleKey: string }) => ReactNode;
  onCloseDetail: () => void;
  onEdit: () => void;
  onCreated: (item: T) => void;
  onUpdated: (item: T) => void;
  onCancelForm: () => void;
  entityActions?: {
    annotations?: { entityType: string };
    collections?: { moduleId: string };
    favorite?: boolean;
    renderFavoriteAction?: (props: { entityId: number }) => import('react').ReactNode;
  };
}

export function DesktopDetailPortal<T extends { id: number }>({
  shell,
  showForm,
  showDetail,
  formMode,
  selectedItem,
  newItemConfig,
  moduleKeyProp,
  hasEdit,
  renderDetail,
  renderEditor,
  onCloseDetail,
  onEdit,
  onCreated,
  onUpdated,
  onCancelForm,
  entityActions,
}: DesktopDetailPortalProps<T>) {
  const { t } = useTranslation();

  if (!shell.isDesktop || !shell.detailPortalTarget) return null;

  let content: ReactNode = null;

  if (showForm && renderEditor) {
    content = (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 shrink-0">
          <h2 className="text-sm font-semibold truncate">
            {formMode === 'create'
              ? (newItemConfig?.createTitle ? t(newItemConfig.createTitle) : t('common.create'))
              : (newItemConfig?.editTitle ? t(newItemConfig.editTitle) : t('common.edit'))}
          </h2>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {renderEditor({
            item: formMode === 'edit' ? (selectedItem ?? undefined) : undefined,
            onSaved: formMode === 'edit' ? onUpdated : onCreated,
            onCancel: onCancelForm,
            moduleKey: moduleKeyProp,
          })}
        </div>
      </div>
    );
  } else if (showDetail && selectedItem) {
    content = (
      <div className="flex flex-col h-full overflow-hidden">
        {entityActions && (
          <EntityActionsBar
            entityId={selectedItem.id}
            annotations={entityActions.annotations}
            collections={entityActions.collections}
            renderFavoriteAction={entityActions.renderFavoriteAction}
            favorite={!entityActions.renderFavoriteAction && entityActions.favorite ? {
              moduleId: moduleKeyProp,
              label: String(selectedItem.id),
              route: `/${moduleKeyProp}/${selectedItem.id}`,
            } : undefined}
          />
        )}
        {renderDetail({
          item: selectedItem,
          onClose: onCloseDetail,
          onEdit: hasEdit ? onEdit : undefined,
        })}
      </div>
    );
  }

  if (!content) return null;

  return createPortal(content, shell.detailPortalTarget);
}

// ─── Comparison panel wrapper ───

interface CollectionComparisonPanelProps<T extends { id: number }> {
  comparisonConfig: ComparisonConfig<T> | null;
  comparisonPanelOpen: boolean;
  onClose: () => void;
  selection: UseSelectionReturn<T>;
}

export function CollectionComparisonPanel<T extends { id: number }>({
  comparisonConfig,
  comparisonPanelOpen,
  onClose,
  selection,
}: CollectionComparisonPanelProps<T>) {
  if (!comparisonConfig) return null;

  return (
    <ComparisonPanel
      isOpen={comparisonPanelOpen}
      onClose={onClose}
      items={selection.selectedItems}
      config={comparisonConfig}
      onRemoveItem={(id) => {
        selection.deselect(id);
        if (selection.selectionCount <= 2) onClose();
      }}
    />
  );
}

// ─── Mobile overlays (detail + form) ───

interface MobileOverlaysProps<T extends { id: number }> {
  shell: ModuleShellReturn;
  showForm: boolean;
  showDetail: boolean;
  formMode: FormMode;
  selectedItem: T | null;
  newItemConfig?: { labelKey: string; createTitle?: string; editTitle?: string };
  moduleKeyProp: string;
  hasEdit: boolean;
  renderDetail: (props: { item: T; onClose: () => void; onEdit?: () => void }) => ReactNode;
  renderEditor?: (props: { item?: T; onSaved: (item: T) => void; onCancel: () => void; moduleKey: string }) => ReactNode;
  onCloseDetail: () => void;
  onEdit: () => void;
  onCreated: (item: T) => void;
  onUpdated: (item: T) => void;
  onCancelForm: () => void;
  entityActions?: {
    annotations?: { entityType: string };
    collections?: { moduleId: string };
    favorite?: boolean;
    renderFavoriteAction?: (props: { entityId: number }) => import('react').ReactNode;
  };
}

export function MobileOverlays<T extends { id: number }>({
  shell,
  showForm,
  showDetail,
  formMode,
  selectedItem,
  newItemConfig,
  moduleKeyProp,
  hasEdit,
  renderDetail,
  renderEditor,
  onCloseDetail,
  onEdit,
  onCreated,
  onUpdated,
  onCancelForm,
  entityActions,
}: MobileOverlaysProps<T>) {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile: detail overlay */}
      <AnimatePresence>
        {!shell.isDesktop && showDetail && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background lg:hidden"
          >
            {entityActions && (
              <EntityActionsBar
                entityId={selectedItem.id}
                annotations={entityActions.annotations}
                collections={entityActions.collections}
                renderFavoriteAction={entityActions.renderFavoriteAction}
                favorite={!entityActions.renderFavoriteAction && entityActions.favorite ? {
                  moduleId: moduleKeyProp,
                  label: String(selectedItem.id),
                  route: `/${moduleKeyProp}/${selectedItem.id}`,
                } : undefined}
              />
            )}
            {renderDetail({
              item: selectedItem,
              onClose: onCloseDetail,
              onEdit: hasEdit ? onEdit : undefined,
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: form overlay */}
      <AnimatePresence>
        {!shell.isDesktop && showForm && renderEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-border/50 shrink-0">
              <h2 className="text-base font-semibold">
                {formMode === 'create'
                  ? (newItemConfig?.createTitle ? t(newItemConfig.createTitle) : t('common.create'))
                  : (newItemConfig?.editTitle ? t(newItemConfig.editTitle) : t('common.edit'))}
              </h2>
              <button onClick={onCancelForm} className="p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              {renderEditor({
                item: formMode === 'edit' ? (selectedItem ?? undefined) : undefined,
                onSaved: formMode === 'edit' ? onUpdated : onCreated,
                onCancel: onCancelForm,
                moduleKey: moduleKeyProp,
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
