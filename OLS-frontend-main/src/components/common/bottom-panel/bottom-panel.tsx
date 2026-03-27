'use client';

import { useCallback, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useDensity } from '@/hooks';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator } from '@/components/common/bar-context-menu';
import { BUILTIN_TABS } from './constants';
import { ActivityLogPanel } from './activity-log-panel';

interface BottomPanelProps {
  className?: string;
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
  const legacyVisibleDynamic = useMemo(
    () => dynamicTabs.filter((tab) => !legacyHiddenTabs.has(tab.id)),
    [dynamicTabs, legacyHiddenTabs],
  );
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelHeight = useBottomPanelStore((s) => s.panelHeight);
  const setPanelHeight = useBottomPanelStore((s) => s.setPanelHeight);
  const { menuPosition: legacyMenuPos, handleContextMenu: handleLegacyCtx, closeMenu: closeLegacyMenu } = useBarContextMenuState();

  // Resize handler
  const handleResizeStart = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
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
                  style={isActive ? { borderBottomColor: 'color-mix(in srgb, var(--color-foreground) 25%, transparent)' } : undefined}
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
                      style={isActive ? { borderBottomColor: tab.accentColor ?? 'color-mix(in srgb, var(--color-foreground) 25%, transparent)' } : undefined}
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
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setPanelHeight(panelHeight > 250 ? 150 : 300)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {panelHeight > 250 ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{panelHeight > 250 ? t('bottomPanel.minimize') : t('bottomPanel.maximize')}</TooltipContent>
            </Tooltip>

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
