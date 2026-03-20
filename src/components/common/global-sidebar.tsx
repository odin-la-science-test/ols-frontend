'use client';

import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  PinOff,
  Clock,
  ChevronLeft,
  Search,
  X,
  Share2,
  UserPlus,
  Info,
  ExternalLink,
  Check,
  Bell,
  Filter,
  NotebookPen,
  Plus,
  StickyNote,
  Loader2,
  Layers,
  Rows2,
  PanelTop,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore, useCommandPaletteStore, useTabsStore, type Tab } from '@/stores';
import { useActivityBarStore, type SidebarPanelId } from '@/stores/activity-bar-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useModuleFiltersStore, DEFAULT_GROUP_ID, SPLIT_GROUP_ID } from '@/stores/module-filters-store';
import { SidebarPortalZone } from '@/components/common/sidebar-portal-zone';
import { SidebarStack, StackLayoutToggle, useSidebarStackContext, type StackPanelMeta } from '@/components/common/sidebar-stack';
import { useSidebarStackStore } from '@/stores/sidebar-stack-store';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useModules, type AppModuleDTO } from '@/hooks';
import { useDensity } from '@/hooks';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { useUnreadCount, useMyNotifications, useMarkAsRead, useMarkAllAsRead } from '@/features/notifications/hooks';
import type { NotificationType } from '@/features/notifications/types';
import { useMyNotes, useCreateNote } from '@/features/notes/hooks';
import { HUGIN_PRIMARY, getAccentForPath } from '@/lib/accent-colors';
import { Input } from '@/components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SIDEBAR - Panneau contextuel contrôlé par l'Activity Bar
// Affiche le contenu du panneau actif : Explorer ou Notifications
// Desktop only - Persisté via workspace-store
// ═══════════════════════════════════════════════════════════════════════════

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
  const { data: modules = [] } = useModules();

  // Collapsible section state
  const [openTabsOpen, setOpenTabsOpen] = React.useState(true);
  const [pinnedOpen, setPinnedOpen] = React.useState(true);
  const [recentOpen, setRecentOpen] = React.useState(true);

  const getModuleInfo = React.useCallback((path: string): Partial<AppModuleDTO> | undefined => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return modules.find((m) => 
      m.routePath === path || 
      m.routePath === cleanPath ||
      `/${m.routePath}` === path
    );
  }, [modules]);

  const pinnedItems = React.useMemo(() => {
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

  const recentItems = React.useMemo(() => {
    return recentModules.filter((r) => !pinnedModules.includes(r.path) && r.type !== 'action');
  }, [recentModules, pinnedModules]);

  const handleTabClick = React.useCallback((tab: Tab) => {
    setActiveTab(tab.id);
    if (location.pathname !== tab.path) {
      navigate(tab.path);
    }
  }, [setActiveTab, navigate, location.pathname]);

  const handleCloseTab = React.useCallback((e: React.MouseEvent, tabId: string) => {
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
          <div>
            <button
              onClick={() => setOpenTabsOpen(!openTabsOpen)}
              className="flex items-center gap-2 px-2 py-1 w-full text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <Layers className="h-3 w-3" />
              <span className="flex-1 text-left">{t('workspace.openTabs')}</span>
              <span className="text-[10px] tabular-nums">{tabs.length}</span>
            </button>
            <AnimatePresence initial={false}>
              {openTabsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-0.5">
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
                            className={cn('w-1.5 h-1.5 rounded-full shrink-0', !isActive && 'opacity-0')}
                            style={isActive ? { backgroundColor: accentColor } : undefined}
                          />
                          {getIconComponent(tab.icon, 'h-4 w-4 shrink-0')}
                          <span className="flex-1 truncate">{tab.title}</span>
                          {/* Pin indicator for pinned tabs (always visible) */}
                          {isPinnedTab && (
                            <span
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePinTab(tab.id); }}
                              className="p-0.5 rounded text-primary hover:bg-muted/80 transition-all"
                              title={t('tabs.unpin')}
                            >
                              <Pin className="h-3 w-3" />
                            </span>
                          )}
                          {/* Pin / Close on hover */}
                          <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            {!isPinnedTab && (
                              <span
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePinTab(tab.id); }}
                                className="p-0.5 rounded hover:bg-muted/80"
                                title={t('tabs.pin')}
                              >
                                <Pin className="h-3 w-3" />
                              </span>
                            )}
                            {!isPinnedTab && (
                              <span
                                onClick={(e) => handleCloseTab(e, tab.id)}
                                className="p-0.5 rounded hover:bg-muted/80"
                                title={t('tabs.closeTab')}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pinned Section */}
        {pinnedItems.length > 0 && (
          <div>
            <button
              onClick={() => setPinnedOpen(!pinnedOpen)}
              className="flex items-center gap-2 px-2 py-1 w-full text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <Pin className="h-3 w-3" />
              <span className="flex-1 text-left">{t('workspace.pinned')}</span>
              <span className="text-[10px] tabular-nums">{pinnedItems.length}</span>
            </button>
            <AnimatePresence initial={false}>
              {pinnedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-0.5">
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
                            className={cn('w-1.5 h-1.5 rounded-full shrink-0', !isActive && 'opacity-0')}
                            style={isActive ? { backgroundColor: accentColor } : undefined}
                          />
                          {getIconComponent(item.icon, 'h-4 w-4 shrink-0')}
                          <span className="flex-1 truncate">{item.title}</span>
                          <span
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(item.path); }}
                            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted/80 transition-all text-primary"
                            title={t('workspace.unpin')}
                          >
                            <PinOff className="h-3 w-3" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Recent Section */}
        {recentItems.length > 0 && (
          <div>
            <button
              onClick={() => setRecentOpen(!recentOpen)}
              className="flex items-center gap-2 px-2 py-1 w-full text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <Clock className="h-3 w-3" />
              <span className="flex-1 text-left">{t('workspace.recent')}</span>
              <span className="text-[10px] tabular-nums">{recentItems.length}</span>
            </button>
            <AnimatePresence initial={false}>
              {recentOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-0.5">
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
                            className={cn('w-1.5 h-1.5 rounded-full shrink-0', !isActive && 'opacity-0')}
                            style={isActive ? { backgroundColor: accentColor } : undefined}
                          />
                          {getIconComponent(item.icon, 'h-4 w-4 shrink-0')}
                          <span className="flex-1 truncate">{item.title}</span>
                          {/* Pin / Remove on hover */}
                          <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <span
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(item.path); }}
                              className={cn('p-0.5 rounded hover:bg-muted/80', pinned && 'text-primary')}
                              title={pinned ? t('workspace.unpin') : t('workspace.pin')}
                            >
                              {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                            </span>
                            <span
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeRecent(item.path); }}
                              className="p-0.5 rounded hover:bg-muted/80"
                              title={t('common.remove')}
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
        <button
          onClick={() => openCommandPalette()}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg',
            density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
            'text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors',
          )}
          title={t('commandPalette.title')}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">{t('commandPalette.search')}</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/50 rounded">
            {t('shortcuts.keys.commandPalette')}
          </kbd>
        </button>
      </div>
    </>
  );
}

