'use client';

import { Fragment } from 'react';

import { X } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

import { UnifiedSidebarContext } from './sidebar-context';
import type { SidebarStackedProps } from './types';

export function SidebarStacked({
  zone,
  panels,
  renderPanel,
  onPanelClose,
  panelGroupId,
}: SidebarStackedProps) {
  const defaultSize = Math.floor(100 / panels.length);

  return (
    <ResizablePanelGroup orientation="vertical" id={panelGroupId}>
      {panels.map((panel, index) => (
        <Fragment key={panel.id}>
          {index > 0 && <ResizableHandle />}
          <ResizablePanel
            id={`${panelGroupId}-${panel.id}`}
            defaultSize={String(defaultSize) as any}
            minSize="15"
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mini header — ultra-compact */}
              <div className="shrink-0 flex items-center justify-between px-2.5 py-0.5 border-b border-[color-mix(in_srgb,var(--color-border)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_10%,transparent)]">
                <span
                  className="text-[9px] font-medium uppercase tracking-widest truncate text-muted-foreground/70"
                  style={panel.accentColor ? { color: panel.accentColor } : undefined}
                >
                  {panel.label}
                </span>
                <button
                  onClick={() => onPanelClose(panel.id)}
                  className="ml-1 shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
              {/* Panel content */}
              <UnifiedSidebarContext.Provider value={{ zone, isMultiPanel: true, viewMode: 'stacked', suppressModuleHeader: true }}>
                <div className="flex-1 overflow-hidden">
                  {renderPanel(panel.id)}
                </div>
              </UnifiedSidebarContext.Provider>
            </div>
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  );
}
