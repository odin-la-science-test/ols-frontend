'use client';

import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStatusBarStore, type StatusBarItem } from '@/stores/status-bar-store';
import { useWorkspaceStore, useTabsStore } from '@/stores';
import { useThemeStore } from '@/stores';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useUnreadCount } from '@/features/notifications';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { getAccentForPath } from '@/lib/accent-colors';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BAR - Contextual information bar at the bottom
// VS Code-inspired: left = module info, right = global status
//
// Each module pushes its own items via useStatusBarItems() hook.
// The bar automatically shows online/offline status.
// Desktop only — hidden on mobile.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Route-to-module label mapping ───
const ROUTE_MODULE_LABELS: Record<string, string> = {
  '/atlas/bacteriology': 'bacteriology.title',
  '/atlas/mycology': 'mycology.title',
  '/lab/quickshare': 'quickshare.title',
  '/lab/notes': 'notes.title',
  '/lab/contacts': 'contacts.title',
  '/lab/notifications': 'notifications.title',
  '/lab/support': 'support.title',
  '/lab/admin/support': 'adminSupport.title',
  '/settings': 'settingsPage.title',
  '/profile': 'profile.title',
  '/atlas': 'atlas.title',
  '/lab': 'home.huginLab',
};

export function StatusBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { items, isOnline, setOnline, hiddenSegments, toggleSegment } = useStatusBarStore();
  const accentedUI = useThemeStore((s) => s.accentedUI);
  const statusBarVisible = useWorkspaceStore((s) => s.statusBarVisible);
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();

  // ─── Network status listener ───
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // ─── Split state ───
  const splitActive = useEditorGroupsStore((s) => s.splitActive);
  const splitGroup = useEditorGroupsStore((s) => s.groups.find(g => g.id === 'split'));
  const allTabs = useTabsStore((s) => s.tabs);

  // Resolve the split group's active tab path
  const splitTabPath = useMemo(() => {
    if (!splitActive || !splitGroup?.activeTabId) return null;
    const tab = allTabs.find(t => t.id === splitGroup.activeTabId);
    return tab?.path ?? null;
  }, [splitActive, splitGroup?.activeTabId, allTabs]);

  // ─── Sort items by position ───
  const allItems = useMemo(() => Object.values(items), [items]);

  const sortByPriority = (a: StatusBarItem, b: StatusBarItem) =>
    (a.priority ?? 50) - (b.priority ?? 50);

  // When split is active, partition items by group
  const mainLeftItems = useMemo(() =>
    allItems.filter(i => i.position === 'left' && (i.groupId ?? 'main') === 'main').sort(sortByPriority),
    [allItems]
  );
  const mainRightItems = useMemo(() =>
    allItems.filter(i => i.position === 'right' && (i.groupId ?? 'main') === 'main').sort(sortByPriority),
    [allItems]
  );
  const splitLeftItems = useMemo(() =>
    allItems.filter(i => i.position === 'left' && i.groupId === 'split').sort(sortByPriority),
    [allItems]
  );
  const splitRightItems = useMemo(() =>
    allItems.filter(i => i.position === 'right' && i.groupId === 'split').sort(sortByPriority),
    [allItems]
  );

  // Flat lists for non-split mode (backwards compat)
  const leftItems = useMemo(() =>
    allItems.filter(i => i.position === 'left').sort(sortByPriority),
    [allItems]
  );
  const rightItems = useMemo(() =>
    allItems.filter(i => i.position === 'right').sort(sortByPriority),
    [allItems]
  );

  // ─── Module labels ───
  const resolveLabel = (pathname: string | null) => {
    if (!pathname) return null;
    const match = Object.entries(ROUTE_MODULE_LABELS).find(([route]) =>
      pathname === route || pathname.startsWith(route + '/')
    );
    return match ? t(match[1]) : null;
  };

  const moduleLabel = useMemo(() => resolveLabel(location.pathname), [location.pathname, t]);
  const splitModuleLabel = useMemo(() => resolveLabel(splitTabPath), [splitTabPath, t]);

  // ─── Accent colors ───
  const accentColor = getAccentForPath(location.pathname);
  const splitAccentColor = splitTabPath ? getAccentForPath(splitTabPath) : accentColor;

  if (!statusBarVisible) return null;

  return (
    <div className="hidden lg:flex items-center h-6 border-t border-border/30 bg-card/80 backdrop-blur-sm text-[10px] select-none shrink-0" onContextMenu={handleContextMenu}>
      {/* ─── Left accent stripe ─── */}
      <div
        className="w-[2px] h-full shrink-0"
        style={accentedUI ? { backgroundColor: accentColor } : { backgroundColor: 'var(--color-foreground)', opacity: 0.15 }}
      />

      {/* ─── Left zone: module info ─── */}
      {!hiddenSegments.has('moduleLabel') && (
      <div className="flex items-center gap-0.5 flex-1 min-w-0 px-2">
        {splitActive ? (
          /* ── Split mode: two labeled groups ── */
          <>
            {/* Main group */}
            <ModuleGroup
              label={moduleLabel}
              leftItems={mainLeftItems}
              rightItems={mainRightItems}
              accentedUI={accentedUI}
              accentColor={accentColor}
              splitMode
            />

            {/* Divider between groups */}
            {(moduleLabel || mainLeftItems.length > 0 || mainRightItems.length > 0) && (splitModuleLabel || splitLeftItems.length > 0 || splitRightItems.length > 0) && (
              <span className="text-muted-foreground/20 mx-1 select-none">│</span>
            )}

            {/* Split group */}
            <ModuleGroup
              label={splitModuleLabel}
              leftItems={splitLeftItems}
              rightItems={splitRightItems}
              accentedUI={accentedUI}
              accentColor={splitAccentColor}
              splitMode
            />
          </>
        ) : (
          /* ── Normal mode: same ModuleGroup component for consistency ── */
          <ModuleGroup
            label={moduleLabel}
            leftItems={leftItems}
            rightItems={rightItems}
            accentedUI={accentedUI}
            accentColor={accentColor}
          />
        )}
      </div>
      )}
      {hiddenSegments.has('moduleLabel') && <div className="flex-1" />}

      {/* ─── Right zone: global status (network, notifications) ─── */}
      <div className="flex items-center gap-0.5 px-2 shrink-0">

        {/* Unread notifications indicator */}
        {!hiddenSegments.has('notifications') && unreadCount > 0 && (
          <StatusBarSegment
            text={t('statusBar.newNotifications', { count: unreadCount })}
            icon={undefined}
            tooltip={t('statusBar.newNotificationsTooltip', { count: unreadCount })}
            className="text-amber-500"
            customIcon={
              <span className="relative">
                <Bell className="h-2.5 w-2.5" />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              </span>
            }
          />
        )}

        {/* Network indicator */}
        {!hiddenSegments.has('network') && (
        <StatusBarSegment
          text={isOnline ? t('statusBar.online') : t('statusBar.offline')}
          icon={undefined}
          tooltip={isOnline ? t('statusBar.onlineTooltip') : t('statusBar.offlineTooltip')}
          className={isOnline ? 'text-muted-foreground/60' : 'text-destructive'}
          customIcon={
            isOnline
              ? <Wifi className="h-2.5 w-2.5" />
              : <WifiOff className="h-2.5 w-2.5" />
          }
        />
        )}
      </div>

      {/* Context menu — toggle own segments */}
      {menuPosition && (
        <BarContextMenu position={menuPosition} onClose={closeMenu} estimatedHeight={160}>
          <MenuItem
            label={t('contextMenu.moduleLabel')}
            onClick={() => { toggleSegment('moduleLabel'); closeMenu(); }}
            checked={!hiddenSegments.has('moduleLabel')}
          />
          <MenuItem
            label={t('contextMenu.notifications')}
            onClick={() => { toggleSegment('notifications'); closeMenu(); }}
            checked={!hiddenSegments.has('notifications')}
          />
          <MenuItem
            label={t('contextMenu.network')}
            onClick={() => { toggleSegment('network'); closeMenu(); }}
            checked={!hiddenSegments.has('network')}
          />
          <MenuSeparator />
          <MenuItem
            label={t('statusBar.hide')}
            onClick={() => { useWorkspaceStore.getState().toggleStatusBar(); closeMenu(); }}
          />
        </BarContextMenu>
      )}
    </div>
  );
}

