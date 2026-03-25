'use client';

import { useTranslation } from 'react-i18next';
import type { DynamicBottomTab } from '@/stores/bottom-panel-store';
import { getIconComponent } from '@/lib/workspace-utils.tsx';

interface DynamicTabDragOverlayProps {
  tab: DynamicBottomTab;
}

export function DynamicTabDragOverlay({ tab }: DynamicTabDragOverlayProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-popover border border-border shadow-lg rounded-md">
      {getIconComponent(tab.icon, 'h-3.5 w-3.5 text-muted-foreground')}
      {t(tab.labelKey)}
    </div>
  );
}
