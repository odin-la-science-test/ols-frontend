'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Columns2 } from 'lucide-react';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useTabsStore } from '@/stores';
import { useWorkspaceStore } from '@/stores';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { EditorGroupProvider } from './editor-group-context';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { ModuleToolbar } from '@/components/common/module-toolbar';
import { TabBar } from '@/components/common/tab-bar';

// ═══════════════════════════════════════════════════════════════════════════
// SPLIT EDITOR PANE — Secondary editor panel for VS Code-style split view
//
// Renders the active tab of the 'split' editor group as a lazy-loaded page.
// Has its own mini tab bar, and shows an empty state when no tabs are assigned.
//
// Architecture:
//   - Route components are lazy-loaded to avoid circular dependencies
//   - Uses a map path → Component to resolve what to render
//   - Each tab in the split group can be activated / closed / moved back
// ═══════════════════════════════════════════════════════════════════════════

// Lazy-load every module page so the split pane can render any of them
const BacteriologyPage = React.lazy(() => import('@/features/bacteriology').then(m => ({ default: m.BacteriologyPage })));
const MycologyPage = React.lazy(() => import('@/features/mycology').then(m => ({ default: m.MycologyPage })));
const QuickSharePage = React.lazy(() => import('@/features/quickshare').then(m => ({ default: m.QuickSharePage })));
const NotesPage = React.lazy(() => import('@/features/notes').then(m => ({ default: m.NotesPage })));
const ContactsPage = React.lazy(() => import('@/features/contacts').then(m => ({ default: m.ContactsPage })));
const NotificationsPage = React.lazy(() => import('@/features/notifications').then(m => ({ default: m.NotificationsPage })));
const SupportPage = React.lazy(() => import('@/features/support').then(m => ({ default: m.SupportPage })));
const SettingsPage = React.lazy(() => import('@/features/settings').then(m => ({ default: m.SettingsPage })));
const ProfilePage = React.lazy(() => import('@/features/profile').then(m => ({ default: m.ProfilePage })));

/** Map route paths to their lazy components */
const ROUTE_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  '/atlas/bacteriology': BacteriologyPage,
  '/atlas/mycology': MycologyPage,
  '/lab/quickshare': QuickSharePage,
  '/lab/notes': NotesPage,
  '/lab/contacts': ContactsPage,
  '/lab/notifications': NotificationsPage,
  '/lab/support': SupportPage,
  '/settings': SettingsPage,
  '/profile': ProfilePage,
};

// ─── Split Pane Content (renders the module for a given path) ───────────

function SplitPaneContent({ path }: { path: string }) {
  const { t } = useTranslation();
  const Component = ROUTE_COMPONENTS[path];

  if (!Component) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <Columns2 className="h-5 w-5 mr-2 opacity-50" />
        {t('editorGroups.moduleNotAvailable', 'Module non disponible en vue scindée')}
      </div>
    );
  }

  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <Component />
    </React.Suspense>
  );
}

// ─── Empty Split State ──────────────────────────────────────────────────

function EmptySplitState() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
      <div>
        <Columns2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-xs">
          {t('editorGroups.splitEmpty', 'Glissez un onglet ici ou utilisez le clic droit → Diviser')}
        </p>
      </div>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────

export function SplitEditorPane({ externalDnd }: { externalDnd?: boolean }) {
  const splitActive = useEditorGroupsStore((s) => s.splitActive);
  const splitGroup = useEditorGroupsStore((s) => s.groups.find(g => g.id === 'split'));
  const allTabs = useTabsStore((s) => s.tabs);
  const { showBreadcrumbs } = useWorkspaceStore();
  const hasModuleToolbar = useModuleToolbarStore((s) => !!s.registration);
  const hasModuleFilters = useModuleFiltersStore((s) => s.hasAnyRegistration());

  if (!splitActive || !splitGroup) return null;

  // Resolve the active tab's path
  const activeTab = allTabs.find(tab => tab.id === splitGroup.activeTabId);
  const activePath = activeTab?.path ?? null;
  const isModuleRoute = activePath ? /^\/(?:atlas|lab)\/.+/.test(activePath) : false;
  const showToolbarRow = showBreadcrumbs || hasModuleToolbar || hasModuleFilters || isModuleRoute;

  return (
    <EditorGroupProvider groupId="split">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TabBar editorGroupId="split" externalDnd={externalDnd} />

        {/* Breadcrumbs + Outils row — mirrors the main editor group */}
        {showToolbarRow && (
          <div className="relative z-30 shrink-0 flex items-center gap-2 px-4 py-1.5 border-b border-border/40 bg-card/85 backdrop-blur-sm min-h-8">
            {showBreadcrumbs && activePath && (
              <Breadcrumbs className="min-w-0" pathOverride={activePath} />
            )}
            <ModuleToolbar className={showBreadcrumbs ? 'ml-auto' : ''} forceVisible={isModuleRoute} />
          </div>
        )}

        {activePath ? (
          <main style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            <SplitPaneContent path={activePath} />
          </main>
        ) : (
          <EmptySplitState />
        )}
      </div>
    </EditorGroupProvider>
  );
}
