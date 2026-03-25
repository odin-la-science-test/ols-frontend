import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useModuleLayout } from '@/components/modules/layout/module-layout';
import { useEditorGroupId } from '@/components/common/editor-group-context';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import type { SidebarSectionMeta } from '@/stores/module-filters-store';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useWorkspaceStore, useTabsStore } from '@/stores';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useModulePersistence } from './use-module-persistence';
import { captureWorkspaceSnapshot, applyWorkspaceSnapshot, getSnapshotKey } from '@/lib/workspace-snapshot';
import { usePlatform } from '@/contexts/platform-context';
import { PLATFORMS } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// USE MODULE SHELL — Centralizes all shell integration for collection modules
//
// Extracts duplicated logic from ModulePageTemplate + CrudListLayout:
//   - Desktop/mobile detection
//   - Detail/filters/panel store registration
//   - Module persistence (save/restore state)
//   - Workspace snapshot capture/restore
//   - External close detection
//   - Visit tracking (addRecent, addTab)
//
// Used by CollectionLayout (and potentially SettingsLayout).
// ═══════════════════════════════════════════════════════════════════════════

export interface UseModuleShellOptions {
  moduleKey: string;
  title: string;
  iconName: string;
  hasDetail?: boolean;
  sidebarSections?: SidebarSectionMeta[];
}

export interface ModuleShellReturn {
  // Layout
  isDesktop: boolean;
  editorGroupId: string;

  // Detail panel
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
  detailPortalTarget: HTMLDivElement | null;

  // Filters
  filterPortalTarget: HTMLDivElement | null;

  // Persistence
  moduleKey: string;
  persistRef: React.MutableRefObject<Partial<Record<string, unknown>>>;
  savedState: Record<string, unknown> | undefined;
  restoreItem: <I extends { id: number }>(
    items: I[] | undefined,
    setItem: (item: I) => void,
    onNotFound?: () => void,
  ) => void;

  // Toolbar
  registerToolbar: (reg: { moduleKey: string; actions: import('@/lib/module-registry/types').ModuleAction[] }) => void;
  unregisterToolbar: (moduleKey: string) => void;

  // Helpers
  closeSidebarIfMobile: () => void;
  accentColor: string;
}

