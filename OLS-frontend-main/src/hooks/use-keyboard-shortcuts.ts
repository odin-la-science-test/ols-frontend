import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCommandPaletteStore,
  useWorkspaceStore,
  useTabsStore,
  useActivityBarStore,
  useBottomPanelStore,
  useEditorGroupsStore,
} from '@/stores';
import { useHistoryStore } from '@/stores/history-store';
import { registry } from '@/lib/module-registry';
import {
  useKeybindingsStore,
  eventMatchesCombo,
  type KeybindingActionId,
} from '@/stores/keybindings-store';

// ═══════════════════════════════════════════════════════════════════════════
// USE KEYBOARD SHORTCUTS - Raccourcis clavier globaux
// Desktop only - Centralisé pour éviter les conflits
// Lit les bindings depuis le keybindings store (personnalisables par l'user)
// ═══════════════════════════════════════════════════════════════════════════

interface KeyboardShortcutsOptions {
  enabled?: boolean;
}

/**
 * Hook pour gérer tous les raccourcis clavier globaux de l'application.
 * Desktop only - Les raccourcis ne sont actifs que sur les écrans >= 1024px.
 * Les raccourcis sont lus depuis le keybindings store (personnalisables).
 *
 * Alt+A behaviour mirrors Windows Alt+Tab:
 *  - Quick press (Alt+A then release Alt): ping-pong between the two most recent tabs.
 *  - Hold Alt and press A repeatedly: cycle through tabs one by one.
 *  - Release Alt: confirm the current tab and memorise it for future ping-pong.
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { enabled = true } = options;
  const navigate = useNavigate();

  // Stores
  const { toggle: toggleCommandPalette, close: closeCommandPalette, isOpen: isCommandPaletteOpen } = useCommandPaletteStore();
  const { toggleTabBar, toggleFocusMode } = useWorkspaceStore();
  const { toggleActivityBar, togglePanel } = useActivityBarStore();
  const { tabs, goToTab } = useTabsStore();
  const { getEffectiveCombo, recordingActionId } = useKeybindingsStore();

  // ─── Alt+A tab-cycling state (like Alt+Tab on Windows) ───
  // When Alt is held and 'A' is pressed repeatedly, we cycle through tabs.
  // anchorTabId = the tab we were on BEFORE the cycling session started.
  // When Alt is released, the anchor becomes the lastActiveTabId for future ping-pong.
  const isCyclingRef = useRef(false);
  const anchorTabIdRef = useRef<string | null>(null);

  // Check if we're on desktop
  const isDesktop = useCallback(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  }, []);

  /** Navigate to the currently active tab */
  const navigateToActiveTab = useCallback(() => {
    const { tabs: currentTabs, activeTabId } = useTabsStore.getState();
    const active = currentTabs.find(tab => tab.id === activeTabId);
    if (active) navigate(active.path);
  }, [navigate]);

  // ─── Action handlers map ───
  const actionHandlers = useCallback((): Record<KeybindingActionId, () => void> => ({
    commandPalette: toggleCommandPalette,
    toggleTabBar,
    toggleSidebar: () => togglePanel('explorer'),
    toggleActivityBar,
    toggleFocusMode,
    nextTab: () => {
      useTabsStore.getState().goToNextTab();
      navigateToActiveTab();
    },
    previousTab: () => {
      useTabsStore.getState().goToPreviousTab();
      navigateToActiveTab();
    },
    lastTab: () => {
      // This is handled specially in handleKeyDown — see Alt+A cycling logic.
      // Fallback: simple ping-pong
      useTabsStore.getState().goToLastTab();
      navigateToActiveTab();
    },
    goToTab1: () => { if (tabs.length > 0) { goToTab(0); const t = tabs[0]; if (t) navigate(t.path); } },
    goToTab2: () => { if (tabs.length > 1) { goToTab(1); const t = tabs[1]; if (t) navigate(t.path); } },
    goToTab3: () => { if (tabs.length > 2) { goToTab(2); const t = tabs[2]; if (t) navigate(t.path); } },
    goToTab4: () => { if (tabs.length > 3) { goToTab(3); const t = tabs[3]; if (t) navigate(t.path); } },
    goToTab5: () => { if (tabs.length > 4) { goToTab(4); const t = tabs[4]; if (t) navigate(t.path); } },
    goToTab6: () => { if (tabs.length > 5) { goToTab(5); const t = tabs[5]; if (t) navigate(t.path); } },
    goToTab7: () => { if (tabs.length > 6) { goToTab(6); const t = tabs[6]; if (t) navigate(t.path); } },
    goToTab8: () => { if (tabs.length > 7) { goToTab(7); const t = tabs[7]; if (t) navigate(t.path); } },
    toggleBottomPanel: () => { useBottomPanelStore.getState().toggleVisible(); },
    toggleSplit: () => { useEditorGroupsStore.getState().toggleSplit(); },
    historyUndo: () => {
      const scope = registry.getByRoute(window.location.pathname)?.id ?? '__global__';
      useHistoryStore.getState().undo(scope);
    },
    historyRedo: () => {
      const scope = registry.getByRoute(window.location.pathname)?.id ?? '__global__';
      useHistoryStore.getState().redo(scope);
    },
    quickCapture: () => {
      // Ouvre le panel notes dans l'activity bar
      const abStore = useActivityBarStore.getState();
      abStore.togglePanel('notes');
      // Focus sur le champ de capture après un court délai (le panel doit s'ouvrir)
      setTimeout(() => {
        const input = document.querySelector('[data-quick-capture-input]') as HTMLElement;
        input?.focus();
      }, 100);
    },
  }), [toggleCommandPalette, toggleTabBar, togglePanel, toggleActivityBar, toggleFocusMode, tabs, goToTab, navigate, navigateToActiveTab]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if not on desktop
    if (!isDesktop()) return;

    // Skip if currently recording a new keybinding (let the recorder handle it)
    if (recordingActionId) return;

    // Skip if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Only allow Escape to close command palette
      if (event.key === 'Escape' && isCommandPaletteOpen) {
        event.preventDefault();
        closeCommandPalette();
      }
      return;
    }

    // ─── Escape (always hardcoded — not rebindable) ───
    if (event.key === 'Escape') {
      if (isCommandPaletteOpen) {
        event.preventDefault();
        closeCommandPalette();
      }
      return;
    }

    // ─── Special handling for lastTab (Alt+A cycling like Alt+Tab) ───
    const lastTabCombo = getEffectiveCombo('lastTab');
    if (eventMatchesCombo(event, lastTabCombo)) {
      event.preventDefault();
      const store = useTabsStore.getState();
      if (store.tabs.length <= 1) return;

      if (!isCyclingRef.current) {
        // First press: start cycling session
        isCyclingRef.current = true;
        anchorTabIdRef.current = store.activeTabId;

        // First action = go to last active tab (ping-pong)
        if (store.lastActiveTabId && store.tabs.some(t => t.id === store.lastActiveTabId)) {
          store.goToLastTab();
        } else {
          // No last tab memorised, just go to next
          store.goToNextTab();
        }
      } else {
        // Alt still held, subsequent presses: cycle to next tab
        store.goToNextTab();
      }

      navigateToActiveTab();
      return;
    }

    // ─── Match against all customizable keybindings ───
    const handlers = actionHandlers();
    const allActions: KeybindingActionId[] = [
      'commandPalette',
      'toggleSidebar',
      'toggleTabBar',
      'toggleActivityBar',
      'toggleFocusMode',
      'toggleBottomPanel',
      'toggleSplit',
      'nextTab', 'previousTab',
      // lastTab is handled above with special cycling logic
      'goToTab1', 'goToTab2', 'goToTab3', 'goToTab4',
      'goToTab5', 'goToTab6', 'goToTab7', 'goToTab8',
      'historyUndo', 'historyRedo',
      'quickCapture',
    ];

    for (const actionId of allActions) {
      const combo = getEffectiveCombo(actionId);
      if (eventMatchesCombo(event, combo)) {
        event.preventDefault();
        handlers[actionId]();
        return;
      }
    }
  }, [
    isDesktop,
    recordingActionId,
    isCommandPaletteOpen,
    closeCommandPalette,
    actionHandlers,
    getEffectiveCombo,
    navigateToActiveTab,
  ]);

  // ─── Handle Alt release: end cycling session ───
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    // When Alt is released and we were in a cycling session, commit the selection.
    // The anchor (where we started) becomes the lastActiveTabId for future ping-pong.
    if (event.key === 'Alt' && isCyclingRef.current) {
      isCyclingRef.current = false;
      const store = useTabsStore.getState();
      if (anchorTabIdRef.current && store.tabs.some(t => t.id === anchorTabIdRef.current)) {
        // Set lastActiveTabId to the anchor so next Alt+A ping-pongs back
        store.setActiveTab(store.activeTabId!); // no-op for active, but we need to set lastActive
        // Directly patch lastActiveTabId to the anchor
        useTabsStore.setState({ lastActiveTabId: anchorTabIdRef.current });
      }
      anchorTabIdRef.current = null;
    }
  }, []);

  // Register event listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);
}

export default useKeyboardShortcuts;
