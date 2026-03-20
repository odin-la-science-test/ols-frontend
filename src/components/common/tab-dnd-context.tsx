'use client';

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { useTabsStore, type Tab } from '@/stores';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';

// ═══════════════════════════════════════════════════════════════════════════
// TAB DND CONTEXT
//
// Shared DndContext that wraps ALL editor groups (main + split).
// This enables cross-group drag & drop — a tab dragged from the main
// tab bar can be dropped onto the split tab bar and vice versa.
//
// Individual TabBar instances only render SortableContext + useDroppable;
// they don't create their own DndContext.
// ═══════════════════════════════════════════════════════════════════════════

interface TabDndState {
  /** The tab currently being dragged, or null */
  draggedTab: Tab | null;
  /** The group ID being hovered during a drag */
  overGroupId: string | null;
}

const TabDndStateContext = React.createContext<TabDndState>({
  draggedTab: null,
  overGroupId: null,
});

/** Read drag state from any TabBar inside the provider */
export function useTabDndState() {
  return React.useContext(TabDndStateContext);
}

// ─── Drag overlay ───────────────────────────────────────────────────────

function TabDragOverlay({ tab }: { tab: Tab }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-foreground bg-popover border border-border shadow-lg pointer-events-none">
      {getIconComponent(tab.icon, 'h-3.5 w-3.5 shrink-0 text-muted-foreground')}
      <span className="truncate max-w-[120px] font-medium">{tab.title}</span>
    </div>
  );
}

// ─── Provider ───────────────────────────────────────────────────────────

export function TabDndProvider({ children }: { children: React.ReactNode }) {
  const tabs = useTabsStore((s) => s.tabs);
  const reorderTabs = useTabsStore((s) => s.reorderTabs);
  const moveTabToGroup = useEditorGroupsStore((s) => s.moveTabToGroup);
  const splitActive = useEditorGroupsStore((s) => s.splitActive);

  const [state, setState] = React.useState<TabDndState>({
    draggedTab: null,
    overGroupId: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const tab = tabs.find((t) => t.id === event.active.id);
    if (tab) setState({ draggedTab: tab, overGroupId: null });
  }, [tabs]);

  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setState((prev) => ({ ...prev, overGroupId: null }));
      return;
    }
    // Check if hovering over a tab-bar drop zone
    const overData = over.data.current as { type?: string; groupId?: string } | undefined;
    if (overData?.type === 'tab-bar-drop') {
      setState((prev) => ({ ...prev, overGroupId: overData.groupId ?? null }));
    } else {
      // Hovering over a tab item — read its source group
      const tabData = over.data.current as { type?: string; source?: string } | undefined;
      if (tabData?.type === 'tab') {
        setState((prev) => ({ ...prev, overGroupId: tabData.source ?? null }));
      }
    }
  }, []);

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const draggedTab = state.draggedTab;
    setState({ draggedTab: null, overGroupId: null });

    if (!over || !draggedTab) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine source group from the active draggable's data
    const activeData = active.data.current as { source?: string } | undefined;
    const sourceGroup = activeData?.source ?? 'main';

    // Determine target group from the over element's data
    const overData = over.data.current as { type?: string; groupId?: string; source?: string } | undefined;
    let targetGroup: string;
    if (overData?.type === 'tab-bar-drop') {
      targetGroup = overData.groupId ?? 'main';
    } else if (overData?.type === 'tab') {
      targetGroup = overData.source ?? 'main';
    } else {
      targetGroup = sourceGroup;
    }

    // Cross-group move
    if (sourceGroup !== targetGroup && splitActive) {
      moveTabToGroup(activeId, targetGroup);
      return;
    }

    // Same-group reorder
    if (activeId !== overId && sourceGroup === targetGroup) {
      // Only reorder in main group (global tabs store)
      if (sourceGroup === 'main' || !splitActive) {
        const globalOld = tabs.findIndex((t) => t.id === activeId);
        const globalNew = tabs.findIndex((t) => t.id === overId);
        if (globalOld !== -1 && globalNew !== -1) {
          reorderTabs(globalOld, globalNew);
        }
      }
    }
  }, [state.draggedTab, tabs, splitActive, moveTabToGroup, reorderTabs]);

  const handleDragCancel = React.useCallback(() => {
    setState({ draggedTab: null, overGroupId: null });
  }, []);

  return (
    <TabDndStateContext.Provider value={state}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
          {state.draggedTab ? <TabDragOverlay tab={state.draggedTab} /> : null}
        </DragOverlay>
      </DndContext>
    </TabDndStateContext.Provider>
  );
}
