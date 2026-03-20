'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { SidebarPortalZone } from '@/components/common/sidebar-portal-zone';

// ═══════════════════════════════════════════════════════════════════════════
// APP PANEL BRIDGE — Registers app-level panels and module panels
// into the unified panel-registry-store, and provides a renderPanel()
// function used by UnifiedSidebar on both sides.
//
// App panels: explorer, notes, notifications (always registered)
// Module panels: tools (filters), detail (registered dynamically by modules)
//
// This file also re-exports the panel content components from
// the old global-sidebar.tsx so they can be rendered anywhere.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Lazy imports for panel content (from global-sidebar internals) ─────
// We import them from global-sidebar where they're defined.
// These will be refactored to standalone files later if needed.

const ExplorerPanel = React.lazy(() =>
  import('@/components/common/global-sidebar').then((m) => ({ default: m.ExplorerPanel }))
);
const NotesPanel = React.lazy(() =>
  import('@/components/common/global-sidebar').then((m) => ({ default: m.NotesPanel }))
);
const NotificationsPanel = React.lazy(() =>
  import('@/components/common/global-sidebar').then((m) => ({ default: m.NotificationsPanel }))
);
const FiltersPanel = React.lazy(() =>
  import('@/components/common/global-sidebar').then((m) => ({ default: m.FiltersPanel }))
);

// ─── Panel titles (translation keys) ───────────────────────────────────

export const PANEL_TITLES: Record<string, string> = {
  explorer: 'activityBar.explorer',
  tools: 'activityBar.modulePanel',
  notes: 'notes.title',
  notifications: 'notifications.title',
};

// ─── App panel registration hook ────────────────────────────────────────

/**
 * Registers built-in app-level panels on mount.
 * Call this once in AppShell.
 */
export function useRegisterAppPanels() {
  const { t } = useTranslation();
  const registerPanel = usePanelRegistryStore((s) => s.registerPanel);

  React.useEffect(() => {
    // Register app-level panels in the activity-panel zone (flyout from activity bar)
    registerPanel({
      id: 'explorer',
      label: t('activityBar.explorer'),
      icon: 'file',
      category: 'app',
      zone: 'activity-panel',
      priority: 10,
    });
    registerPanel({
      id: 'notes',
      label: t('notes.title'),
      icon: 'notebook-pen',
      category: 'app',
      zone: 'activity-panel',
      priority: 20,
    });
    registerPanel({
      id: 'notifications',
      label: t('notifications.title'),
      icon: 'bell',
      category: 'app',
      zone: 'activity-panel',
      priority: 30,
    });
    // Module-level filters panel → primary sidebar
    registerPanel({
      id: 'tools',
      label: t('activityBar.modulePanel'),
      icon: 'sliders-horizontal',
      category: 'module',
      zone: 'primary',
      priority: 10,
    });
  }, [registerPanel, t]);
}

/**
 * Registers the module detail panel when a detail is opened.
 * Reads from module-detail-store and syncs to panel-registry.
 */
export function useRegisterDetailPanel() {
  const registerPanel = usePanelRegistryStore((s) => s.registerPanel);
  const unregisterPanel = usePanelRegistryStore((s) => s.unregisterPanel);
  const addToZone = usePanelRegistryStore((s) => s.addToZone);
  const removeFromZone = usePanelRegistryStore((s) => s.removeFromZone);
  const registrations = useModuleDetailStore((s) => s.registrations);

  const isAnyOpen = React.useMemo(
    () => Object.values(registrations).some((r) => r?.isOpen),
    [registrations],
  );

  React.useEffect(() => {
    if (isAnyOpen) {
      // Find the first open registration for label/accent
      const openReg = Object.values(registrations).find((r) => r?.isOpen);
      // Resolve zone: user may have moved 'detail' via DnD
      const detailZone = usePanelRegistryStore.getState().getZoneForPanel('detail', 'secondary');
      registerPanel({
        id: 'detail',
        label: openReg?.moduleTitle ?? 'Detail',
        icon: 'panel-right',
        accentColor: openReg?.accentColor,
        category: 'module',
        zone: detailZone,
        priority: 10,
        isPortal: true,
      });
      addToZone(detailZone, 'detail');
    } else {
      const detailZone = usePanelRegistryStore.getState().getZoneForPanel('detail', 'secondary');
      removeFromZone(detailZone, 'detail');
    }
  }, [isAnyOpen, registrations, registerPanel, unregisterPanel, addToZone, removeFromZone]);
}

// ─── Detail panel content (portal-based) ────────────────────────────────

function DetailPanelContent() {
  const registrations = useModuleDetailStore((s) => s.registrations);
  const setPortalTarget = useModuleDetailStore((s) => s.setPortalTarget);
  const setOpen = useModuleDetailStore((s) => s.setOpen);

  // Find the first open registration
  const openEntries = Object.entries(registrations).filter(([, reg]) => reg?.isOpen);

  if (openEntries.length === 0) return null;

  const [groupId, registration] = openEntries[0];

  const handleClose = React.useCallback(() => {
    if (registration?.moduleKey) {
      setOpen(registration.moduleKey, false, groupId);
    }
  }, [registration, setOpen, groupId]);

  return (
    <SidebarPortalZone
      groupId={groupId}
      registration={registration}
      setPortalTarget={setPortalTarget}
      onClose={handleClose}
      portalClassName="flex flex-col"
    />
  );
}

// ─── Unified panel renderer ─────────────────────────────────────────────

/**
 * Renders panel content by ID. Used by UnifiedSidebar.
 * Handles both app panels (hardcoded components) and module panels (portals).
 */
export function usePanelRenderer() {
  const renderPanel = React.useCallback((panelId: string): React.ReactNode => {
    switch (panelId) {
      case 'explorer':
        return (
          <React.Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading...</div>}>
            <ExplorerPanel />
          </React.Suspense>
        );
      case 'notes':
        return (
          <React.Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading...</div>}>
            <NotesPanel />
          </React.Suspense>
        );
      case 'notifications':
        return (
          <React.Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading...</div>}>
            <NotificationsPanel />
          </React.Suspense>
        );
      case 'tools':
        return (
          <React.Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading...</div>}>
            <FiltersPanel />
          </React.Suspense>
        );
      case 'detail':
        return <DetailPanelContent />;
      default:
        return (
          <div className="p-4 text-xs text-muted-foreground">
            Unknown panel: {panelId}
          </div>
        );
    }
  }, []);

  return renderPanel;
}
