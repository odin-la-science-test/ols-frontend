'use client';

import type { Tab } from '@/stores';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

export function TabDragOverlay({ tab }: { tab: Tab }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-foreground bg-popover border border-border shadow-lg">
      <DynamicIcon name={tab.icon} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate max-w-[120px] font-medium">{tab.title}</span>
    </div>
  );
}
