'use client';

import { LazyExoticComponent, Suspense, lazy, type ComponentType } from 'react';

import { useTranslation } from 'react-i18next';
import { Columns2 } from 'lucide-react';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useTabsStore } from '@/stores';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { EditorGroupProvider } from './editor-group-context';
import { ModuleToolbar, ToolbarSearch } from '@/components/common/module-toolbar';
import { TabBar } from '@/components/common/tab-bar';
import { registry } from '@/lib/module-registry';

// ═══════════════════════════════════════════════════════════════════════════
// SPLIT EDITOR PANE — Secondary editor panel for VS Code-style split view
//
// Renders the active tab of the 'split' editor group as a lazy-loaded page.
// Has its own mini tab bar, and shows an empty state when no tabs are assigned.
//
// Architecture:
//   - Module components are resolved from the registry (no hardcoded list)
//   - Non-module pages (settings, profile) have their own lazy entries
//   - Each tab in the split group can be activated / closed / moved back
// ═══════════════════════════════════════════════════════════════════════════

// Non-module pages that can appear in split view
const SettingsPage = lazy(() => import('@/features/settings').then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('@/features/profile').then(m => ({ default: m.ProfilePage })));

const SYSTEM_ROUTE_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  '/settings': SettingsPage,
  '/profile': ProfilePage,
};

/**
 * Resolve a route path to its lazy component.
 * Checks the module registry first, then system routes.
 */
function resolveRouteComponent(path: string): LazyExoticComponent<ComponentType> | undefined {
  const moduleDef = registry.getByRoute(path);
  if (moduleDef) return moduleDef.route.element;
  return SYSTEM_ROUTE_COMPONENTS[path];
}

// ─── Split Pane Content (renders the module for a given path) ───────────

function SplitPaneContent({ path }: { path: string }) {
  const { t } = useTranslation();
  const Component = resolveRouteComponent(path);

  if (!Component) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <Columns2 className="h-5 w-5 mr-2 opacity-50" />
        {t('editorGroups.moduleNotAvailable', 'Module non disponible en vue scindée')}
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <Component />
    </Suspense>
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
  const hasModuleToolbar = useModuleToolbarStore((s) => !!s.registration);
  const hasModuleFilters = useModuleFiltersStore((s) => s.hasAnyRegistration());
  const hasToolbarSearch = useModuleFiltersStore((s) => !!s.toolbarSearch);

  if (!splitActive || !splitGroup) return null;

  // Resolve the active tab's path
  const activeTab = allTabs.find(tab => tab.id === splitGroup.activeTabId);
  const activePath = activeTab?.path ?? null;
  const showToolbarRow = hasModuleToolbar || hasModuleFilters || hasToolbarSearch;

  return (
    <EditorGroupProvider groupId="split">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TabBar editorGroupId="split" externalDnd={externalDnd} />

        {/* ToolbarRow — contextual module tools for split pane */}
        {showToolbarRow && (
          <div className="relative z-30 shrink-0 flex items-center gap-2 px-4 py-1.5 border-b border-border/40 surface-high min-h-8">
            <ToolbarSearch />
            <ModuleToolbar className="ml-auto" />
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
