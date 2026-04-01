'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  CommandPalette, TabManager, MobileBottomBar,
  ActivityBar, StatusBar, TitleBar,
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
import { useRouteHistoryStore } from '@/stores/route-history-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { DesktopResizableLayout } from './desktop-resizable-layout';
import { ClassicShellLayout } from './classic-shell-layout';
import { MobileLayout } from './mobile-layout';

// ═══════════════════════════════════════════════════════════════════════════
// APP SHELL — Dual-mode workspace: Classic (default) or IDE (advanced)
//
// Classic mode: ClassicSidebar + NavigationBar (Arc gap) + card content
// IDE mode: TitleBar (menus + nav) + tabs + split view + panels
// ═══════════════════════════════════════════════════════════════════════════

const MINIMAL_SHELL_PATHS = ['/', '/atlas', '/lab'];

function getAccentContext(pathname: string): string | null {
  if (pathname === '/lab' || pathname.startsWith('/lab/')) return 'lab';
  return null;
}

// ─── App Shell ──────────────────────────────────────────────────────────

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const { layoutMode, tabBarVisible, focusMode, statusBarVisible, menuBarVisible, showBreadcrumbs } = useWorkspaceStore();
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

  // Track route changes for back/forward navigation
  useEffect(() => {
    useRouteHistoryStore.getState().push(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const accent = getAccentContext(location.pathname);
    if (accent) document.documentElement.setAttribute('data-accent', accent);
    else document.documentElement.removeAttribute('data-accent');
  }, [location.pathname]);

  const isMinimalShell = MINIMAL_SHELL_PATHS.includes(location.pathname);
  const isClassic = layoutMode === 'classic';
  const showChrome = !isMinimalShell && !focusMode;

  return (
    <ShellDndProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring"
      >
        {t('common.skipToContent')}
      </a>
      <TabManager />
      <CommandPalette />
      <ActivityBarBadgeSync />
      <TourLauncher />

      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <BetaBanner />

        {isClassic ? (
          // ─── Classic Mode ─────────────────────────────────────────
          <ClassicShellLayout
            showBreadcrumbs={showBreadcrumbs}
            hasModuleToolbar={hasModuleToolbar}
            isMinimalShell={isMinimalShell}
          />
        ) : (
          // ─── IDE Mode ─────────────────────────────────────────────
          <>
            {showChrome && menuBarVisible && <TitleBar />}

            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
              {showChrome && activityBarVisible && activityBarPosition === 'left' && <ActivityBar />}

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                {showChrome && activityBarVisible && activityBarPosition === 'top' && <ActivityBar />}

                <main id="main-content" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                  <DesktopResizableLayout
                    showChrome={showChrome} showBreadcrumbs={showBreadcrumbs}
                    tabBarVisible={tabBarVisible} hasModuleToolbar={hasModuleToolbar}
                    hasModuleFilters={hasModuleFilters}
                    splitActive={splitActive} splitDirection={splitDirection}
                  />
                  <MobileLayout isMinimalShell={isMinimalShell} />
                </main>

                {showChrome && activityBarVisible && activityBarPosition === 'bottom' && <ActivityBar />}
              </div>

              {showChrome && activityBarVisible && activityBarPosition === 'right' && <ActivityBar />}
            </div>

            {showChrome && statusBarVisible && <StatusBar />}
          </>
        )}
      </div>

      {!focusMode && <MobileBottomBar />}
      {!isClassic && focusMode && <FocusModeIndicator />}
      <WhatsNewModal />
    </ShellDndProvider>
  );
}