export function useModuleShell({
  moduleKey,
  title,
  iconName,
  hasDetail = true,
  sidebarSections = [],
}: UseModuleShellOptions): ModuleShellReturn {
  const hasSidebar = sidebarSections.length > 0;
  const { t } = useTranslation();
  const { setSidebarOpen, accentColor } = useModuleLayout();

  // ── Desktop/mobile ──
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // ── Editor group ──
  const editorGroupId = useEditorGroupId();

  // ── Platform accent ──
  const platformId = usePlatform();
  const resolvedAccent = platformId ? PLATFORMS[platformId].accent : accentColor;

  // ── Store selectors ──
  const registerFilters = useModuleFiltersStore((s) => s.register);
  const unregisterFilters = useModuleFiltersStore((s) => s.unregister);
  const registerDetail = useModuleDetailStore((s) => s.register);
  const unregisterDetail = useModuleDetailStore((s) => s.unregister);
  const setDetailStoreOpen = useModuleDetailStore((s) => s.setOpen);
  const registerToolbar = useModuleToolbarStore((s) => s.register);
  const unregisterToolbar = useModuleToolbarStore((s) => s.unregister);
  const closeZone = usePanelRegistryStore((s) => s.closeZone);
  const setZoneStack = usePanelRegistryStore((s) => s.setZoneStack);
  const registerPanel = usePanelRegistryStore((s) => s.registerPanel);

  // ── Portal targets ──
  const filterPortalTarget = useModuleFiltersStore((s) => s.portalTargets[editorGroupId] ?? null);
  const detailPortalTarget = useModuleDetailStore((s) => s.portalTargets[editorGroupId] ?? null);

  // ── Persistence ──
  const { saved: savedState, stateRef: persistRef, restoreItem } = useModulePersistence(moduleKey);

  // ── Detail open state ──
  const [detailOpen, setDetailOpen] = useState(!!savedState?.selectedItemId || !!savedState?.formMode);

  // ── Visit tracking ──
  const addRecent = useWorkspaceStore((s) => s.addRecent);
  const addTab = useTabsStore((s) => s.addTab);

  useEffect(() => {
    const path = window.location.pathname;
    addRecent({ path, title, icon: iconName });
    addTab({ path, title, icon: iconName });
  }, [addRecent, addTab, title, iconName]);

  // ── Registration effect (mount/unmount) ──
  useEffect(() => {
    if (hasSidebar) {
      registerFilters({ moduleKey, moduleTitle: title, accentColor: resolvedAccent, content: null, sidebarSections }, editorGroupId);
    }
    if (hasDetail) {
      registerDetail({ moduleKey, moduleTitle: title, accentColor: resolvedAccent, isOpen: !!savedState?.selectedItemId || !!savedState?.formMode }, editorGroupId);
    }

    // Register tools panel in primary sidebar (only if sidebar has sections)
    if (hasSidebar) {
      const dynamicLabel = sidebarSections.length === 1
        ? t(sidebarSections[0].labelKey)
        : t('activityBar.modulePanel');
      registerPanel({
        id: 'tools',
        label: dynamicLabel,
        icon: 'sliders-horizontal',
        accentColor: resolvedAccent,
        category: 'module',
        zone: 'primary',
        priority: 10,
      });
    }

    // ── Restore workspace snapshot ──
    const isSplit = useEditorGroupsStore.getState().splitActive;
    const snapshotKey = getSnapshotKey(moduleKey, isSplit);
    const savedSnapshot = useWorkspaceStore.getState().getModuleSnapshot(snapshotKey);

    if (savedSnapshot) {
      applyWorkspaceSnapshot(savedSnapshot);
    } else if (hasSidebar) {
      const wasOpen = useModuleFiltersStore.getState().filterPanelOpen[moduleKey] ?? false;
      if (wasOpen) {
        const toolsZone = usePanelRegistryStore.getState().getZoneForPanel('tools', 'primary');
        setZoneStack(toolsZone, ['tools']);
      } else {
        const toolsZone = usePanelRegistryStore.getState().getZoneForPanel('tools', 'primary');
        const pZone = usePanelRegistryStore.getState().zones[toolsZone];
        const current = pZone.isOpen ? pZone.activeTab : null;
        if (current === 'tools') closeZone(toolsZone);
      }
    }

    return () => {
      // Save workspace snapshot
      const isSplitOnUnmount = useEditorGroupsStore.getState().splitActive;
      const unmountKey = getSnapshotKey(moduleKey, isSplitOnUnmount);
      const snapshot = captureWorkspaceSnapshot(isSplitOnUnmount);
      useWorkspaceStore.getState().saveModuleSnapshot(unmountKey, snapshot);

      // Save filter panel state
      if (hasSidebar) {
        const toolsZone = usePanelRegistryStore.getState().getZoneForPanel('tools', 'primary');
        const pZone = usePanelRegistryStore.getState().zones[toolsZone];
        const current = pZone.isOpen ? pZone.activeTab : null;
        useModuleFiltersStore.getState().setFilterPanelOpen(moduleKey, current === 'tools');
        unregisterFilters(moduleKey, editorGroupId);
      }

      if (hasDetail) {
        unregisterDetail(moduleKey, editorGroupId);
      }

      unregisterToolbar(moduleKey);

      // Close tools panel (only if we registered it)
      if (hasSidebar) {
        const toolsZone = usePanelRegistryStore.getState().getZoneForPanel('tools', 'primary');
        const pZone = usePanelRegistryStore.getState().zones[toolsZone];
        const current = pZone.isOpen ? pZone.activeTab : null;
        if (current === 'tools') closeZone(toolsZone);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey, title, resolvedAccent, editorGroupId]);

  // ── Sync detail open → store ──
  useEffect(() => {
    if (hasDetail) {
      setDetailStoreOpen(moduleKey, detailOpen, editorGroupId);
    }
  }, [detailOpen, moduleKey, editorGroupId, setDetailStoreOpen, hasDetail]);

  // ── External close detection ──
  const storeIsOpen = useModuleDetailStore((s) => s.registrations[editorGroupId]?.isOpen ?? false);
  const prevStoreIsOpenRef = useRef(storeIsOpen);
  useEffect(() => {
    if (!hasDetail) return;
    const wasOpen = prevStoreIsOpenRef.current;
    prevStoreIsOpenRef.current = storeIsOpen;
    if (wasOpen && !storeIsOpen && detailOpen) {
      setDetailOpen(false);
    }
  }, [storeIsOpen, detailOpen, hasDetail]);

  // ── Close sidebar on mobile ──
  const closeSidebarIfMobile = useCallback(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [isDesktop, setSidebarOpen]);

  return useMemo(() => ({
    isDesktop,
    editorGroupId,
    detailOpen,
    setDetailOpen,
    detailPortalTarget,
    filterPortalTarget,
    moduleKey,
    persistRef,
    savedState: savedState as Record<string, unknown> | undefined,
    restoreItem,
    registerToolbar,
    unregisterToolbar,
    closeSidebarIfMobile,
    accentColor: resolvedAccent,
  }), [
    isDesktop, editorGroupId, detailOpen, detailPortalTarget, filterPortalTarget,
    moduleKey, persistRef, savedState, restoreItem,
    registerToolbar, unregisterToolbar, closeSidebarIfMobile, resolvedAccent,
  ]);
}