// ─── Notifications Panel ────────────────────────────────────────────────

const NOTIF_TYPE_ICON: Record<NotificationType, typeof Bell> = {
  QUICKSHARE_RECEIVED: Share2,
  CONTACT_ADDED: UserPlus,
  SYSTEM: Info,
};

const NOTIF_TYPE_COLOR: Record<NotificationType, string> = {
  QUICKSHARE_RECEIVED: 'text-blue-500',
  CONTACT_ADDED: 'text-emerald-500',
  SYSTEM: 'text-amber-500',
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '1m';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export function NotificationsPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const d = useDensity();
  const density = d.density;
  const { data: unreadData } = useUnreadCount();
  const { data: notifications = [] } = useMyNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* Header actions */}
        {unreadCount > 0 && (
          <div className={cn(density === 'compact' ? 'px-3 py-1' : 'px-3 py-2', 'border-b border-border/30')}>
            <button
              onClick={() => markAllAsRead.mutate()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Check className="h-3 w-3" />
                {t('notifications.markAllRead')}
              </div>
            </button>
          </div>
        )}

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('notifications.emptyTitle')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {notifications.slice(0, 20).map((notif) => {
              const TypeIcon = NOTIF_TYPE_ICON[notif.type] || Info;
              const typeColor = NOTIF_TYPE_COLOR[notif.type] || 'text-muted-foreground';
              return (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markAsRead.mutate(notif.id);
                    if (notif.actionUrl) navigate(notif.actionUrl);
                  }}
                  className={cn(
                    'w-full flex items-start text-left',
                    'hover:bg-muted/50 transition-colors',
                    density === 'compact' ? 'gap-2 px-3 py-1.5' : 'gap-2.5 px-3 py-2.5',
                    !notif.read && 'bg-muted/20'
                  )}
                >
                  <TypeIcon className={cn('h-4 w-4 mt-0.5 shrink-0', typeColor)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-medium leading-relaxed',
                      notif.read ? 'text-muted-foreground' : 'text-foreground'
                    )}>
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className={cn(
                        'text-[11px] leading-relaxed mt-0.5',
                        notif.read ? 'text-muted-foreground/70' : 'text-muted-foreground'
                      )}>
                        {notif.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* View all link */}
      <div className="p-2 border-t border-border/30">
        <Link
          to="/notifications"
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-lg',
            density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
            'text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors',
          )}
        >
          <ExternalLink className="h-3 w-3" />
          {t('notifications.viewAll')}
        </Link>
      </div>
    </>
  );
}