// ─── Module group (split mode) ───

interface ModuleGroupProps {
  label: string | null;
  leftItems: StatusBarItem[];
  rightItems: StatusBarItem[];
  accentedUI: boolean;
  accentColor: string;
  splitMode?: boolean;
}

function ModuleGroup({ label, leftItems, rightItems, accentedUI, accentColor, splitMode = false }: ModuleGroupProps) {
  const hasContent = label || leftItems.length > 0 || rightItems.length > 0;
  if (!hasContent) return null;
  return (
    <div className="flex items-center gap-0.5 min-w-0">
      {label && (
        <StatusBarSegment
          text={label}
          className={cn(
            'font-medium shrink-0',
            accentedUI ? 'text-[var(--module-accent,var(--color-foreground))]' : 'text-foreground/70'
          )}
          customIcon={
            splitMode ? (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: accentColor }}
              />
            ) : undefined
          }
        />
      )}
      {label && leftItems.length > 0 && (
        <span className="text-muted-foreground/30 mx-0.5">|</span>
      )}
      {leftItems.map((item) => (
        <StatusBarSegment
          key={item.id}
          text={item.text}
          icon={item.icon}
          tooltip={item.tooltip}
          onClick={item.onClick}
        />
      ))}
      {rightItems.length > 0 && (label || leftItems.length > 0) && (
        <span className="text-muted-foreground/20 mx-0.5">·</span>
      )}
      {rightItems.map((item) => (
        <StatusBarSegment
          key={item.id}
          text={item.text}
          icon={item.icon}
          tooltip={item.tooltip}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
}

// ─── Single status bar segment ───

interface StatusBarSegmentProps {
  text: string;
  icon?: string;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  customIcon?: React.ReactNode;
}

function StatusBarSegment({ text, icon, tooltip, onClick, className, style, customIcon }: StatusBarSegmentProps) {
  const isClickable = !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      title={tooltip}
      style={style}
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded-sm transition-colors duration-100',
        'text-muted-foreground/60',
        isClickable
          ? 'hover:bg-muted/40 hover:text-muted-foreground cursor-pointer'
          : 'cursor-default',
        className
      )}
    >
      {customIcon ?? (icon && getIconComponent(icon, 'h-2.5 w-2.5'))}
      <span className="truncate max-w-[200px]">{text}</span>
    </button>
  );
}
