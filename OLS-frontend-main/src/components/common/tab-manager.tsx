'use client';

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTabsStore, useWorkspaceStore } from '@/stores';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { registry } from '@/lib/module-registry';

// ═══════════════════════════════════════════════════════════════════════════
// TAB MANAGER - Gestionnaire automatique des onglets
// Détecte la navigation et met à jour les onglets et l'historique
// Gère les modules API + les pages système (profil, paramètres)
// ═══════════════════════════════════════════════════════════════════════════

// Pages système qui ne viennent pas de l'API modules mais doivent
// quand même s'afficher comme des onglets
interface SystemPage {
  path: string;
  titleKey: string;
  icon: string;
}

const SYSTEM_PAGES: SystemPage[] = [
  { path: '/profile', titleKey: 'profile.title', icon: 'user' },
  { path: '/settings', titleKey: 'settingsPage.title', icon: 'settings' },
];

export function TabManager() {
  const location = useLocation();
  const { t } = useTranslation();
  // Track last processed path to avoid re-processing on unrelated re-renders
  const lastProcessedRef = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;

    // Build a stable key
    const processKey = path;
    
    // Skip if we already processed this exact state
    if (lastProcessedRef.current === processKey) return;
    lastProcessedRef.current = processKey;

    // Read store state directly (not via subscriptions) to avoid dependency loops
    const { tabs, activeTabId, addTab, setActiveTab } = useTabsStore.getState();
    const { addRecent } = useWorkspaceStore.getState();

    // Helper: find existing tab by path
    const findTab = (p: string) => tabs.find((tab) => tab.path === p);

    // Helper: activate tab only if it's not already active
    const activateIfNeeded = (tabId: string) => {
      if (activeTabId !== tabId) {
        setActiveTab(tabId);
      }
      // Keep main editor group in sync when split is active
      const { splitActive, setGroupActiveTab } = useEditorGroupsStore.getState();
      if (splitActive) {
        setGroupActiveTab('main', tabId);
      }
    };
    
    // 1) Vérifier les pages système d'abord
    const systemPage = SYSTEM_PAGES.find((sp) => path === sp.path);
    if (systemPage) {
      const existingTab = findTab(systemPage.path);
      if (existingTab) {
        activateIfNeeded(existingTab.id);
      } else {
        const newTabId = addTab({
          path: systemPage.path,
          title: t(systemPage.titleKey),
          icon: systemPage.icon,
        });
        // Sync main group when split is active
        const { splitActive, setGroupActiveTab } = useEditorGroupsStore.getState();
        if (splitActive) {
          setGroupActiveTab('main', newTabId);
        }
      }
      addRecent({
        path: systemPage.path,
        title: t(systemPage.titleKey),
        icon: systemPage.icon,
      });
      return;
    }
    
    // 2) Chercher si le path correspond à un module du registry
    const regMod = registry.getByRoute(path);
    if (!regMod) return;

    const moduleTitle = t(regMod.translationKey);

    // Find existing tab for this module by moduleId (supports drill-down)
    const existingTab = tabs.find((tab) => tab.moduleId === regMod.id);

    if (existingTab) {
      // Update path to reflect drill-down (same tab, new sub-page)
      if (existingTab.path !== path) {
        const { updateTab } = useTabsStore.getState();
        updateTab(existingTab.id, { path });
      }
      activateIfNeeded(existingTab.id);
    } else {
      const newTabId = addTab({
        path,
        title: moduleTitle,
        icon: regMod.icon,
        moduleId: regMod.id,
      });
      const { splitActive, setGroupActiveTab } = useEditorGroupsStore.getState();
      if (splitActive) {
        setGroupActiveTab('main', newTabId);
      }
    }

    addRecent({
      path: `/${regMod.route.path}`,
      title: moduleTitle,
      icon: regMod.icon,
    });
  }, [location.pathname, t]);

  return null;
}