// ─── Filters Panel (contextual, driven by module-filters-store) ─────────

/**
 * Thin connector: reads the registration from the filters store
 * and passes it to the generic SidebarPortalZone.
 */
function FiltersZoneConnected({ groupId, hideModuleHeader = false, tabsMode = false }: { groupId: string; hideModuleHeader?: boolean; tabsMode?: boolean }) {
  const registration = useModuleFiltersStore((s) => s.registrations[groupId] ?? null);
  const setPortalTarget = useModuleFiltersStore((s) => s.setPortalTarget);
  const hideGroup = useModuleFiltersStore((s) => s.hideGroup);
  const stackCtx = useSidebarStackContext();

  // When rendered inside a multi-panel stacked stack, the stack already
  // provides its own header per panel — hide the internal module header
  // AND close button to avoid the double-header / double-X.
  const inStackedStack = stackCtx?.isMultiPanel && stackCtx.layout === 'stacked';
  const shouldHideHeader = hideModuleHeader || inStackedStack;

  const handleClose = React.useCallback(() => {
    hideGroup(groupId);
  }, [hideGroup, groupId]);

  // Don't show the internal close button when the stack header already has one
  const showClose = registration && !tabsMode && !inStackedStack;

  return (
    <SidebarPortalZone
      groupId={groupId}
      registration={registration}
      setPortalTarget={setPortalTarget}
      onClose={showClose ? handleClose : undefined}
      hideModuleHeader={!!shouldHideHeader}
      portalClassName="overflow-y-auto p-3 space-y-2"
    />
  );
}

export function FiltersPanel() {
  const { t } = useTranslation();
  const registrations = useModuleFiltersStore((s) => s.registrations);
  const hiddenGroups = useModuleFiltersStore((s) => s.hiddenGroups);
  const hideGroup = useModuleFiltersStore((s) => s.hideGroup);
  const hasAny = useModuleFiltersStore((s) => s.hasAnyRegistration());
  const { setActivePanel } = useActivityBarStore();
  const sidebarFilterLayout = useWorkspaceStore((s) => s.sidebarFilterLayout);

  const mainReg = registrations[DEFAULT_GROUP_ID];
  const splitReg = registrations[SPLIT_GROUP_ID];
  const mainVisible = !!mainReg && !hiddenGroups.has(DEFAULT_GROUP_ID);
  const splitVisible = !!splitReg && !hiddenGroups.has(SPLIT_GROUP_ID);
  const bothVisible = mainVisible && splitVisible;
  const noneVisible = hasAny && !mainVisible && !splitVisible;

  // Active tab defaults to main, switches to split if main disappears
  const [activeTab, setActiveTab] = React.useState<typeof DEFAULT_GROUP_ID | typeof SPLIT_GROUP_ID>(DEFAULT_GROUP_ID);
  React.useEffect(() => {
    if (!mainVisible && splitVisible) setActiveTab(SPLIT_GROUP_ID);
    if (mainVisible && !splitVisible) setActiveTab(DEFAULT_GROUP_ID);
  }, [mainVisible, splitVisible]);

  // When all zones are manually hidden, collapse the sidebar
  React.useEffect(() => {
    if (noneVisible) setActivePanel(null);
  }, [noneVisible, setActivePanel]);

  if (!hasAny || noneVisible) return null;

  // Only one group visible — simple render
  if (!bothVisible) {
    return mainVisible
      ? <FiltersZoneConnected groupId={DEFAULT_GROUP_ID} />
      : <FiltersZoneConnected groupId={SPLIT_GROUP_ID} />;
  }

  // Both visible — tabs or stacked
  if (sidebarFilterLayout === 'tabs') {
    const tabDefs = [
      { id: DEFAULT_GROUP_ID, reg: mainReg },
      { id: SPLIT_GROUP_ID, reg: splitReg },
    ] as const;

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Module-header style tab bar — two headers side by side */}
        <div className="flex shrink-0 border-b border-border/30">
          {tabDefs.map(({ id, reg }) => {
            const isActive = activeTab === id;
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
                  onClick={(e) => { e.stopPropagation(); hideGroup(id); }}
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            );
          })}
        </div>
        {/* Active group content — no header, no extra X (tab already has the X) */}
        <div className="flex-1 overflow-hidden">
          <FiltersZoneConnected groupId={activeTab} hideModuleHeader tabsMode />
        </div>
      </div>
    );
  }

  // Stacked (default)
  return (
    <ResizablePanelGroup orientation="vertical" id="filters-split">
      <ResizablePanel id="filters-main" defaultSize="50" minSize="20">
        <FiltersZoneConnected groupId={DEFAULT_GROUP_ID} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="filters-split-panel" defaultSize="50" minSize="20">
        <FiltersZoneConnected groupId={SPLIT_GROUP_ID} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// ─── Notes Panel (quick capture + recent notes) ────────────────────────

const NOTE_PANEL_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/15 border-blue-500/30',
  red: 'bg-red-500/15 border-red-500/30',
  green: 'bg-emerald-500/15 border-emerald-500/30',
  yellow: 'bg-amber-500/15 border-amber-500/30',
  purple: 'bg-violet-500/15 border-violet-500/30',
  orange: 'bg-orange-500/15 border-orange-500/30',
};

