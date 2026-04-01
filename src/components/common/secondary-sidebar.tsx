'use client';

import { useCallback, useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Rows2, PanelTop, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useDensity } from '@/hooks';
import { useModuleDetailStore, DEFAULT_GROUP_ID, SPLIT_GROUP_ID } from '@/stores/module-detail-store';
import { useWorkspaceStore } from '@/stores';
import { SidebarPortalZone } from '@/components/common/sidebar-portal-zone';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

// ═══════════════════════════════════════════════════════════════════════════
// SECONDARY SIDEBAR - Panneau droit pour le détail d’un item
// Style VS Code “Secondary Side Bar”
// Desktop only — les modules utilisent createPortal pour y rendre leur contenu
//
// Même structure que GlobalSidebarContent :
// ┌─ Header (titre + bouton close) ────────────────────────────────────┐
// │ Portal zones (1 en mode normal, 2 résizables ou onglets en split)  │
// └─────────────────────────────────────────────────────────────────═
// ═══════════════════════════════════════════════════════════════════════════

const SECONDARY_SIDEBAR_WIDTH = 420;

interface SecondarySidebarProps {
  className?: string;
}

/**
 * Content-only version — no wrapping motion/size container.
 * Used by AppShell with react-resizable-panels for sizing.
 *
 * In split mode: renders stacked (resizable) or tabbed based on sidebarFilterLayout.
 * In normal mode: renders a single portal zone for the active group.
 */
export function SecondarySidebarContent({ className }: SecondarySidebarProps) {
  const { t } = useTranslation();
  const d = useDensity();
  const setOpen = useModuleDetailStore((s) => s.setOpen);
  const registrations = useModuleDetailStore((s) => s.registrations);
  const sidebarDetailLayout = useWorkspaceStore((s) => s.sidebarDetailLayout);
  const toggleSidebarDetailLayout = useWorkspaceStore((s) => s.toggleSidebarDetailLayout);

  const mainReg = registrations[DEFAULT_GROUP_ID];
  const splitReg = registrations[SPLIT_GROUP_ID];
  const mainIsOpen = !!mainReg?.isOpen;
  const splitIsOpen = !!splitReg?.isOpen;
  const bothOpen = mainIsOpen && splitIsOpen;

  // Active tab: defaults to main, follows availability
  const [activeTab, setActiveTab] = useState<typeof DEFAULT_GROUP_ID | typeof SPLIT_GROUP_ID>(DEFAULT_GROUP_ID);
  useEffect(() => {
    if (!mainIsOpen && splitIsOpen) setActiveTab(SPLIT_GROUP_ID);
    if (mainIsOpen && !splitIsOpen) setActiveTab(DEFAULT_GROUP_ID);
  }, [mainIsOpen, splitIsOpen]);

  // Close all open detail panels
  const handleClose = useCallback(() => {
    Object.entries(registrations).forEach(([groupId, reg]) => {
      if (reg?.isOpen) setOpen(reg.moduleKey, false, groupId);
    });
  }, [registrations, setOpen]);

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'bg-card border-l border-border',
        'overflow-hidden',
        className,
      )}
    >
      {/* Panel header */}
      <div className={cn(
        'flex items-center px-3 border-b border-border/50 justify-between shrink-0',
        d.density === 'compact' ? 'h-8' : 'h-10'
      )}>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t('common.detail')}
        </span>
        <div className="flex items-center gap-0.5">
          {/* Layout toggle: only when both detail panels are open */}
          {bothOpen && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebarDetailLayout}
                  className={cn(
                    'p-1 rounded-lg transition-colors',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {sidebarDetailLayout === 'tabs'
                    ? <Rows2 className="h-3.5 w-3.5" />
                    : <PanelTop className="h-3.5 w-3.5" />
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {sidebarDetailLayout === 'tabs'
                  ? t('workspace.sidebarLayoutStacked', 'Vue empilée')
                  : t('workspace.sidebarLayoutTabs', 'Vue onglets')
                }
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={handleClose}
                className={cn(
                  'p-1 rounded-lg',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  'transition-colors'
                )}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('workspace.collapse')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Portal zones */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!bothOpen ? (
          // Single group
          mainIsOpen
            ? <DetailZoneConnected groupId={DEFAULT_GROUP_ID} />
            : splitIsOpen
              ? <DetailZoneConnected groupId={SPLIT_GROUP_ID} />
              : null
        ) : sidebarDetailLayout === 'tabs' ? (
          // Tabs mode — module-header style tabs side by side
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex shrink-0 border-b border-border/30">
              {([DEFAULT_GROUP_ID, SPLIT_GROUP_ID] as const).map((id) => {
                const reg = registrations[id];
                const isActive = activeTab === id;
                const handleCloseTab = () => {
                  if (reg?.moduleKey) setOpen(reg.moduleKey, false, id);
                };
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 transition-colors cursor-pointer',
                      'border-r last:border-r-0 border-border/30',
                      isActive ? 'bg-muted/30' : 'bg-muted/10 hover:bg-muted/20'
                    )}
                    style={isActive ? { borderBottom: `2px solid ${reg?.accentColor}` } : { borderBottom: '2px solid transparent' }}
                  >
                    <span className={cn(
                      'flex-1 min-w-0 text-[10px] font-medium uppercase tracking-wider truncate',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {reg?.moduleTitle ?? id}
                    </span>
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); handleCloseTab(); }}
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex-1 overflow-hidden">
              <DetailZoneConnected groupId={activeTab} hideModuleHeader tabsMode />
            </div>
          </div>
        ) : (
          // Stacked mode
          <ResizablePanelGroup orientation="vertical" id="secondary-detail-split">
            <ResizablePanel id="secondary-detail-main" defaultSize="50" minSize="20">
              <DetailZoneConnected groupId={DEFAULT_GROUP_ID} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="secondary-detail-split-panel" defaultSize="50" minSize="20">
              <DetailZoneConnected groupId={SPLIT_GROUP_ID} />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}

/**
 * Thin connector: reads the registration from the detail store
 * and passes it to the generic SidebarPortalZone.
 */
function DetailZoneConnected({ groupId, hideModuleHeader = false, tabsMode = false }: { groupId: string; hideModuleHeader?: boolean; tabsMode?: boolean }) {
  const registration = useModuleDetailStore((s) => s.registrations[groupId] ?? null);
  const setPortalTarget = useModuleDetailStore((s) => s.setPortalTarget);
  const setOpen = useModuleDetailStore((s) => s.setOpen);

  const handleClose = useCallback(() => {
    if (registration?.moduleKey) {
      setOpen(registration.moduleKey, false, groupId);
    }
  }, [registration, setOpen, groupId]);

  return (
    <SidebarPortalZone
      groupId={groupId}
      registration={registration}
      setPortalTarget={setPortalTarget}
      onClose={registration && !tabsMode ? handleClose : undefined}
      hideModuleHeader={hideModuleHeader}
      portalClassName="flex flex-col"
    />
  );
}

/**
 * Legacy wrapper with framer-motion animation — kept for backwards compat.
 * New code should use SecondarySidebarContent inside a ResizablePanel.
 */
export function SecondarySidebar({ className }: SecondarySidebarProps) {
  const isAnyOpen = useModuleDetailStore((s) => s.isAnyOpen());

  return (
    <AnimatePresence>
      {isAnyOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: SECONDARY_SIDEBAR_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={cn(
            'hidden lg:flex flex-col flex-shrink-0 z-30',
            'overflow-hidden',
            className,
          )}
        >
          <SecondarySidebarContent />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

