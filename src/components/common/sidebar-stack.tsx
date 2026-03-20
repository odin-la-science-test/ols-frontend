'use client';

import * as React from 'react';
import { X, Rows2, PanelTop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDensity } from '@/hooks';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useSidebarStackStore, type SidebarSide } from '@/stores/sidebar-stack-store';

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR STACK — Generic multi-panel container for any sidebar
//
// Renders N panels in tabs or stacked (resizable) layout.
// Used by GlobalSidebarContent and SecondarySidebarContent.
//
// Provides SidebarStackContext so child panels can detect they're inside
// a multi-panel stack and suppress their own internal headers.
// ═══════════════════════════════════════════════════════════════════════════

/** Context available to any panel rendered inside a SidebarStack */
export interface SidebarStackContextValue {
  /** true when multiple panels are shown simultaneously */
  isMultiPanel: boolean;
  /** current layout mode */
  layout: 'tabs' | 'stacked';
}

const SidebarStackContext = React.createContext<SidebarStackContextValue | null>(null);

/** Hook for child panels to know if they're inside a multi-panel stack */
export function useSidebarStackContext(): SidebarStackContextValue | null {
  return React.useContext(SidebarStackContext);
}
//
//
// No hardcoded panel types — the parent provides a render function
// and panel metadata. The stack store handles ordering & active tab.
// ═══════════════════════════════════════════════════════════════════════════

/** Metadata for a panel in the stack */
export interface StackPanelMeta {
  /** Unique panel id */
  id: string;
  /** Display label */
  label: string;
  /** Optional accent color for the tab indicator */
  accentColor?: string;
}

export interface SidebarStackProps {
  /** Which sidebar this stack belongs to */
  side: SidebarSide;
  /** Metadata for all panels in the current stack (ordered) */
  panels: StackPanelMeta[];
  /** Render function: given a panel id, renders its content */
  renderPanel: (panelId: string) => React.ReactNode;
  /** Unique id prefix for resizable panels (avoid conflicts) */
  panelGroupId: string;
  /** Called when the active tab changes (so parent can sync external state) */
  onTabChange?: (panelId: string) => void;
  /** Optional className for the container */
  className?: string;
}

/**
 * Generic sidebar stack renderer.
 *
 * - 1 panel  → renders it directly (no tabs, no chrome)
 * - N panels → renders in tabs or stacked mode based on store layout
 */
export function SidebarStack({
  side,
  panels,
  renderPanel,
  panelGroupId,
  onTabChange,
  className,
}: SidebarStackProps) {
  const d = useDensity();
  const activeTab = useSidebarStackStore((s) => s.activeTabs[side]);
  const layout = useSidebarStackStore((s) => s.layouts[side]);
  const setActiveTab = useSidebarStackStore((s) => s.setActiveTab);
  const removeFromStack = useSidebarStackStore((s) => s.removeFromStack);

  // If only 1 panel, render directly
  if (panels.length <= 1) {
    return (
      <div className={cn('flex-1 flex flex-col overflow-hidden', className)}>
        {panels[0] ? renderPanel(panels[0].id) : null}
      </div>
    );
  }

  // Multiple panels — tabs or stacked
  if (layout === 'tabs') {
    return (
      <SidebarStackTabs
        side={side}
        panels={panels}
        renderPanel={renderPanel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        removeFromStack={removeFromStack}
        onTabChange={onTabChange}
        density={d.density}
        className={className}
      />
    );
  }

  // Stacked (resizable)
  return (
    <SidebarStackStacked
      panels={panels}
      renderPanel={renderPanel}
      panelGroupId={panelGroupId}
      removeFromStack={(id) => removeFromStack(side, id)}
      className={className}
    />
  );
}

// ─── Tabs Mode ──────────────────────────────────────────────────────────

interface SidebarStackTabsProps {
  side: SidebarSide;
  panels: StackPanelMeta[];
  renderPanel: (panelId: string) => React.ReactNode;
  activeTab: string | null;
  setActiveTab: (side: SidebarSide, id: string) => void;
  removeFromStack: (side: SidebarSide, id: string) => void;
  onTabChange?: (panelId: string) => void;
  density: string;
  className?: string;
}

function SidebarStackTabs({
  side,
  panels,
  renderPanel,
  activeTab,
  setActiveTab,
  removeFromStack,
  onTabChange,
  density,
  className,
}: SidebarStackTabsProps) {
  // Ensure activeTab is valid
  const resolvedActive = panels.find((p) => p.id === activeTab)?.id ?? panels[0]?.id ?? null;

  const handleTabClick = React.useCallback((panelId: string) => {
    setActiveTab(side, panelId);
    onTabChange?.(panelId);
  }, [side, setActiveTab, onTabChange]);

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Tab bar */}
      <div className="flex shrink-0">
        {panels.map((panel) => {
          const isActive = panel.id === resolvedActive;
          return (
            <button
              key={panel.id}
              onClick={() => handleTabClick(panel.id)}
              className={cn(
                'relative flex-1 min-w-0 flex items-center gap-1.5 transition-colors cursor-pointer',
                'border-r last:border-r-0 border-border/30',
                density === 'compact' ? 'px-2 py-1' : 'px-2.5 py-1.5',
                isActive ? 'bg-muted/30' : 'bg-muted/10 hover:bg-muted/20',
              )}
            >
              <span
                className={cn(
                  'flex-1 min-w-0 text-[10px] font-medium uppercase tracking-wider truncate',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {panel.label}
              </span>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromStack(side, panel.id);
                }}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-3 w-3" />
              </span>
              {/* Active tab indicator — absolutely positioned bottom bar */}
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-[2px] transition-colors',
                  isActive ? 'bg-primary' : 'bg-transparent',
                )}
                style={isActive && panel.accentColor ? { backgroundColor: panel.accentColor } : undefined}
              />
            </button>
          );
        })}
      </div>

      {/* Active panel content */}
      <div className="flex-1 overflow-hidden">
        <SidebarStackContext.Provider value={{ isMultiPanel: true, layout: 'tabs' }}>
          {resolvedActive && renderPanel(resolvedActive)}
        </SidebarStackContext.Provider>
      </div>
    </div>
  );
}

