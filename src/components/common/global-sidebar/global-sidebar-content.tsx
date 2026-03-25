'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Plus,
  Rows2,
  PanelTop,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useWorkspaceStore } from '@/stores';
import { useActivityBarStore } from '@/stores/activity-bar-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useModuleFiltersStore, DEFAULT_GROUP_ID, SPLIT_GROUP_ID } from '@/stores/module-filters-store';
import { SidebarStack, StackLayoutToggle, type StackPanelMeta } from '@/components/common/sidebar-stack';
import { useSidebarStackStore } from '@/stores/sidebar-stack-store';
import { useDensity } from '@/hooks';
import { getPanelTitleKey, usePanelRenderer } from '@/components/common/app-panel-bridge';

// ─── Global Sidebar ─────────────────────────────────────────────────────

interface GlobalSidebarProps {
  className?: string;
}

/**
 * Content-only version of the sidebar — no wrapping motion/size container.
 * Used by AppShell with react-resizable-panels for sizing.
 *
 * Supports multi-panel stacking: when the sidebar-stack-store has 2+ panels
 * for the 'left' side, renders them via SidebarStack (tabs or stacked).
 * Single panel: renders directly with animation (legacy behavior preserved).
 */
export function GlobalSidebarContent({ className }: GlobalSidebarProps) {
  const { t } = useTranslation();
  const setActivePanel = useActivityBarStore((s) => s.setActivePanel);
  const activityPanelZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activePanel = activityPanelZone.isOpen ? activityPanelZone.activeTab : null;
  const d = useDensity();
  const sidebarFilterLayout = useWorkspaceStore((s) => s.sidebarFilterLayout);
  const toggleSidebarFilterLayout = useWorkspaceStore((s) => s.toggleSidebarFilterLayout);

  // Sidebar stack state
  const leftStack = useSidebarStackStore((s) => s.stacks.left);
  const isMultiPanel = leftStack.length > 1;

  // Sync: on mount only, if activePanel is set but the stack is empty (fresh load from
  // persisted activity-bar-store while sidebar-stack-store was cleared), seed the stack.
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && activePanel && leftStack.length === 0) {
      useSidebarStackStore.getState().setStack('left', [activePanel]);
    }
    hasInitialized.current = true;
  }, [activePanel, leftStack.length]);

  // Sync: if the user closes all panels from the stack (via X buttons), close the sidebar
  useEffect(() => {
    if (hasInitialized.current && leftStack.length === 0 && activePanel) {
      setActivePanel(null);
    }
  }, [leftStack.length, activePanel, setActivePanel]);

  // Show the layout toggle button only when tools panel is active and both groups are registered
  const registrations = useModuleFiltersStore((s) => s.registrations);
  const hiddenGroups = useModuleFiltersStore((s) => s.hiddenGroups);
  const bothGroupsVisible =
    activePanel === 'tools' &&
    !!registrations[DEFAULT_GROUP_ID] && !hiddenGroups.has(DEFAULT_GROUP_ID) &&
    !!registrations[SPLIT_GROUP_ID] && !hiddenGroups.has(SPLIT_GROUP_ID);

  // Build panel metadata for the stack
  const stackPanels: StackPanelMeta[] = useMemo(
    () =>
      leftStack
        .map((id) => ({
          id,
          label: t(getPanelTitleKey(id)),
        })),
    [leftStack, t],
  );

  // Render a single panel by id (registry-driven)
  const renderPanel = usePanelRenderer();

  // Title: in multi-panel mode, show the active tab's title; otherwise the single panel
  const headerTitle = isMultiPanel
    ? t('workspace.panels', 'Panneaux')
    : activePanel ? t(getPanelTitleKey(activePanel)) : '';

  // Available panels to add (not already in the stack), max 2 total
  const activityPanelIds = usePanelRegistryStore((s) => {
    return Object.values(s.panels)
      .filter((p) => p.zone === 'activity-panel')
      .map((p) => p.id);
  });
  const availablePanels = useMemo(() => {
    return activityPanelIds.filter((id) => !leftStack.includes(id));
  }, [activityPanelIds, leftStack]);

  const canAddPanel = leftStack.length < 2 && availablePanels.length > 0;

  // Dropdown state for the "+" button
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!addMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [addMenuOpen]);

  const handleAddPanel = useCallback((panelId: string) => {
    useActivityBarStore.getState().stackPanel(panelId);
    setAddMenuOpen(false);
  }, []);

  // Don't render if no panel is active (after all hooks)
  if (!activePanel) return null;

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'bg-card border-r border-border',
        'overflow-hidden',
        className
      )}
    >
      {/* Panel header */}
      <div className={cn(
        'flex items-center px-3 border-b border-border/50 justify-between',
        d.density === 'compact' ? 'h-8' : 'h-10'
      )}>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {headerTitle}
        </span>
        <div className="flex items-center gap-0.5">
          {/* "+" button to add a second panel */}
          {canAddPanel && (
            <div className="relative" ref={addMenuRef}>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setAddMenuOpen((o) => !o)}
                    className={cn(
                      'p-1 rounded-lg transition-colors',
                      'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                      addMenuOpen && 'bg-muted/50 text-foreground'
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('workspace.addPanel', 'Ajouter un panneau')}</TooltipContent>
              </Tooltip>
              {addMenuOpen && (
                <div
                  className={cn(
                    'absolute right-0 top-full mt-1 z-50',
                    'min-w-[160px] rounded-lg border border-border/50',
                    'bg-popover/95 backdrop-blur-xl shadow-xl',
                    'py-1 animate-in fade-in-0 zoom-in-95'
                  )}
                >
                  {availablePanels.map((panelId) => (
                    <button
                      key={panelId}
                      onClick={() => handleAddPanel(panelId)}
                      className={cn(
                        'w-full text-left px-3 py-1.5',
                        'text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50',
                        'transition-colors cursor-pointer'
                      )}
                    >
                      {t(getPanelTitleKey(panelId))}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Stack layout toggle — when multi-panel */}
          {isMultiPanel && (
            <StackLayoutToggle side="left" />
          )}
          {/* Legacy layout toggle for tools with 2 split groups */}
          {!isMultiPanel && bothGroupsVisible && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebarFilterLayout}
                  className={cn(
                    'p-1 rounded-lg transition-colors',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {sidebarFilterLayout === 'tabs'
                    ? <Rows2 className="h-3.5 w-3.5" />
                    : <PanelTop className="h-3.5 w-3.5" />
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {sidebarFilterLayout === 'tabs'
                  ? t('workspace.sidebarLayoutStacked', 'Vue empilée')
                  : t('workspace.sidebarLayoutTabs', 'Vue onglets')
                }
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActivePanel(null)}
                className={cn(
                  'p-1 rounded-lg',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  'transition-colors'
                )}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('workspace.collapse')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Panel content */}
      {isMultiPanel ? (
        // Multi-panel: use the generic SidebarStack
        <div className="flex-1 flex flex-col overflow-hidden">
          <SidebarStack
            side="left"
            panels={stackPanels}
            renderPanel={renderPanel}
            panelGroupId="global-sidebar-stack"
            onTabChange={(panelId) => setActivePanel(panelId)}
          />
        </div>
      ) : (
        // Single panel: animated switch (legacy behavior)
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {renderPanel(activePanel)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * Legacy wrapper with framer-motion animation — kept for backwards compat.
 * New code should use GlobalSidebarContent inside a ResizablePanel.
 */
export function GlobalSidebar({ className }: GlobalSidebarProps) {
  const activityPanelZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activePanel = activityPanelZone.isOpen ? activityPanelZone.activeTab : null;

  // Don't render if no panel is active
  if (!activePanel) return null;

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 240, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'hidden lg:flex flex-col flex-shrink-0 z-30',
        'overflow-hidden',
        className
      )}
    >
      <GlobalSidebarContent />
    </motion.aside>
  );
}
