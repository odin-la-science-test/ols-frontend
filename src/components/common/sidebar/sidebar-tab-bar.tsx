'use client';

import { useMemo } from 'react';

import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableTab } from './sortable-tab';
import type { SidebarTabBarProps } from './types';

export function SidebarTabBar({
  panels,
  activeTab,
  onTabClick,
  onTabClose,
  density,
  zone,
  alwaysShowClose,
}: SidebarTabBarProps) {
  const sortableIds = useMemo(
    () => panels.map((p) => `sidebar-tab-${zone}-${p.id}`),
    [panels, zone],
  );

  return (
    <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
      <div className="flex shrink-0 border-b border-[color-mix(in_srgb,var(--color-border)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_5%,transparent)]">
        {panels.map((panel) => {
          const isActive = panel.id === activeTab;
          return (
            <SortableTab
              key={panel.id}
              panel={panel}
              zone={zone}
              isActive={isActive}
              density={density}
              onClick={() => onTabClick(panel.id)}
              onClose={() => onTabClose(panel.id)}
              showClose={alwaysShowClose || panels.length > 1}
              multiTab={panels.length > 1}
            />
          );
        })}
      </div>
    </SortableContext>
  );
}