export function NotesPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const d = useDensity();
  const density = d.density;
  const { data: notes, isLoading } = useMyNotes();
  const createNote = useCreateNote();

  const [quickTitle, setQuickTitle] = React.useState('');
  const [quickContent, setQuickContent] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sort by updatedAt desc, take 8
  const recentNotes = React.useMemo(() => {
    return (notes ?? [])
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }, [notes]);

  const handleQuickCreate = React.useCallback(() => {
    const title = quickTitle.trim();
    if (!title) return;
    createNote.mutate(
      { title, content: quickContent.trim() || undefined },
      {
        onSuccess: () => {
          setQuickTitle('');
          setQuickContent('');
          setIsExpanded(false);
        },
      }
    );
  }, [quickTitle, quickContent, createNote]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickCreate();
    }
    if (e.key === 'Escape') {
      setQuickTitle('');
      setQuickContent('');
      setIsExpanded(false);
    }
  }, [handleQuickCreate]);

  return (
    <>
      {/* Quick capture */}
      <div className="px-3 py-2.5 border-b border-border/30 space-y-2">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={quickTitle}
            onChange={(e) => {
              setQuickTitle(e.target.value);
              if (e.target.value && !isExpanded) setIsExpanded(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('notes.titlePlaceholder')}
            className="h-7 text-xs bg-muted/30 border-border/40"
          />
          <button
            onClick={handleQuickCreate}
            disabled={!quickTitle.trim() || createNote.isPending}
            className={cn(
              'flex items-center justify-center rounded-md h-7 w-7 shrink-0',
              'transition-colors',
              quickTitle.trim()
                ? 'bg-[hsl(160,84%,39%)] text-white hover:bg-[hsl(160,84%,34%)]'
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            )}
            title={t('notes.create')}
          >
            {createNote.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Expandable content area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <textarea
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleQuickCreate();
                  }
                  if (e.key === 'Escape') {
                    setIsExpanded(false);
                    setQuickContent('');
                  }
                }}
                placeholder={t('notes.contentPlaceholder')}
                className={cn(
                  'w-full rounded-md border border-border/40 bg-muted/30',
                  'text-xs text-foreground placeholder:text-muted-foreground/50',
                  'px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring',
                  'min-h-[60px] max-h-[120px]'
                )}
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                Ctrl+Enter {t('notes.create').toLowerCase()} · Esc {t('notes.cancel').toLowerCase()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent notes list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <StickyNote className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('notes.emptyTitle')}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{t('notes.emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => navigate('/lab/notes')}
                className={cn(
                  'w-full flex items-start gap-2 rounded-lg text-left',
                  'hover:bg-muted/50 transition-colors',
                  density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
                )}
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    note.color ? '' : 'bg-muted-foreground/30'
                  )}
                  style={note.color ? {
                    backgroundColor: note.color === 'blue' ? 'rgb(59 130 246)' :
                      note.color === 'red' ? 'rgb(239 68 68)' :
                      note.color === 'green' ? 'rgb(16 185 129)' :
                      note.color === 'yellow' ? 'rgb(245 158 11)' :
                      note.color === 'purple' ? 'rgb(139 92 246)' :
                      note.color === 'orange' ? 'rgb(249 115 22)' :
                      undefined
                  } : undefined}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-xs font-medium truncate',
                    note.pinned ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {note.pinned && '📌 '}{note.title}
                  </p>
                  {note.content && (
                    <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                      {note.content.slice(0, 60)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View all link */}
      <div className="p-2 border-t border-border/30">
        <Link
          to="/lab/notes"
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-lg',
            density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
            'text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors',
          )}
        >
          <ExternalLink className="h-3 w-3" />
          {t('notes.title')} — {t('dashboard.viewAll')}
        </Link>
      </div>
    </>
  );
}

