'use client';

import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores';
import { BarContextMenu, useBarContextMenuState, MenuItem } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// TOOLBAR ROW — Container for contextual module tools (search, actions, filters)
//
// Right-click toggles: breadcrumbs visibility (in NavigationBar).
// Breadcrumbs themselves live in NavigationBar, not here.
// ═══════════════════════════════════════════════════════════════════════════

interface ToolbarRowProps {
  children: ReactNode;
  className?: string;
}

export function ToolbarRow({ children, className }: ToolbarRowProps) {
  const { t } = useTranslation();
  const { showBreadcrumbs, toggleBreadcrumbs } = useWorkspaceStore();
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();

  return (
    <div
      className={cn(
        'relative z-30 shrink-0 flex items-center gap-2 px-4 py-1.5 surface-high min-h-8',
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
