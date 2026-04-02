'use client';

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { useActivityBarStore } from '@/stores/activity-bar-store';
import { SidebarPortalZone } from '@/components/common/sidebar-portal-zone';
import { registry } from '@/lib/module-registry';
import { useAuthStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// APP PANEL BRIDGE — Registers app-level panels and module-contributed
// activity panels into the unified panel-registry-store, and provides a
// renderPanel() function used by UnifiedSidebar on both sides.
//
// App panels: explorer (always registered)
// Module activity panels: registered dynamically from module definitions
// Module panels: tools (filters), detail (registered dynamically by modules)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Lazy imports for core panel content ─────────────────────────────────

const ExplorerPanel = lazy(() =>
  import('@/components/common/global-sidebar').then((m) => ({ default: m.ExplorerPanel }))
);
const FiltersPanel = lazy(() =>
  import('@/components/common/global-sidebar').then((m) => ({ default: m.FiltersPanel }))
);
const HistoryPanel = lazy(() =>
  import('@/components/common/history-panel').then((m) => ({ default: m.HistoryPanel }))
);

// ─── Panel title resolution ────────────────────────────────────────────

/** Résout la clé de traduction d'un panel depuis le registry (pas de hardcoding de modules). */
export function getPanelTitleKey(panelId: string): string {
  const panel = usePanelRegistryStore.getState().panels[panelId];
  if (panel?.label) return panel.label;
  return panelId;
}

// ─── App panel registration hook ────────────────────────────────────────

/**
 * Registers built-in app-level panels and module-contributed activity panels on mount.
 * Call this once in AppShell.
 */
export function useRegisterAppPanels() {
  const { t } = useTranslation();
  const registerPanel = usePanelRegistryStore((s) => s.registerPanel);
  const mergeModuleItems = useActivityBarStore((s) => s.mergeModuleItems);

  useEffect(() => {
    // Register core app-level panels
    registerPanel({
      id: 'explorer',
      label: t('activityBar.explorer'),
      icon: 'file',
      category: 'app',
      zone: 'activity-panel',
      priority: 10,
    });
    registerPanel({
      id: 'history',
      label: t('activityBar.history'),
      icon: 'history',
      category: 'app',
      zone: 'activity-panel',
      priority: 15,
    });

    // Register module-contributed activity panels from the registry
    // Guests only see panels from modules with guestAccess: 'read'
    const isGuest = useAuthStore.getState().user?.role === 'GUEST';
    const activityPanels = registry.getActivityPanels()
      .filter(({ module }) => !isGuest || module.guestAccess === 'read');
    const moduleBarItems = activityPanels.map(({ module, panel }) => {
      const panelId = panel.id ?? module.id;
      registerPanel({
        id: panelId,
        label: t(panel.titleKey),
        icon: panel.icon,
        accentColor: module.accentColor,
        category: 'app',
        zone: 'activity-panel',
        priority: panel.priority ?? 50,
        renderComponent: panel.component,
      });
      return { id: panelId, icon: panel.icon, path: '', visible: true, type: 'panel' as const };
    });

    // Merge module items into the activity bar store (before settings)
    if (moduleBarItems.length > 0) {
      mergeModuleItems(moduleBarItems);
    }

    // Module-level filters panel → primary sidebar
    registerPanel({
      id: 'tools',
      label: t('activityBar.modulePanel'),
      icon: 'sliders-horizontal',
      category: 'module',
      zone: 'primary',
      priority: 10,
    });
  }, [registerPanel, mergeModuleItems, t]);
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

  const isAnyOpen = useMemo(
    () => Object.values(registrations).some((r) => r?.isOpen),
    [registrations],
  );

  // Sync module-detail-store → panel-registry (open/close detail in zone)
  useEffect(() => {
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

  // Reverse sync: panel-registry → module-detail-store
  // When the zone is closed externally (zone X button), propagate back to module detail store
  // so the module page knows the detail is no longer visible.
  const detailZone = usePanelRegistryStore((s) => s.getZoneForPanel('detail', 'secondary'));
  const zoneHasDetail = usePanelRegistryStore((s) => {
    const z = s.zones[detailZone];
    return z?.isOpen && z.stack.includes('detail');
  });

  const prevZoneHasDetailRef = useRef(zoneHasDetail);
  useEffect(() => {
    const hadDetail = prevZoneHasDetailRef.current;
    prevZoneHasDetailRef.current = zoneHasDetail;
    // Only react to true → false transition (external close), not initial mount or open
    if (hadDetail && !zoneHasDetail) {
      const regs = useModuleDetailStore.getState().registrations;
      Object.entries(regs).forEach(([gid, reg]) => {
        if (reg?.isOpen) {
          useModuleDetailStore.getState().setOpen(reg.moduleKey, false, gid);
        }
      });
    }
  }, [zoneHasDetail]);
}

// ─── Detail panel content (portal-based) ────────────────────────────────

function DetailPanelContent() {
  const registrations = useModuleDetailStore((s) => s.registrations);
  const setPortalTarget = useModuleDetailStore((s) => s.setPortalTarget);
  const setOpen = useModuleDetailStore((s) => s.setOpen);

  // Find the first open registration
  const openEntries = Object.entries(registrations).filter(([, reg]) => reg?.isOpen);
  const firstEntry = openEntries[0] as [string, (typeof registrations)[string]] | undefined;
  const groupId = firstEntry?.[0];
  const registration = firstEntry?.[1];

  const handleClose = useCallback(() => {
    if (registration?.moduleKey && groupId) {
      setOpen(registration.moduleKey, false, groupId);
    }
  }, [registration, setOpen, groupId]);

  if (!groupId || !registration) return null;

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

const PanelFallback = () => (
  <div className="p-4 text-xs text-muted-foreground">Loading...</div>
);

/**
 * Renders panel content by ID. Used by UnifiedSidebar.
 * Core panels (explorer, tools, detail) are handled directly.
 * Module-contributed panels are resolved from the panel registry.
 */
export function usePanelRenderer() {
  const panels = usePanelRegistryStore((s) => s.panels);

  const renderPanel = useCallback((panelId: string): ReactNode => {
    // Core-owned panels
    if (panelId === 'explorer') {
      return <Suspense fallback={<PanelFallback />}><ExplorerPanel /></Suspense>;
    }
    if (panelId === 'history') {
      return <Suspense fallback={<PanelFallback />}><HistoryPanel /></Suspense>;
    }
    if (panelId === 'tools') {
      return <Suspense fallback={<PanelFallback />}><FiltersPanel /></Suspense>;
    }
    if (panelId === 'detail') {
      return <DetailPanelContent />;
    }

    // Registry-driven panels (module-contributed activity panels)
    const panel = panels[panelId];
    if (panel?.renderComponent) {
      const Component = panel.renderComponent;
      return <Suspense fallback={<PanelFallback />}><Component /></Suspense>;
    }

    return (
      <div className="p-4 text-xs text-muted-foreground">
        Unknown panel: {panelId}
      </div>
    );
  }, [panels]);

  return renderPanel;
}