// ─── Panel Title mapping ────────────────────────────────────────────────

const PANEL_TITLES: Record<SidebarPanelId, string> = {
  explorer: 'activityBar.explorer',
  tools: 'activityBar.modulePanel',
  notes: 'notes.title',
  notifications: 'notifications.title',
};

// ─── Panel renderers (keyed by panel id) ────────────────────────────────

/** Map panel id → React component. Extensible — no hardcoded combos. */
const PANEL_COMPONENTS: Record<SidebarPanelId, React.ComponentType> = {
  explorer: ExplorerPanel,
  tools: FiltersPanel,
  notes: NotesPanel,
  notifications: NotificationsPanel,
};

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
  const activePanel = (activityPanelZone.isOpen ? activityPanelZone.activeTab : null) as SidebarPanelId | null;
  const d = useDensity();
  const sidebarFilterLayout = useWorkspaceStore((s) => s.sidebarFilterLayout);
  const toggleSidebarFilterLayout = useWorkspaceStore((s) => s.toggleSidebarFilterLayout);

  // Sidebar stack state
  const leftStack = useSidebarStackStore((s) => s.stacks.left);
  const isMultiPanel = leftStack.length > 1;

  // Sync: on mount only, if activePanel is set but the stack is empty (fresh load from
  // persisted activity-bar-store while sidebar-stack-store was cleared), seed the stack.
  const hasInitialized = React.useRef(false);
  React.useEffect(() => {
    if (!hasInitialized.current && activePanel && leftStack.length === 0) {
      useSidebarStackStore.getState().setStack('left', [activePanel]);
    }
    hasInitialized.current = true;
  }, [activePanel, leftStack.length]);

  // Sync: if the user closes all panels from the stack (via X buttons), close the sidebar
  React.useEffect(() => {
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
  const stackPanels: StackPanelMeta[] = React.useMemo(
    () =>
      leftStack
        .filter((id) => id in PANEL_TITLES)
        .map((id) => ({
          id,
          label: t(PANEL_TITLES[id as SidebarPanelId]),
        })),
    [leftStack, t],
  );

  // Render a single panel by id
  const renderPanel = React.useCallback((panelId: string) => {
    const Component = PANEL_COMPONENTS[panelId as SidebarPanelId];
    if (!Component) return null;
    return <Component />;
  }, []);

  // Title: in multi-panel mode, show the active tab's title; otherwise the single panel
  const headerTitle = isMultiPanel
    ? t('workspace.panels', 'Panneaux')
    : activePanel ? t(PANEL_TITLES[activePanel]) : '';

  // Available panels to add (not already in the stack), max 2 total
  const availablePanels = React.useMemo(() => {
    const allPanelIds = Object.keys(PANEL_TITLES) as SidebarPanelId[];
    return allPanelIds.filter((id) => !leftStack.includes(id));
  }, [leftStack]);

  const canAddPanel = leftStack.length < 2 && availablePanels.length > 0;

  // Dropdown state for the "+" button
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const addMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!addMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [addMenuOpen]);

  const handleAddPanel = React.useCallback((panelId: SidebarPanelId) => {
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
              <button
                onClick={() => setAddMenuOpen((o) => !o)}
                className={cn(
                  'p-1 rounded-lg transition-colors',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  addMenuOpen && 'bg-muted/50 text-foreground'
                )}
                title={t('workspace.addPanel', 'Ajouter un panneau')}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
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
                      {t(PANEL_TITLES[panelId])}
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
            <button
              onClick={toggleSidebarFilterLayout}
              className={cn(
                'p-1 rounded-lg transition-colors',
                'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              title={sidebarFilterLayout === 'tabs'
                ? t('workspace.sidebarLayoutStacked', 'Vue empilée')
                : t('workspace.sidebarLayoutTabs', 'Vue onglets')
              }
            >
              {sidebarFilterLayout === 'tabs'
                ? <Rows2 className="h-3.5 w-3.5" />
                : <PanelTop className="h-3.5 w-3.5" />
              }
            </button>
          )}
          <button
            onClick={() => setActivePanel(null)}
            className={cn(
              'p-1 rounded-lg',
              'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              'transition-colors'
            )}
            title={t('workspace.collapse')}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
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
            onTabChange={(panelId) => setActivePanel(panelId as SidebarPanelId)}
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
