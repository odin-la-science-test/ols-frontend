'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CommandPalette, TabManager, MobileBottomBar,
  ActivityBar, StatusBar, MenuBar,
  BetaBanner,
} from '@/components/common';
import { FocusModeIndicator } from '@/components/common/focus-mode-indicator';
import { useRegisterAppPanels, useRegisterDetailPanel } from '@/components/common/app-panel-bridge';
import { ActivityBarBadgeSync } from '@/hooks/use-activity-bar-badge-sync';
import { ShellDndProvider } from '@/components/common/shell-dnd-context';
import { TourLauncher } from '@/components/common/tour-launcher';
import { WhatsNewModal } from '@/components/common';
import { useKeyboardShortcuts, useSmartTips } from '@/hooks';
import { useNotificationStream } from '@/features/notifications';
import { useWorkspaceStore, useActivityBarStore, useAuthStore, useModuleAccessStore, useProgressStore } from '@/stores';
import { eventBus } from '@/lib/event-bus';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { DesktopResizableLayout } from './desktop-resizable-layout';
import { MobileLayout } from './mobile-layout';

// ═══════════════════════════════════════════════════════════════════════════
// APP SHELL — VS Code-style workspace with declarative layout engine
//
// Uses layout-engine.ts to build a tree of panels per alignment mode,
// and layout-renderer.tsx to walk that tree into ResizablePanelGroups.
// ShellDndProvider enables cross-zone drag & drop everywhere.
// ═══════════════════════════════════════════════════════════════════════════

const MINIMAL_SHELL_PATHS = ['/', '/atlas', '/lab'];

function getAccentContext(pathname: string): string | null {
  if (pathname === '/lab' || pathname.startsWith('/lab/')) return 'lab';
  return null;
}

// ─── App Shell ──────────────────────────────────────────────────────────

export function AppShell() {
  const location = useLocation();
  const { tabBarVisible, focusMode, statusBarVisible, menuBarVisible, showBreadcrumbs } = useWorkspaceStore();
  const { activityBarVisible, position: activityBarPosition } = useActivityBarStore();
  const hasModuleToolbar = useModuleToolbarStore((s) => !!s.registration);
  const hasModuleFilters = useModuleFiltersStore((s) => s.hasAnyRegistration());
  const splitActive = useEditorGroupsStore((s) => s.splitActive);
  const splitDirection = useEditorGroupsStore((s) => s.splitDirection);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchAccess = useModuleAccessStore((s) => s.fetchAccess);

  useKeyboardShortcuts();
  useRegisterAppPanels();
  useRegisterDetailPanel();
  useNotificationStream();
  useSmartTips();

  // Fetch module access on mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      fetchAccess();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track entity creation events for progress metrics
  useEffect(() => {
    const unsubs = [
      eventBus.on('contacts:created', () => useProgressStore.getState().trackEntityCreated()),
      eventBus.on('notes:created', () => useProgressStore.getState().trackEntityCreated()),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  useEffect(() => {
    const accent = getAccentContext(location.pathname);
    if (accent) document.documentElement.setAttribute('data-accent', accent);
    else document.documentElement.removeAttribute('data-accent');
  }, [location.pathname]);

  const isMinimalShell = MINIMAL_SHELL_PATHS.includes(location.pathname);
  const showChrome = !isMinimalShell && !focusMode;

  return (
    <ShellDndProvider>
      <TabManager />
      <CommandPalette />
      <ActivityBarBadgeSync />
      <TourLauncher />

      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <BetaBanner />
        {showChrome && menuBarVisible && <MenuBar />}

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {showChrome && activityBarVisible && activityBarPosition === 'left' && <ActivityBar />}

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            {showChrome && activityBarVisible && activityBarPosition === 'top' && <ActivityBar />}

            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
              <DesktopResizableLayout
                showChrome={showChrome} showBreadcrumbs={showBreadcrumbs}
                tabBarVisible={tabBarVisible} hasModuleToolbar={hasModuleToolbar}
                hasModuleFilters={hasModuleFilters}
                splitActive={splitActive} splitDirection={splitDirection}
              />
              <MobileLayout isMinimalShell={isMinimalShell} />
            </div>

            {showChrome && activityBarVisible && activityBarPosition === 'bottom' && <ActivityBar />}
          </div>

          {showChrome && activityBarVisible && activityBarPosition === 'right' && <ActivityBar />}
        </div>

        {showChrome && statusBarVisible && <StatusBar />}
      </div>

      {!focusMode && <MobileBottomBar />}
      {focusMode && <FocusModeIndicator />}
      <WhatsNewModal />
    </ShellDndProvider>
  );
}
