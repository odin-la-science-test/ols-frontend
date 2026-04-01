import { Outlet } from 'react-router-dom';
import { ModuleToolbar, ToolbarSearch } from '@/components/common/module-toolbar';
import { ToolbarRow } from '@/components/common/toolbar-row';
import { NavigationBar } from '@/components/common/navigation-bar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { ClassicSidebar } from './classic-sidebar';
import { ClassicPanelSidebar } from './classic-panel-sidebar';
import { MobileLayout } from './mobile-layout';

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIC SHELL LAYOUT — Arc-style layout for classic mode
//
// ClassicSidebar (nav, left) | NavigationBar (gap) + Card (content)
// NavigationBar lives in the Arc gap above the card (address bar).
// ToolbarRow (search, actions) lives inside the card (contextual).
// No tabs, no split view, no bottom panel, no overlay sidebars.
// ═══════════════════════════════════════════════════════════════════════════

interface ClassicShellLayoutProps {
  showBreadcrumbs: boolean;
  hasModuleToolbar: boolean;
  isMinimalShell: boolean;
}

export function ClassicShellLayout({ hasModuleToolbar, isMinimalShell }: ClassicShellLayoutProps) {
  const hasToolbarSearch = useModuleFiltersStore((s) => !!s.toolbarSearch);
  const hasModuleFilters = useModuleFiltersStore((s) => s.hasAnyRegistration());
  const showToolbarRow = !isMinimalShell && (hasModuleToolbar || hasModuleFilters || hasToolbarSearch);

  // Check if any panel sidebar content is available
  const primaryZone = usePanelRegistryStore((s) => s.zones.primary);
  const secondaryZone = usePanelRegistryStore((s) => s.zones.secondary);
  // Direct check: detail open in module store (independent of zone timing)
  const detailIsOpen = useModuleDetailStore((s) =>
    Object.values(s.registrations).some((r) => r?.isOpen),
  );
  const hasPanels = detailIsOpen
    || (primaryZone?.isOpen && primaryZone.stack.length > 0)
    || (secondaryZone?.isOpen && secondaryZone.stack.length > 0);
  const showPanelSidebar = !isMinimalShell && hasPanels;

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <ClassicSidebar />

        {/* Arc-style: surface-low wraps sidebar + navbar as one shell surface */}
        <div className="flex flex-col flex-1 min-w-0 p-1.5 surface-low">
          {/* NavigationBar — inherits surface-low from parent */}
          <NavigationBar className="px-2 py-1 shrink-0" showUndoRedo={!isMinimalShell} />

          {/* Content area — bg-background distinct from chrome (surface-low), dots/grid on top */}
          <div className="flex flex-col flex-1 min-h-0 rounded-xl overflow-hidden bg-background">
            {/* ToolbarRow — contextual module tools (only if module has search/actions/filters) */}
            {showToolbarRow && (
              <ToolbarRow>
                <ToolbarSearch />
                <ModuleToolbar className="ml-auto" />
              </ToolbarRow>
            )}

            <main id="main-content" className="flex flex-1 min-h-0">
              <ResizablePanelGroup orientation="horizontal" id="ols-classic-content">
                <ResizablePanel id="classic-center" defaultSize="75" minSize="40">
                  <div className="h-full overflow-auto">
                    <Outlet />
                  </div>
                </ResizablePanel>

                {showPanelSidebar && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel id="classic-panel" defaultSize="25" minSize="15" maxSize="45" collapsible collapsedSize="0">
                      <ClassicPanelSidebar />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile layout (same as IDE mode) */}
      <MobileLayout isMinimalShell={isMinimalShell} />
    </>
  );
}
