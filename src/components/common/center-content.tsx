'use client';

import { Outlet } from 'react-router-dom';
import { TabBar } from '@/components/common';
import { ModuleToolbar, ToolbarSearch } from '@/components/common/module-toolbar';
import { ToolbarRow } from '@/components/common/toolbar-row';
import { SplitEditorPane } from '@/components/common/split-editor-pane';
import { TabDndProvider } from '@/components/common/tab-dnd-context';
import { EditorGroupProvider } from '@/components/common/editor-group-context';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import type { SplitDirection } from '@/stores/editor-groups-store';

// ═══════════════════════════════════════════════════════════════════════════
// Center Content — main editor area with optional split panes
//
// Breadcrumbs are now in the TitleBar (NavigationBar). This component only
// renders the ToolbarRow (search, actions, filters) when the module needs it.
// ═══════════════════════════════════════════════════════════════════════════

export interface CenterContentProps {
  showChrome: boolean;
  showBreadcrumbs: boolean;
  tabBarVisible: boolean;
  hasModuleToolbar: boolean;
  hasModuleFilters: boolean;
  splitActive: boolean;
  splitDirection: SplitDirection;
}

export function CenterContent({
  showChrome, tabBarVisible,
  hasModuleToolbar, hasModuleFilters,
  splitActive, splitDirection,
}: CenterContentProps) {
  const hasToolbarSearch = useModuleFiltersStore((s) => !!s.toolbarSearch);
  const showToolbarRow = hasModuleToolbar || hasModuleFilters || hasToolbarSearch;

  if (splitActive) {
    return (
      <TabDndProvider>
        <ResizablePanelGroup orientation={splitDirection} id="ols-split-editor" style={{ height: '100%' }}>
          <ResizablePanel id="editor-main" defaultSize="50" minSize="15">
            <EditorGroupProvider groupId="main">
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {showChrome && tabBarVisible && <TabBar editorGroupId="main" externalDnd />}
                {showChrome && showToolbarRow && (
                  <ToolbarRow>
                    <ToolbarSearch />
                    <ModuleToolbar className="ml-auto" />
                  </ToolbarRow>
                )}
                <main className="bg-background" style={{ position: 'relative', flex: 1, overflow: 'hidden' }}><Outlet /></main>
              </div>
            </EditorGroupProvider>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="editor-split" defaultSize="50" minSize="15">
            <SplitEditorPane externalDnd />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabDndProvider>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showChrome && tabBarVisible && <TabBar />}
      {showChrome && showToolbarRow && (
        <ToolbarRow>
          <ToolbarSearch />
          <ModuleToolbar className="ml-auto" />
        </ToolbarRow>
      )}
      <main className="bg-background" style={{ position: 'relative', flex: 1, overflow: 'hidden' }}><Outlet /></main>
    </div>
  );
}
