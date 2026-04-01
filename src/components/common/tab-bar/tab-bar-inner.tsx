'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useTabsStore, useThemeStore, useWorkspaceStore, TAB_GROUP_COLORS, type Tab } from '@/stores';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { IconButtonWithTooltip } from '@/components/ui';
import { useTabDndState } from '@/components/common/tab-dnd-context';
import { TabContextMenu } from '@/components/common/tab-context-menu';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator } from '@/components/common/bar-context-menu';

import { getTabSizeMode } from './get-tab-size-mode';
import { SortableTabItem } from './sortable-tab-item';
import type { TabBarInnerProps } from './types';

export function TabBarInner({ className, editorGroupId, externalDnd }: TabBarInnerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    tabs, activeTabId: globalActiveTabId, closedTabs, groups,
    setActiveTab, removeTab, restoreLastClosedTab,
  } = useTabsStore();

  const density = useThemeStore((s) => s.density);
  const isCompact = density === 'compact';

  const isSplitGroup = editorGroupId === 'split';
  const groupId = editorGroupId ?? 'main';
  const setGroupActiveTab = useEditorGroupsStore((s) => s.setGroupActiveTab);
  const setFocusedGroup = useEditorGroupsStore((s) => s.setFocusedGroup);
  const moveTabToGroup = useEditorGroupsStore((s) => s.moveTabToGroup);

  const splitGroup = useEditorGroupsStore((s) => s.groups.find(g => g.id === 'split'));
  const editorGroup = useEditorGroupsStore((s) => editorGroupId ? s.groups.find(g => g.id === editorGroupId) : null);

  const visibleTabs = useMemo(() => {
    if (!editorGroup) return tabs;
    if (editorGroupId === 'main') {
      const splitTabIds = new Set(splitGroup?.tabIds ?? []);
      return tabs.filter(t => !splitTabIds.has(t.id));
    }
    return editorGroup.tabIds.map(id => tabs.find(t => t.id === id)).filter(Boolean) as Tab[];
  }, [tabs, editorGroup, editorGroupId, splitGroup]);

  const activeTabId = (() => {
    if (!editorGroup) return globalActiveTabId;
    if (editorGroupId === 'main') return editorGroup.activeTabId ?? globalActiveTabId;
    return editorGroup.activeTabId ?? null;
  })();

  const sizeMode = getTabSizeMode(visibleTabs.length);

  // Context menus
  const [contextMenu, setContextMenu] = useState<{ tab: Tab; position: { x: number; y: number } } | null>(null);
  const { menuPosition: barMenuPosition, handleContextMenu: handleBarContextMenu, closeMenu: closeBarMenu } = useBarContextMenuState();

  const getGroupColor = useCallback((tab: Tab): string | undefined => {
    if (!tab.groupId) return undefined;
    const group = groups.find((g) => g.id === tab.groupId);
    if (!group) return undefined;
    const colorDef = TAB_GROUP_COLORS.find((c) => c.id === group.color);
    return colorDef?.value;
  }, [groups]);

  // Restore button
  const [showRestore, setShowRestore] = useState(false);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showRestore) {
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = setTimeout(() => setShowRestore(false), 5000);
      return () => { if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current); };
    }
  }, [showRestore]);

  useEffect(() => {
    if (closedTabs.length === 0) setShowRestore(false);
  }, [closedTabs.length]);

  // Scroll active tab into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector('[data-active="true"]') as HTMLElement | null;
    activeEl?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [activeTabId]);

  // Wheel → horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 0.8, behavior: 'auto' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── Handlers ──
  const isMainGroup = editorGroupId === 'main';

  const handleActivate = useCallback((tab: Tab) => {
    if (isSplitGroup) {
      setGroupActiveTab('split', tab.id);
      setFocusedGroup('split');
    } else {
      setActiveTab(tab.id);
      if (isMainGroup) {
        setGroupActiveTab('main', tab.id);
        setFocusedGroup('main');
      }
      if (location.pathname !== tab.path) navigate(tab.path);
    }
  }, [isSplitGroup, isMainGroup, setActiveTab, setGroupActiveTab, setFocusedGroup, navigate, location.pathname]);

  const handleClose = useCallback((e: ReactMouseEvent<HTMLElement>, tabId: string) => {
    e.stopPropagation();
    if (isSplitGroup) {
      moveTabToGroup(tabId, 'main');
    } else {
      const wasActive = useTabsStore.getState().activeTabId === tabId;
      removeTab(tabId);
      setShowRestore(true);
      if (wasActive) {
        const newActive = useTabsStore.getState().activeTabId;
        const newTab = useTabsStore.getState().tabs.find((t) => t.id === newActive);
        if (newTab) {
          navigate(newTab.path);
          if (isMainGroup) setGroupActiveTab('main', newTab.id);
        } else {
          navigate('/workspace');
          if (isMainGroup) setGroupActiveTab('main', '');
        }
      }
    }
  }, [isSplitGroup, isMainGroup, moveTabToGroup, removeTab, navigate, setGroupActiveTab]);

  const handleRestore = useCallback(() => {
    const restored = restoreLastClosedTab();
    if (restored) navigate(restored.path);
    setShowRestore(true);
  }, [restoreLastClosedTab, navigate]);

  // ── Droppable zone ──
  // When using external DnD, this droppable zone lets the shared DndContext
  // detect which group the tab is being dragged over.
  const { setNodeRef: setDropRef, isOver: isLocalOver } = useDroppable({
    id: `tab-bar-drop-${groupId}`,
    data: { type: 'tab-bar-drop', groupId },
  });

  // Read shared drag state (from TabDndProvider) for the highlight
  const sharedDndState = useTabDndState();
  const isDropTarget = externalDnd
    ? sharedDndState.overGroupId === groupId && sharedDndState.draggedTab != null
    : isLocalOver;

  const tabIds = visibleTabs.map((t) => t.id);

  if (tabs.length === 0) return null;

  return (
    <div
      ref={setDropRef}
      data-tour="tab-bar"
      className={cn(
        'hidden lg:flex items-end',
        isCompact ? 'px-1 pt-0.5' : 'px-1 pt-1',
        'surface-high border-b border-border/30 z-20',
        isDropTarget && 'bg-muted/60',
        className,
      )}
      style={{ fontSize: '16px' }}
      onContextMenu={handleBarContextMenu}
    >
      <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
        <div
          ref={scrollRef}
          className="flex-1 flex items-end gap-1 overflow-x-auto scrollbar-hide"
        >
          {visibleTabs.map((tab) => (
            <SortableTabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              sizeMode={sizeMode}
              isCompact={isCompact}
              groupColor={getGroupColor(tab)}
              groupId={groupId}
              onActivate={() => handleActivate(tab)}
              onClose={(e) => handleClose(e, tab.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ tab, position: { x: e.clientX, y: e.clientY } });
              }}
            />
          ))}
        </div>
      </SortableContext>

      {/* Restore closed tab */}
      <AnimatePresence>
        {showRestore && closedTabs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 flex items-center pb-1 ml-0.5 overflow-hidden"
          >
            <IconButtonWithTooltip
              icon={<RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />}
              tooltip={`${t('tabs.restoreTab')} (${t('shortcuts.keys.restoreTab')})`}
              onClick={handleRestore}
              className="h-6 w-6"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Context Menu */}
      {contextMenu && (
        <TabContextMenu
          tab={contextMenu.tab}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Bar-level context menu */}
      {barMenuPosition && (
        <BarContextMenu position={barMenuPosition} onClose={closeBarMenu} estimatedHeight={120}>
          <MenuItem
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            label={t('tabs.restoreTab')}
            onClick={() => { const r = restoreLastClosedTab(); if (r) navigate(r.path); closeBarMenu(); }}
            disabled={closedTabs.length === 0}
          />
          <MenuSeparator />
          <MenuItem
            label={t('tabs.closeAll')}
            onClick={() => { useTabsStore.getState().closeAllTabs(); closeBarMenu(); }}
            danger
            disabled={tabs.length === 0}
          />
          <MenuSeparator />
          <MenuItem
            label={t('tabs.hideTabBar')}
            onClick={() => { useWorkspaceStore.getState().toggleTabBar(); closeBarMenu(); }}
          />
        </BarContextMenu>
      )}
    </div>
  );
}
