'use client';

import { useCallback, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Pin,
  PinOff,
  Clock,
  Search,
  X,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useWorkspaceStore, useCommandPaletteStore, useTabsStore, type Tab } from '@/stores';
import { useDensity } from '@/hooks';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { getAccentForPath } from '@/lib/accent-colors';
import { registry } from '@/lib/module-registry';
import { CollapsibleSection } from './collapsible-section';

// ─── Explorer Panel (pinned + recents + open tabs) ─────────────────────

export function ExplorerPanel() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const d = useDensity();
  const density = d.density;
  const {
    recentModules,
    pinnedModules,
    togglePin,
    removeRecent,
    isPinned,
  } = useWorkspaceStore();
  const { tabs, activeTabId, setActiveTab, removeTab, togglePinTab } = useTabsStore();
  const { open: openCommandPalette } = useCommandPaletteStore();

  // Collapsible section state
  const [openTabsOpen, setOpenTabsOpen] = useState(true);
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

  const getModuleInfo = useCallback((path: string): { title?: string; icon?: string } | undefined => {
    const mod = registry.getByRoute(path);
    if (!mod) return undefined;
    return { title: t(mod.translationKey), icon: mod.icon };
  }, [t]);

  const pinnedItems = useMemo(() => {
    return pinnedModules.map((path) => {
      const moduleInfo = getModuleInfo(path);
      const recentInfo = recentModules.find((r) => r.path === path);
      return {
        path,
        title: moduleInfo?.title || recentInfo?.title || path,
        icon: moduleInfo?.icon || recentInfo?.icon || 'file',
      };
    });
  }, [pinnedModules, getModuleInfo, recentModules]);

  const recentItems = useMemo(() => {
    return recentModules.filter((r) => !pinnedModules.includes(r.path) && r.type !== 'action');
  }, [recentModules, pinnedModules]);

  const handleTabClick = useCallback((tab: Tab) => {
    setActiveTab(tab.id);
    if (location.pathname !== tab.path) {
      navigate(tab.path);
    }
  }, [setActiveTab, navigate, location.pathname]);

  const handleCloseTab = useCallback((e: ReactMouseEvent<HTMLSpanElement>, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const wasActive = activeTabId === tabId;
    removeTab(tabId);
    if (wasActive) {
      const newActive = useTabsStore.getState().activeTabId;
      const newTab = useTabsStore.getState().tabs.find((t) => t.id === newActive);
      if (newTab) {
        navigate(newTab.path);
      }
    }
  }, [activeTabId, removeTab, navigate]);

  // Compact row shared by all 3 sections
  const compactPy = density === 'compact' ? 'py-0.5' : 'py-1';

  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 pt-2">
        {/* Open Tabs Section */}
        {tabs.length > 0 && (
          <CollapsibleSection
            icon={<Layers className="h-3 w-3" />}
            label={t('workspace.openTabs')}
            count={tabs.length}
            isOpen={openTabsOpen}
            onToggle={() => setOpenTabsOpen(!openTabsOpen)}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const isPinnedTab = tab.pinned ?? false;
              const accentColor = getAccentForPath(tab.path);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg w-full text-left',
                    'text-xs transition-all duration-150',
                    'px-2', compactPy,
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <div
                    className={cn('w-1.5 h-1.5 rounded-full shrink-0', !isActive && 'opacity-0', isActive && !accentColor && 'bg-foreground/40')}
                    style={isActive && accentColor ? { backgroundColor: accentColor } : undefined}
                  />
                  {getIconComponent(tab.icon, 'h-4 w-4 shrink-0')}
                  <span className="flex-1 truncate">{tab.title}</span>
                  {/* Pin indicator for pinned tabs (always visible) */}
                  {isPinnedTab && (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <span
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePinTab(tab.id); }}
                          className="p-0.5 rounded text-primary hover:bg-muted/80 transition-all"
                        >
                          <Pin className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right">{t('tabs.unpin')}</TooltipContent>
                    </Tooltip>
                  )}
                  {/* Pin / Close on hover */}
                  <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    {!isPinnedTab && (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <span
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePinTab(tab.id); }}
                            className="p-0.5 rounded hover:bg-muted/80"
                          >
                            <Pin className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right">{t('tabs.pin')}</TooltipContent>
                      </Tooltip>
                    )}
                    {!isPinnedTab && (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <span
                            onClick={(e) => handleCloseTab(e, tab.id)}
                            className="p-0.5 rounded hover:bg-muted/80"
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right">{t('tabs.closeTab')}</TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </button>
              );
            })}
          </CollapsibleSection>
        )}

        {/* Pinned Section */}
        {pinnedItems.length > 0 && (
          <CollapsibleSection
            icon={<Pin className="h-3 w-3" />}
            label={t('workspace.pinned')}
            count={pinnedItems.length}
            isOpen={pinnedOpen}
            onToggle={() => setPinnedOpen(!pinnedOpen)}
          >
            {pinnedItems.map((item) => {
              const isActive = location.pathname === item.path;
              const accentColor = getAccentForPath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg w-full',
                    'text-xs transition-all duration-150',
                    'px-2', compactPy,
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <div
                    className={cn('w-1.5 h-1.5 rounded-full shrink-0', !isActive && 'opacity-0', isActive && !accentColor && 'bg-foreground/40')}
                    style={isActive && accentColor ? { backgroundColor: accentColor } : undefined}
                  />
                  {getIconComponent(item.icon, 'h-4 w-4 shrink-0')}
                  <span className="flex-1 truncate">{item.title}</span>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(item.path); }}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted/80 transition-all text-primary"
                      >
                        <PinOff className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">{t('workspace.unpin')}</TooltipContent>
                  </Tooltip>
                </Link>
              );
            })}
          </CollapsibleSection>
        )}

        {/* Recent Section */}
        {recentItems.length > 0 && (
          <CollapsibleSection
            icon={<Clock className="h-3 w-3" />}
            label={t('workspace.recent')}
            count={recentItems.length}
            isOpen={recentOpen}
            onToggle={() => setRecentOpen(!recentOpen)}
          >
            {recentItems.map((item) => {
              const isActive = location.pathname === item.path;
              const pinned = isPinned(item.path);
              const accentColor = getAccentForPath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg w-full',
                    'text-xs transition-all duration-150',
                    'px-2', compactPy,
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <div
                    className={cn('w-1.5 h-1.5 rounded-full shrink-0', !isActive && 'opacity-0', isActive && !accentColor && 'bg-foreground/40')}
                    style={isActive && accentColor ? { backgroundColor: accentColor } : undefined}
                  />
                  {getIconComponent(item.icon, 'h-4 w-4 shrink-0')}
                  <span className="flex-1 truncate">{item.title}</span>
                  {/* Pin / Remove on hover */}
                  <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <span
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(item.path); }}
                          className={cn('p-0.5 rounded hover:bg-muted/80', pinned && 'text-primary')}
                        >
                          {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right">{pinned ? t('workspace.unpin') : t('workspace.pin')}</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <span
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeRecent(item.path); }}
                          className="p-0.5 rounded hover:bg-muted/80"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right">{t('common.remove')}</TooltipContent>
                    </Tooltip>
                  </span>
                </Link>
              );
            })}
          </CollapsibleSection>
        )}

        {/* Empty state */}
        {tabs.length === 0 && pinnedItems.length === 0 && recentItems.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            {t('activityBar.explorerEmpty')}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="p-2 border-t border-border/30">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() => openCommandPalette()}
              className={cn(
                'flex items-center gap-2 w-full rounded-lg',
                density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
                'text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50',
                'transition-colors',
              )}
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">{t('commandPalette.search')}</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/50 rounded">
                {t('shortcuts.keys.commandPalette')}
              </kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('commandPalette.title')}</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
