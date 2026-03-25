'use client';

import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores';
import { BarContextMenu, useBarContextMenuState, MenuItem } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMBS ROW - Wrapper with context menu for breadcrumbs + toolbar row
//
// Right-click toggles: breadcrumbs visibility, module toolbar visibility.
// ═══════════════════════════════════════════════════════════════════════════

interface BreadcrumbsRowProps {
  children: ReactNode;
  className?: string;
}

export function BreadcrumbsRow({ children, className }: BreadcrumbsRowProps) {
  const { t } = useTranslation();
  const { showBreadcrumbs, toggleBreadcrumbs } = useWorkspaceStore();
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();

  return (
    <div
      className={cn(
        'relative z-30 shrink-0 flex items-center gap-2 px-4 py-1.5 border-b border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_85%,transparent)] backdrop-blur-sm min-h-8',
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
