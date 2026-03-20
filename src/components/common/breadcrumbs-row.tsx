'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMBS ROW - Wrapper with context menu for breadcrumbs + toolbar row
//
// Right-click toggles: breadcrumbs visibility, module toolbar visibility.
// ═══════════════════════════════════════════════════════════════════════════

interface BreadcrumbsRowProps {
  children: React.ReactNode;
  className?: string;
}

export function BreadcrumbsRow({ children, className }: BreadcrumbsRowProps) {
  const { t } = useTranslation();
  const { showBreadcrumbs, toggleBreadcrumbs } = useWorkspaceStore();
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();

  return (
    <div
      className={cn(
        'relative z-30 shrink-0 flex items-center gap-2 px-4 py-1.5 border-b border-border/40 bg-card/85 backdrop-blur-sm min-h-8',
        className,
      )}
      onContextMenu={handleContextMenu}
    >
      {children}

      {menuPosition && (
        <BarContextMenu position={menuPosition} onClose={closeMenu} estimatedHeight={80}>
          <MenuItem
            label={t('contextMenu.breadcrumbs')}
            onClick={() => { toggleBreadcrumbs(); closeMenu(); }}
            checked={showBreadcrumbs}
          />
        </BarContextMenu>
      )}
    </div>
  );
}
