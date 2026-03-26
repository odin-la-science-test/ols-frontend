'use client';

import { useEffect, useState } from 'react';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores';
import { useActivityBarStore } from '@/stores/activity-bar-store';
import { useModuleFiltersStore, DEFAULT_GROUP_ID, SPLIT_GROUP_ID } from '@/stores/module-filters-store';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { FiltersZoneConnected } from './filters-zone-connected';

// ─── Filters Panel (contextual, driven by module-filters-store) ─────────

export function FiltersPanel() {
  const registrations = useModuleFiltersStore((s) => s.registrations);
  const hiddenGroups = useModuleFiltersStore((s) => s.hiddenGroups);
  const hideGroup = useModuleFiltersStore((s) => s.hideGroup);
  const hasAny = useModuleFiltersStore((s) => s.hasAnyRegistration());
  const { setActivePanel } = useActivityBarStore();
  const sidebarFilterLayout = useWorkspaceStore((s) => s.sidebarFilterLayout);

  const mainReg = registrations[DEFAULT_GROUP_ID];
  const splitReg = registrations[SPLIT_GROUP_ID];
  const mainVisible = !!mainReg && !hiddenGroups.has(DEFAULT_GROUP_ID);
  const splitVisible = !!splitReg && !hiddenGroups.has(SPLIT_GROUP_ID);
  const bothVisible = mainVisible && splitVisible;
  const noneVisible = hasAny && !mainVisible && !splitVisible;

  // Active tab defaults to main, switches to split if main disappears
  const [activeTab, setActiveTab] = useState<typeof DEFAULT_GROUP_ID | typeof SPLIT_GROUP_ID>(DEFAULT_GROUP_ID);
  useEffect(() => {
    if (!mainVisible && splitVisible) setActiveTab(SPLIT_GROUP_ID);
    if (mainVisible && !splitVisible) setActiveTab(DEFAULT_GROUP_ID);
  }, [mainVisible, splitVisible]);

  // When all zones are manually hidden, collapse the sidebar
  useEffect(() => {
    if (noneVisible) setActivePanel(null);
  }, [noneVisible, setActivePanel]);

  if (!hasAny || noneVisible) return null;

  // Only one group visible — simple render
  if (!bothVisible) {
    return mainVisible
      ? <FiltersZoneConnected groupId={DEFAULT_GROUP_ID} />
      : <FiltersZoneConnected groupId={SPLIT_GROUP_ID} />;
  }

  // Both visible — tabs or stacked
  if (sidebarFilterLayout === 'tabs') {
    const tabDefs = [
      { id: DEFAULT_GROUP_ID, reg: mainReg },
      { id: SPLIT_GROUP_ID, reg: splitReg },
    ] as const;

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Module-header style tab bar — two headers side by side */}
        <div className="flex shrink-0 border-b border-border/30">
          {tabDefs.map(({ id, reg }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 transition-colors cursor-pointer',
                  'border-r last:border-r-0 border-border/30',
                  isActive ? 'bg-muted/30' : 'bg-muted/10 hover:bg-muted/20'
                )}
                style={isActive ? { borderBottom: `2px solid ${reg?.accentColor || 'hsl(var(--foreground) / 0.4)'}` } : { borderBottom: '2px solid transparent' }}
              >
                <span className={cn(
                  'flex-1 min-w-0 text-[10px] font-medium uppercase tracking-wider truncate',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {reg?.moduleTitle ?? id}
                </span>
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); hideGroup(id); }}
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            );
          })}
        </div>
        {/* Active group content — no header, no extra X (tab already has the X) */}
        <div className="flex-1 overflow-hidden">
          <FiltersZoneConnected groupId={activeTab} hideModuleHeader tabsMode />
        </div>
      </div>
    );
  }

  // Stacked (default)
  return (
    <ResizablePanelGroup orientation="vertical" id="filters-split">
      <ResizablePanel id="filters-main" defaultSize="50" minSize="20">
        <FiltersZoneConnected groupId={DEFAULT_GROUP_ID} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="filters-split-panel" defaultSize="50" minSize="20">
        <FiltersZoneConnected groupId={SPLIT_GROUP_ID} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
