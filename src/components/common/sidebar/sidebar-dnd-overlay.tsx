'use client';

import { useCallback } from 'react';

import { GripVertical } from 'lucide-react';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useDndOverlay, type DragMeta } from '@/components/common/shell-dnd-context';

/**
 * Hook to register the drag overlay renderer for sidebar-panel and sidebar-zone items.
 * Call this once in AppShell so the overlay is always available,
 * even when sidebars aren't mounted yet.
 */
export function useSidebarDndOverlay() {
  useDndOverlay('sidebar-panel', useCallback((drag: DragMeta) => {
    const panel = usePanelRegistryStore.getState().panels[drag.id];
    return (
      <div className="px-3 py-1.5 rounded-md bg-card border border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] shadow-xl text-xs font-medium text-foreground flex items-center gap-2">
        <GripVertical className="h-3 w-3 text-muted-foreground/60" />
        {panel?.label ?? drag.id}
      </div>
    );
  }, []));

  useDndOverlay('sidebar-zone', useCallback((drag: DragMeta) => {
    return (
      <div className="px-3 py-1.5 rounded-md bg-card border border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] shadow-xl text-xs font-medium text-foreground flex items-center gap-2">
        <GripVertical className="h-3 w-3 text-muted-foreground/60" />
        {drag.id === 'primary' ? 'Primary' : 'Secondary'}
      </div>
    );
  }, []));
}
