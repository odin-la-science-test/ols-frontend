import type { ModuleAction } from '@/lib/module-registry/types';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE ACTION BUILDERS
//
// Factory functions that create ModuleAction objects for common patterns.
// Used by pre-built layout components (ModulePageTemplate, CrudListLayout)
// and available for custom modules that need standard actions.
//
// Modules can also create ModuleAction objects directly without these
// builders — the builders are just convenience helpers.
// ═══════════════════════════════════════════════════════════════════════════

/** Creates a "Toggle view mode (table ↔ cards)" menu action */
export function createViewModeAction(opts: {
  viewMode: 'table' | 'cards';
  onToggle: () => void;
}): ModuleAction {
  return {
    id: 'view-mode',
    labelKey: opts.viewMode === 'table' ? 'common.viewCards' : 'common.viewTable',
    icon: opts.viewMode === 'table' ? 'layout-grid' : 'layout-list',
    placement: 'menu',
    mobile: true,
    action: opts.onToggle,
    isActive: () => opts.viewMode === 'cards',
  };
}

/** Creates an "Export" menu action */
export function createExportAction(opts: {
  onExport: () => void;
  canExport: boolean;
}): ModuleAction {
  return {
    id: 'export',
    labelKey: 'common.export',
    icon: 'download',
    placement: 'menu',
    mobile: true,
    action: opts.onExport,
    isDisabled: () => !opts.canExport,
    separator: true,
  };
}

/** Creates a "Select" menu action for entering selection mode (compare, batch delete, or both) */
export function createSelectAction(opts: {
  isActive: boolean;
  onToggle: () => void;
}): ModuleAction {
  return {
    id: 'select-mode',
    labelKey: opts.isActive ? 'common.exitSelectMode' : 'common.selectMode',
    icon: 'check-square',
    placement: 'menu',
    mobile: true,
    action: opts.onToggle,
    isActive: () => opts.isActive,
  };
}

/** Creates a "New item" toolbar action (e.g. "New Note", "New Contact") */
export function createNewItemAction(opts: {
  labelKey: string;
  onNew: () => void;
}): ModuleAction {
  return {
    id: 'new-item',
    labelKey: opts.labelKey,
    icon: 'plus',
    placement: 'toolbar',
    mobile: true,
    action: opts.onNew,
  };
}
