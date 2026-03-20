'use client';

import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Pin } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { getAccentForPath } from '@/lib/accent-colors';
import { useTabsStore, useThemeStore, useWorkspaceStore, TAB_GROUP_COLORS, type Tab } from '@/stores';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { IconButtonWithTooltip } from '@/components/ui';
import { useTabDndState } from './tab-dnd-context';
import { TabContextMenu } from './tab-context-menu';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// TAB BAR - Professional tab system with cross-group drag & drop
//
// When rendered inside a <TabDndProvider> (split mode), the DndContext
// is provided externally → tabs can be dragged across editor groups.
//
// When rendered standalone (no split), an internal DndContext is used
// for within-group reordering.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Tab size mode ──────────────────────────────────────────────────────

type TabSizeMode = 'full' | 'shrunk' | 'mini' | 'icon-only';

function getTabSizeMode(count: number): TabSizeMode {
  if (count <= 6) return 'full';
  if (count <= 10) return 'shrunk';
  if (count <= 15) return 'mini';
  return 'icon-only';
}

// ─── Sortable Tab Item ──────────────────────────────────────────────────

interface SortableTabItemProps {
  tab: Tab;
  isActive: boolean;
  sizeMode: TabSizeMode;
  isCompact: boolean;
  groupColor?: string;
  onActivate: () => void;
  onClose: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  groupId: string;
}

