'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Activity,
  ChevronUp,
  ChevronDown,
  Navigation,
  MousePointer,
  Database,
  Settings,
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
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useBottomPanelStore, type BottomPanelTab, type ActivityLogEntry, type BottomPanelAlignment, type DynamicBottomTab } from '@/stores/bottom-panel-store';
import { useDensity } from '@/hooks';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM PANEL - Panneau inférieur avec onglets (Activity Log + dynamic)
// Style VS Code Terminal/Output panel
// Desktop only - Redimensionnable, toggleable
//
// Supports dynamic module tabs registered via bottom-panel-store.
// Modules register tabs on mount and unregister on unmount.
// ═══════════════════════════════════════════════════════════════════════════

/** Built-in tabs that are always present */
const BUILTIN_TABS: { id: BottomPanelTab; icon: typeof Activity; labelKey: string }[] = [
  { id: 'activity', icon: Activity, labelKey: 'bottomPanel.activity' },
];

const ENTRY_TYPE_ICON: Record<ActivityLogEntry['type'], typeof Navigation> = {
  navigation: Navigation,
  action: MousePointer,
  data: Database,
  system: Settings,
};

const ENTRY_TYPE_COLOR: Record<ActivityLogEntry['type'], string> = {
  navigation: 'text-blue-400',
  action: 'text-emerald-400',
  data: 'text-amber-400',
  system: 'text-muted-foreground',
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function ActivityLogPanel() {
  const { t } = useTranslation();
  const activityLog = useBottomPanelStore((s) => s.activityLog);
  const clearLog = useBottomPanelStore((s) => s.clearLog);
  const listRef = React.useRef<HTMLDivElement>(null);

  if (activityLog.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60">
        {t('bottomPanel.noActivity')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with clear button */}
      <div className="flex items-center justify-end px-3 py-1 border-b border-border/20">
        <button
          onClick={clearLog}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          title={t('bottomPanel.clearLog')}
        >
          <Trash2 className="h-3 w-3" />
          {t('bottomPanel.clearLog')}
        </button>
      </div>

      {/* Log entries */}
      <div ref={listRef} className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
        {activityLog.map((entry) => {
          const TypeIcon = ENTRY_TYPE_ICON[entry.type] ?? Settings;
          const typeColor = ENTRY_TYPE_COLOR[entry.type] ?? 'text-muted-foreground';
          return (
            <div
              key={entry.id}
              className="flex items-start gap-2 px-3 py-0.5 hover:bg-muted/30 transition-colors"
            >
              <span className="text-muted-foreground/60 shrink-0 tabular-nums w-16">
                {formatTimestamp(entry.timestamp)}
              </span>
              <TypeIcon className={cn('h-3 w-3 mt-0.5 shrink-0', typeColor)} />
              <span className="text-foreground/90 flex-1 break-words">
                {entry.message}
                {entry.detail && (
                  <span className="text-muted-foreground/60 ml-1">{entry.detail}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface BottomPanelProps {
  className?: string;
}

// ─── Sortable Dynamic Tab ───────────────────────────────────────────────

function SortableDynamicTab({
  tab,
  isActive,
  isCompact,
  onClick,
}: {
  tab: DynamicBottomTab;
  isActive: boolean;
  isCompact: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.15 : undefined,
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 text-xs font-medium transition-colors select-none',
        isCompact ? 'py-1' : 'py-1.5',
        isActive
          ? 'text-foreground border-b-2'
          : 'text-muted-foreground hover:text-foreground pb-[2px]',
      )}
      style={isActive ? { ...style, borderBottomColor: tab.accentColor ?? 'hsl(var(--primary))' } : style}
    >
      {getIconComponent(tab.icon, 'h-3.5 w-3.5')}
      {t(tab.labelKey)}
    </button>
  );
}

function DynamicTabDragOverlay({ tab }: { tab: DynamicBottomTab }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-popover border border-border shadow-lg rounded-md">
      {getIconComponent(tab.icon, 'h-3.5 w-3.5 text-muted-foreground')}
      {t(tab.labelKey)}
    </div>
  );
}

/**
 * Content-only version — no wrapping motion/size/resize container.
 * Used by AppShell with react-resizable-panels for sizing.
 */
export function BottomPanelContent({ className }: BottomPanelProps) {
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
  const [draggedDynamicTab, setDraggedDynamicTab] = React.useState<DynamicBottomTab | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const tab = visibleDynamicTabs.find((t) => t.id === event.active.id);
    if (tab) setDraggedDynamicTab(tab);
  }, [visibleDynamicTabs]);

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
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
    <div className={cn('flex flex-col h-full bg-card border-t border-border overflow-hidden', className)}>
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
              style={isActive ? { borderBottomColor: 'hsl(var(--primary))' } : undefined}
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
            <button
              key={opt.value}
              onClick={() => setAlignment(opt.value)}
              className={cn(
                'p-1 rounded-sm transition-colors',
                alignment === opt.value
                  ? 'text-foreground bg-muted/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={opt.title}
            >
              {opt.icon}
            </button>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={toggleVisible}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title={t('bottomPanel.close')}
        >
          <X className="h-3.5 w-3.5" />
        </button>
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

/**
 * Legacy wrapper with framer-motion + manual mouse resize — kept for backwards compat.
 * New code should use BottomPanelContent inside a ResizablePanel.
 */
export function BottomPanel({ className }: BottomPanelProps) {
  const { t } = useTranslation();
  const d = useDensity();
  const { visible, activeTab, setActiveTab, toggleVisible, dynamicTabs } = useBottomPanelStore();
  const legacyHiddenTabs = useBottomPanelStore((s) => s.hiddenTabs);
  const legacyToggleTabHidden = useBottomPanelStore((s) => s.toggleTabHidden);
  const legacyVisibleDynamic = React.useMemo(
    () => dynamicTabs.filter((tab) => !legacyHiddenTabs.has(tab.id)),
    [dynamicTabs, legacyHiddenTabs],
  );
  const [isResizing, setIsResizing] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelHeight = useBottomPanelStore((s) => s.panelHeight);
  const setPanelHeight = useBottomPanelStore((s) => s.setPanelHeight);
  const { menuPosition: legacyMenuPos, handleContextMenu: handleLegacyCtx, closeMenu: closeLegacyMenu } = useBarContextMenuState();

  // Resize handler
  const handleResizeStart = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = panelHeight;

    const onMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      setPanelHeight(startHeight + delta);
    };

    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [panelHeight, setPanelHeight]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={panelRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: panelHeight, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'hidden lg:flex flex-col flex-shrink-0 overflow-hidden',
            'bg-card border-t border-border',
            isResizing && 'select-none',
            className,
          )}
        >
          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            className={cn(
              'h-1 cursor-row-resize hover:bg-primary/30 transition-colors shrink-0',
              isResizing && 'bg-primary/40',
            )}
          />

          {/* Tab bar */}
          <div className="flex items-center gap-0 px-2 border-b border-border/40 shrink-0" onContextMenu={handleLegacyCtx}>
            {BUILTIN_TABS.filter(({ id }) => !legacyHiddenTabs.has(id)).map(({ id, icon: TabIcon, labelKey }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 text-xs font-medium transition-colors',
                    d.density === 'compact' ? 'py-1' : 'py-1.5',
                    isActive
                      ? 'text-foreground border-b-2'
                      : 'text-muted-foreground hover:text-foreground pb-[2px]',
                  )}
                  style={isActive ? { borderBottomColor: 'hsl(var(--primary))' } : undefined}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {t(labelKey)}
                </button>
              );
            })}

            {/* Dynamic module tabs */}
            {legacyVisibleDynamic.length > 0 && (
              <>
                <div className="w-px h-4 bg-border/40 mx-1 shrink-0" />
                {legacyVisibleDynamic.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 text-xs font-medium transition-colors',
                        d.density === 'compact' ? 'py-1' : 'py-1.5',
                        isActive
                          ? 'text-foreground border-b-2'
                          : 'text-muted-foreground hover:text-foreground pb-[2px]',
                      )}
                      style={isActive ? { borderBottomColor: tab.accentColor ?? 'hsl(var(--primary))' } : undefined}
                    >
                      {getIconComponent(tab.icon, 'h-3.5 w-3.5')}
                      {t(tab.labelKey)}
                    </button>
                  );
                })}
              </>
            )}

            <div className="flex-1" />

            {/* Size toggle */}
            <button
              onClick={() => setPanelHeight(panelHeight > 250 ? 150 : 300)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title={panelHeight > 250 ? t('bottomPanel.minimize') : t('bottomPanel.maximize')}
            >
              {panelHeight > 250 ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={toggleVisible}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title={t('bottomPanel.close')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'activity' && <ActivityLogPanel />}
            {dynamicTabs.map((tab) => (
              <div key={tab.id} className={cn('h-full', activeTab === tab.id ? 'block' : 'hidden')}>
                <tab.component />
              </div>
            ))}
          </div>

          {/* Context menu — toggle own tabs */}
          {legacyMenuPos && (
            <BarContextMenu position={legacyMenuPos} onClose={closeLegacyMenu}>
              {BUILTIN_TABS.map(({ id, labelKey }) => (
                <MenuItem
                  key={id}
                  label={t(labelKey)}
                  onClick={() => { legacyToggleTabHidden(id); closeLegacyMenu(); }}
                  checked={!legacyHiddenTabs.has(id)}
                />
              ))}
              {dynamicTabs.length > 0 && dynamicTabs.map((tab) => (
                <MenuItem
                  key={tab.id}
                  label={t(tab.labelKey)}
                  onClick={() => { legacyToggleTabHidden(tab.id); closeLegacyMenu(); }}
                  checked={!legacyHiddenTabs.has(tab.id)}
                />
              ))}
              <MenuSeparator />
              <MenuItem
                label={t('bottomPanel.hide')}
                onClick={() => { toggleVisible(); closeLegacyMenu(); }}
              />
            </BarContextMenu>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
