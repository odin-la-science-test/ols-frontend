'use client';

import { useCallback, useState } from 'react';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useTabsStore, type Tab } from '@/stores';

import { TabBarInner } from './tab-bar-inner';
import { TabDragOverlay } from './tab-drag-overlay';

export function StandaloneTabBar({ className, editorGroupId }: { className?: string; editorGroupId?: string }) {
  const tabs = useTabsStore((s) => s.tabs);
  const reorderTabs = useTabsStore((s) => s.reorderTabs);

  const [draggedTab, setDraggedTab] = useState<Tab | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const tab = tabs.find((t) => t.id === event.active.id);
    if (tab) setDraggedTab(tab);
  }, [tabs]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDraggedTab(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tabs.findIndex((t) => t.id === active.id);
    const newIndex = tabs.findIndex((t) => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) reorderTabs(oldIndex, newIndex);
  }, [tabs, reorderTabs]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TabBarInner className={className} editorGroupId={editorGroupId} />
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
        {draggedTab ? <TabDragOverlay tab={draggedTab} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