// ─── Stacked Mode (resizable) ───────────────────────────────────────────

interface SidebarStackStackedProps {
  panels: StackPanelMeta[];
  renderPanel: (panelId: string) => React.ReactNode;
  panelGroupId: string;
  removeFromStack: (id: string) => void;
  className?: string;
}

function SidebarStackStacked({
  panels,
  renderPanel,
  panelGroupId,
  removeFromStack,
  className,
}: SidebarStackStackedProps) {
  const defaultSize = Math.floor(100 / panels.length);

  return (
    <ResizablePanelGroup
      orientation="vertical"
      id={panelGroupId}
      className={className}
    >
      {panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          {index > 0 && <ResizableHandle />}
          <ResizablePanel
            id={`${panelGroupId}-${panel.id}`}
            defaultSize={String(defaultSize) as any}
            minSize="15"
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mini header with panel name + close */}
              <div className="shrink-0 flex items-center justify-between px-3 py-1 border-b border-border/30 bg-muted/20">
                <span
                  className="text-[10px] font-medium uppercase tracking-wider truncate text-muted-foreground"
                  style={panel.accentColor ? { color: panel.accentColor } : undefined}
                >
                  {panel.label}
                </span>
                <button
                  onClick={() => removeFromStack(panel.id)}
                  className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {/* Panel content */}
              <div className="flex-1 overflow-hidden">
                <SidebarStackContext.Provider value={{ isMultiPanel: true, layout: 'stacked' }}>
                  {renderPanel(panel.id)}
                </SidebarStackContext.Provider>
              </div>
            </div>
          </ResizablePanel>
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
}

// ─── Layout Toggle Button ───────────────────────────────────────────────

export interface StackLayoutToggleProps {
  side: SidebarSide;
  className?: string;
}

/**
 * Small toggle button for switching between tabs/stacked.
 * Only renders when the stack has 2+ panels.
 */
export function StackLayoutToggle({ side, className }: StackLayoutToggleProps) {
  const layout = useSidebarStackStore((s) => s.layouts[side]);
  const toggleLayout = useSidebarStackStore((s) => s.toggleLayout);
  const stackSize = useSidebarStackStore((s) => s.stacks[side].length);

  if (stackSize < 2) return null;

  return (
    <button
      onClick={() => toggleLayout(side)}
      className={cn(
        'p-1 rounded-lg transition-colors',
        'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        className,
      )}
      title={layout === 'tabs' ? 'Vue empilée' : 'Vue onglets'}
    >
      {layout === 'tabs' ? (
        <Rows2 className="h-3.5 w-3.5" />
      ) : (
        <PanelTop className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