function SortableTabItem({
  tab, isActive, sizeMode, isCompact, groupColor,
  onActivate, onClose, onContextMenu, groupId,
}: SortableTabItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isPinned = tab.pinned ?? false;
  const iconOnly = sizeMode === 'icon-only';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tab.id,
    data: { type: 'tab', id: tab.id, source: groupId } as const,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.15 : undefined,
  };

  const paddingClass = (() => {
    if (iconOnly) return isCompact ? 'px-2 py-0.5' : 'px-2.5 py-1.5';
    if (sizeMode === 'mini') return isCompact ? 'px-1.5 py-0.5' : 'px-2 py-1.5';
    if (sizeMode === 'shrunk') return isCompact ? 'px-2 py-0.5' : 'px-2.5 py-1.5';
    return isCompact ? 'px-2 py-0.5' : 'px-3 py-1.5';
  })();

  const gapClass = (iconOnly || sizeMode === 'mini') ? 'gap-1' : (isCompact ? 'gap-1.5' : 'gap-2');
  const textSizeClass = isCompact || sizeMode !== 'full' ? 'text-xs' : 'text-sm';

  const maxTitleWidth = (() => {
    if (iconOnly) return undefined;
    if (sizeMode === 'mini') return isCompact ? 32 : 40;
    if (sizeMode === 'shrunk') return isCompact ? 56 : 72;
    return isCompact ? 100 : 120;
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-active={isActive ? 'true' : undefined}
      title={iconOnly ? tab.title : undefined}
      className={cn(
        'relative flex items-center rounded-t-lg cursor-pointer',
        'transition-all duration-150 select-none border-b-0 shrink-0',
        gapClass, paddingClass, textSizeClass,
        isActive
          ? 'text-white shadow-sm'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',

      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActivate}
      onContextMenu={onContextMenu}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          if (!isPinned) onClose(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Active background */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-t-lg"
          style={{ backgroundColor: getAccentForPath(tab.path) }}
        />
      )}

      {/* Group color stripe */}
      {groupColor && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg z-10"
          style={{ backgroundColor: groupColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-inherit">
        {isPinned && iconOnly ? (
          <Pin className={cn('shrink-0', isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
        ) : (
          getIconComponent(tab.icon, isCompact ? 'h-3 w-3 shrink-0' : 'h-4 w-4 shrink-0')
        )}

        {!iconOnly && (
          <span className="truncate" style={{ maxWidth: maxTitleWidth }}>
            {tab.title}
          </span>
        )}

        {isPinned && !iconOnly && (
          <Pin className={cn('shrink-0 text-muted-foreground/60', isCompact ? 'h-2 w-2' : 'h-2.5 w-2.5')} />
        )}

        {/* Close button */}
        <AnimatePresence>
          {!isPinned && (isHovered || isActive) && !iconOnly && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              onClick={onClose}
              className={cn(
                'p-0.5 rounded transition-colors shrink-0',
                isActive
                  ? 'text-white/60 hover:text-white hover:bg-white/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <X className={isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
            </motion.button>
          )}
          {!isPinned && (isHovered || isActive) && iconOnly && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              onClick={onClose}
              className={cn(
                'p-0.5 rounded transition-colors shrink-0 absolute -top-1 -right-1',
                isActive ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              <X className="h-2 w-2" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab Drag Overlay (for standalone mode only) ────────────────────────

function TabDragOverlay({ tab }: { tab: Tab }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-foreground bg-popover border border-border shadow-lg">
      {getIconComponent(tab.icon, 'h-3.5 w-3.5 shrink-0 text-muted-foreground')}
      <span className="truncate max-w-[120px] font-medium">{tab.title}</span>
    </div>
  );
}

// ─── Inner TabBar content (shared between standalone & provider modes) ──

interface TabBarInnerProps {
  className?: string;
  editorGroupId?: string;
  /** When true, a parent TabDndProvider supplies the DndContext */
  externalDnd?: boolean;
}

function TabBarInner({ className, editorGroupId, externalDnd }: TabBarInnerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = React.useRef<HTMLDivElement>(null);

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

  const visibleTabs = React.useMemo(() => {
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
  const [contextMenu, setContextMenu] = React.useState<{ tab: Tab; position: { x: number; y: number } } | null>(null);
  const { menuPosition: barMenuPosition, handleContextMenu: handleBarContextMenu, closeMenu: closeBarMenu } = useBarContextMenuState();

  const getGroupColor = React.useCallback((tab: Tab): string | undefined => {
    if (!tab.groupId) return undefined;
    const group = groups.find((g) => g.id === tab.groupId);
    if (!group) return undefined;
    const colorDef = TAB_GROUP_COLORS.find((c) => c.id === group.color);
    return colorDef?.value;
  }, [groups]);

  // Restore button
  const [showRestore, setShowRestore] = React.useState(false);
  const restoreTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (showRestore) {
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = setTimeout(() => setShowRestore(false), 5000);
      return () => { if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current); };
    }
  }, [showRestore]);

  React.useEffect(() => {
    if (closedTabs.length === 0) setShowRestore(false);
  }, [closedTabs.length]);

  // Scroll active tab into view
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector('[data-active="true"]') as HTMLElement | null;
    activeEl?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [activeTabId]);

  // Wheel → horizontal scroll
  React.useEffect(() => {
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

  const handleActivate = React.useCallback((tab: Tab) => {
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

  const handleClose = React.useCallback((e: React.MouseEvent, tabId: string) => {
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

  const handleRestore = React.useCallback(() => {
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
      className={cn(
        'hidden lg:flex items-end',
        isCompact ? 'px-1 pt-0.5' : 'px-1 pt-1',
        'bg-card border-b border-border z-20',
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

// ─── Public TabBar ──────────────────────────────────────────────────────
//
// When a parent <TabDndProvider> is present (split mode), just renders
// the inner content — DndContext is already provided.
//
// When standalone (no split), wraps in its own DndContext for reorder.
// ─────────────────────────────────────────────────────────────────────────

interface TabBarProps {
  className?: string;
  editorGroupId?: string;
  /** When true, an ancestor TabDndProvider supplies the DndContext */
  externalDnd?: boolean;
}

export function TabBar({ className, editorGroupId, externalDnd }: TabBarProps) {
  // When using external DnD, just render the inner content directly
  if (externalDnd) {
    return <TabBarInner className={className} editorGroupId={editorGroupId} externalDnd />;
  }

  // Standalone mode — provide our own DndContext
  return <StandaloneTabBar className={className} editorGroupId={editorGroupId} />;
}

function StandaloneTabBar({ className, editorGroupId }: { className?: string; editorGroupId?: string }) {
  const tabs = useTabsStore((s) => s.tabs);
  const reorderTabs = useTabsStore((s) => s.reorderTabs);

  const [draggedTab, setDraggedTab] = React.useState<Tab | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const tab = tabs.find((t) => t.id === event.active.id);
    if (tab) setDraggedTab(tab);
  }, [tabs]);

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
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
