'use client';

import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  X,
  PanelBottomClose,
  PanelLeft,
  PanelRight,
  AlignVerticalJustifyCenter,
} from 'lucide-react';
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
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useBottomPanelStore, type BottomPanelAlignment, type DynamicBottomTab } from '@/stores/bottom-panel-store';
import { useDensity } from '@/hooks';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator } from '@/components/common/bar-context-menu';
import { BUILTIN_TABS } from './constants';
import { ActivityLogPanel } from './activity-log-panel';
import { SortableDynamicTab } from './sortable-dynamic-tab';
import { DynamicTabDragOverlay } from './dynamic-tab-drag-overlay';

interface BottomPanelContentProps {
  className?: string;
}

/**
 * Content-only version — no wrapping motion/size/resize container.
 * Used by AppShell with react-resizable-panels for sizing.
 */
export function BottomPanelContent({ className }: BottomPanelContentProps) {
  const { t } = useTranslation();
  const d = useDensity();
  const isCompact = d.density === 'compact';
  const { activeTab, setActiveTab, toggleVisible, dynamicTabs, hiddenTabs, toggleTabHidden, alignment, setAlignment, reorderDynamicTabs } = useBottomPanelStore();
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();

  // Filter out hidden tabs
  const visibleBuiltinTabs = BUILTIN_TABS.filter(({ id }) => !hiddenTabs.has(id));
  const visibleDynamicTabs = dynamicTabs.filter((tab) => !hiddenTabs.has(tab.id));
  const dynamicTabIds = visibleDynamicTabs.map((t) => t.id);

  // DnD for dynamic tabs
  const [draggedDynamicTab, setDraggedDynamicTab] = useState<DynamicBottomTab | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const tab = visibleDynamicTabs.find((t) => t.id === event.active.id);
    if (tab) setDraggedDynamicTab(tab);
  }, [visibleDynamicTabs]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDraggedDynamicTab(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = visibleDynamicTabs.findIndex((t) => t.id === active.id);
    const newIndex = visibleDynamicTabs.findIndex((t) => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(visibleDynamicTabs, oldIndex, newIndex);
      reorderDynamicTabs(reordered.map((t) => t.id));
    }
  }, [visibleDynamicTabs, reorderDynamicTabs]);

  return (
    <div className={cn('flex flex-col h-full surface-high border-t border-border/30 overflow-hidden', className)}>
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-2 border-b border-border/40 shrink-0" onContextMenu={handleContextMenu}>
        {/* Built-in tabs */}
        {visibleBuiltinTabs.map(({ id, icon: TabIcon, labelKey }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 text-xs font-medium transition-colors',
                isCompact ? 'py-1' : 'py-1.5',
                isActive
                  ? 'text-foreground border-b-2'
                  : 'text-muted-foreground hover:text-foreground pb-[2px]',
              )}
              style={isActive ? { borderBottomColor: 'color-mix(in srgb, var(--color-foreground) 25%, transparent)' } : undefined}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {t(labelKey)}
            </button>
          );
        })}

        {/* Dynamic module tabs — sortable */}
        {visibleDynamicTabs.length > 0 && (
          <>
            <div className="w-px h-4 bg-border/40 mx-1 shrink-0" />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={dynamicTabIds} strategy={horizontalListSortingStrategy}>
                <div className="flex items-center gap-0">
                  {visibleDynamicTabs.map((tab) => (
                    <SortableDynamicTab
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      isCompact={isCompact}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
                {draggedDynamicTab ? <DynamicTabDragOverlay tab={draggedDynamicTab} /> : null}
              </DragOverlay>
            </DndContext>
          </>
        )}

        <div className="flex-1" />

        {/* Alignment toggles */}
        <div className="flex items-center gap-0.5 mr-1">
          {([
            { value: 'center' as BottomPanelAlignment, title: t('bottomPanel.alignCenter'), icon: <PanelBottomClose className="h-3.5 w-3.5" /> },
            { value: 'left' as BottomPanelAlignment, title: t('bottomPanel.alignLeft'), icon: <PanelLeft className="h-3.5 w-3.5" /> },
            { value: 'right' as BottomPanelAlignment, title: t('bottomPanel.alignRight'), icon: <PanelRight className="h-3.5 w-3.5" /> },
            { value: 'justify' as BottomPanelAlignment, title: t('bottomPanel.alignJustify'), icon: <AlignVerticalJustifyCenter className="h-3.5 w-3.5" /> },
          ]).map((opt) => (
            <Tooltip key={opt.value} delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setAlignment(opt.value)}
                  className={cn(
                    'p-1 rounded-sm transition-colors',
                    alignment === opt.value
                      ? 'text-foreground bg-muted/50'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{opt.title}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Close */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleVisible}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('bottomPanel.close')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'activity' && <ActivityLogPanel />}
        {/* Render dynamic tab content */}
        {dynamicTabs.map((tab) => (
          <div key={tab.id} className={cn('h-full', activeTab === tab.id ? 'block' : 'hidden')}>
            <tab.component />
          </div>
        ))}
      </div>

      {/* Context menu — toggle own tabs */}
      {menuPosition && (
        <BarContextMenu position={menuPosition} onClose={closeMenu} estimatedHeight={120}>
          {BUILTIN_TABS.map(({ id, labelKey }) => (
            <MenuItem
              key={id}
              label={t(labelKey)}
              onClick={() => { toggleTabHidden(id); closeMenu(); }}
              checked={!hiddenTabs.has(id)}
            />
          ))}
          {dynamicTabs.map((tab) => (
            <MenuItem
              key={tab.id}
              label={t(tab.labelKey)}
              onClick={() => { toggleTabHidden(tab.id); closeMenu(); }}
              checked={!hiddenTabs.has(tab.id)}
            />
          ))}
          <MenuSeparator />
          <MenuItem
            label={t('bottomPanel.hide')}
            onClick={() => { toggleVisible(); closeMenu(); }}
          />
        </BarContextMenu>
      )}
    </div>
  );
}
