import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// TABS STORE - Système d'onglets professionnel
// Desktop only - Persisté en localStorage
// ═══════════════════════════════════════════════════════════════════════════

export interface Tab {
  id: string;
  path: string;
  title: string;
  icon: string;
  // Contexte de l'onglet pour reprise
  scrollPosition?: number;
  filters?: Record<string, string[]>;
  selectedItemId?: number | string;
  /** Pinned tabs are locked to the left and cannot be closed accidentally */
  pinned?: boolean;
  /** Tab group id for color-coded grouping (null = ungrouped) */
  groupId?: string | null;
}

/** Tab group definition */
export interface TabGroup {
  id: string;
  label: string;
  color: string; // Tailwind-compatible color key
}

/** Available group colors */
export const TAB_GROUP_COLORS = [
  { id: 'red', label: 'Red', value: 'rgb(239 68 68)' },
  { id: 'orange', label: 'Orange', value: 'rgb(249 115 22)' },
  { id: 'amber', label: 'Amber', value: 'rgb(245 158 11)' },
  { id: 'green', label: 'Green', value: 'rgb(34 197 94)' },
  { id: 'emerald', label: 'Emerald', value: 'rgb(16 185 129)' },
  { id: 'cyan', label: 'Cyan', value: 'rgb(6 182 212)' },
  { id: 'blue', label: 'Blue', value: 'rgb(59 130 246)' },
  { id: 'violet', label: 'Violet', value: 'rgb(139 92 246)' },
  { id: 'pink', label: 'Pink', value: 'rgb(236 72 153)' },
] as const;

export type TabGroupColorId = typeof TAB_GROUP_COLORS[number]['id'];

interface TabsState {
  // Onglets ouverts
  tabs: Tab[];
  // ID de l'onglet actif
  activeTabId: string | null;
  // ID du dernier onglet actif (pour Alt+Q ping-pong)
  lastActiveTabId: string | null;
  // Historique des onglets fermés pour restauration (max 10)
  closedTabs: Tab[];
  // Tab groups
  groups: TabGroup[];
  
  // Actions
  addTab: (tab: Omit<Tab, 'id'>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  
  // Pinning
  pinTab: (id: string) => void;
  unpinTab: (id: string) => void;
  togglePinTab: (id: string) => void;
  
  // Tab groups
  createGroup: (label: string, color: string) => string;
  removeGroup: (groupId: string) => void;
  assignTabToGroup: (tabId: string, groupId: string | null) => void;
  renameGroup: (groupId: string, label: string) => void;
  recolorGroup: (groupId: string, color: string) => void;
  
  // Navigation
  goToNextTab: () => void;
  goToPreviousTab: () => void;
  goToTab: (index: number) => void;
  goToLastTab: () => void;
  
  // Restauration
  restoreLastClosedTab: () => Tab | null;
  clearClosedTabs: () => void;
  
  // Utilitaires
  getTabByPath: (path: string) => Tab | undefined;
  isTabOpen: (path: string) => boolean;
  getActiveTab: () => Tab | undefined;
  closeOtherTabs: (id: string) => void;
  closeTabsToRight: (id: string) => void;
  closeAllTabs: () => void;
}

const MAX_CLOSED_HISTORY = 10;

// Génère un ID unique pour les onglets
const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      lastActiveTabId: null,
      closedTabs: [],
      groups: [],

      // ─── Ajouter un onglet ───
      addTab: (tabData) => {
        const state = get();
        
        // Si l'onglet existe déjà, l'activer
        const existingTab = state.tabs.find((t) => t.path === tabData.path);
        if (existingTab) {
          // Don't overwrite lastActiveTabId if this tab is already active
          if (existingTab.id === state.activeTabId) return existingTab.id;
          set({ activeTabId: existingTab.id, lastActiveTabId: state.activeTabId });
          return existingTab.id;
        }
        
        // Créer le nouvel onglet
        const newTab: Tab = {
          id: generateTabId(),
          ...tabData,
        };
        
        set((s) => ({
          tabs: [...s.tabs, newTab],
          activeTabId: newTab.id,
          lastActiveTabId: s.activeTabId,
        }));
        
        return newTab.id;
      },

      // ─── Supprimer un onglet ───
      removeTab: (id) => {
        set((state) => {
          const tabIndex = state.tabs.findIndex((t) => t.id === id);
          if (tabIndex === -1) return state;
          
          const tabToClose = state.tabs[tabIndex];
          // Pinned tabs cannot be closed via removeTab — must unpin first
          if (tabToClose.pinned) return state;
          const newTabs = state.tabs.filter((t) => t.id !== id);
          
          // Déterminer le nouvel onglet actif
          let newActiveId = state.activeTabId;
          let newLastActiveId = state.lastActiveTabId;

          // If we're closing the lastActive tab, clear it
          if (state.lastActiveTabId === id) {
            newLastActiveId = null;
          }

          if (state.activeTabId === id) {
            if (newTabs.length > 0) {
              // Prefer switching to the last active tab if it still exists
              if (newLastActiveId && newTabs.some((t) => t.id === newLastActiveId)) {
                newActiveId = newLastActiveId;
                newLastActiveId = null;
              } else {
                // Activer l'onglet précédent ou suivant
                const newIndex = Math.min(tabIndex, newTabs.length - 1);
                newActiveId = newTabs[newIndex].id;
              }
            } else {
              newActiveId = null;
            }
          }
          
          return {
            tabs: newTabs,
            activeTabId: newActiveId,
            lastActiveTabId: newLastActiveId,
            closedTabs: [tabToClose, ...state.closedTabs].slice(0, MAX_CLOSED_HISTORY),
          };
        });
      },

      // ─── Activer un onglet ───
      setActiveTab: (id) => {
        const state = get();
        if (state.tabs.some((t) => t.id === id) && id !== state.activeTabId) {
          set({ activeTabId: id, lastActiveTabId: state.activeTabId });
        }
      },

      // ─── Mettre à jour un onglet ───
      updateTab: (id, updates) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      // ─── Réorganiser les onglets ───
      reorderTabs: (fromIndex, toIndex) => {
        set((state) => {
          const newTabs = [...state.tabs];
          const [removed] = newTabs.splice(fromIndex, 1);
          newTabs.splice(toIndex, 0, removed);
          return { tabs: newTabs };
        });
      },

      // ─── Pinning ───
      pinTab: (id) => {
        set((state) => {
          const tabs = state.tabs.map((t) => t.id === id ? { ...t, pinned: true } : t);
          // Move pinned tab to end of pinned section
          const pinned = tabs.filter((t) => t.pinned);
          const unpinned = tabs.filter((t) => !t.pinned);
          return { tabs: [...pinned, ...unpinned] };
        });
      },

      unpinTab: (id) => {
        set((state) => {
          const tabs = state.tabs.map((t) => t.id === id ? { ...t, pinned: false } : t);
          // Maintain order: pinned first, then unpinned
          const pinned = tabs.filter((t) => t.pinned);
          const unpinned = tabs.filter((t) => !t.pinned);
          return { tabs: [...pinned, ...unpinned] };
        });
      },

      togglePinTab: (id) => {
        const tab = get().tabs.find((t) => t.id === id);
        if (tab?.pinned) {
          get().unpinTab(id);
        } else {
          get().pinTab(id);
        }
      },

      // ─── Tab Groups ───
      createGroup: (label, color) => {
        const groupId = `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        set((state) => ({
          groups: [...state.groups, { id: groupId, label, color }],
        }));
        return groupId;
      },

      removeGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          tabs: state.tabs.map((t) => t.groupId === groupId ? { ...t, groupId: null } : t),
        }));
      },

      assignTabToGroup: (tabId, groupId) => {
        set((state) => ({
          tabs: state.tabs.map((t) => t.id === tabId ? { ...t, groupId } : t),
        }));
      },

      renameGroup: (groupId, label) => {
        set((state) => ({
          groups: state.groups.map((g) => g.id === groupId ? { ...g, label } : g),
        }));
      },

      recolorGroup: (groupId, color) => {
        set((state) => ({
          groups: state.groups.map((g) => g.id === groupId ? { ...g, color } : g),
        }));
      },

      // ─── Navigation ───
      goToNextTab: () => {
        const state = get();
        if (state.tabs.length <= 1) return;
        
        const currentIndex = state.tabs.findIndex((t) => t.id === state.activeTabId);
        const nextIndex = (currentIndex + 1) % state.tabs.length;
        set({ activeTabId: state.tabs[nextIndex].id, lastActiveTabId: state.activeTabId });
      },

      goToPreviousTab: () => {
        const state = get();
        if (state.tabs.length <= 1) return;
        
        const currentIndex = state.tabs.findIndex((t) => t.id === state.activeTabId);
        const prevIndex = currentIndex <= 0 ? state.tabs.length - 1 : currentIndex - 1;
        set({ activeTabId: state.tabs[prevIndex].id, lastActiveTabId: state.activeTabId });
      },

      goToTab: (index) => {
        const state = get();
        if (index >= 0 && index < state.tabs.length) {
          set({ activeTabId: state.tabs[index].id, lastActiveTabId: state.activeTabId });
        }
      },

      // ─── Ping-pong : basculer vers le dernier onglet actif (Alt+Tab style) ───
      goToLastTab: () => {
        const state = get();
        if (!state.lastActiveTabId) return;
        // Only switch if the last tab still exists
        if (state.tabs.some((t) => t.id === state.lastActiveTabId)) {
          set({
            activeTabId: state.lastActiveTabId,
            lastActiveTabId: state.activeTabId,
          });
        }
      },

      // ─── Restauration ───
      restoreLastClosedTab: () => {
        const state = get();
        if (state.closedTabs.length === 0) return null;
        
        const [tabToRestore, ...remainingClosed] = state.closedTabs;
        
        // Vérifier si un onglet avec le même path existe déjà
        const existingTab = state.tabs.find((t) => t.path === tabToRestore.path);
        if (existingTab) {
          set({ activeTabId: existingTab.id, lastActiveTabId: state.activeTabId, closedTabs: remainingClosed });
          return existingTab;
        }
        
        // Restaurer l'onglet
        const restoredTab: Tab = {
          ...tabToRestore,
          id: generateTabId(),
        };
        
        set({
          tabs: [...state.tabs, restoredTab],
          activeTabId: restoredTab.id,
          lastActiveTabId: state.activeTabId,
          closedTabs: remainingClosed,
        });
        
        return restoredTab;
      },

      clearClosedTabs: () => {
        set({ closedTabs: [] });
      },

      // ─── Utilitaires ───
      getTabByPath: (path) => {
        return get().tabs.find((t) => t.path === path);
      },

      isTabOpen: (path) => {
        return get().tabs.some((t) => t.path === path);
      },

      getActiveTab: () => {
        const state = get();
        return state.tabs.find((t) => t.id === state.activeTabId);
      },

      closeOtherTabs: (id) => {
        set((state) => {
          const tabToKeep = state.tabs.find((t) => t.id === id);
          if (!tabToKeep) return state;
          
          const tabsToClose = state.tabs.filter((t) => t.id !== id);
          
          return {
            tabs: [tabToKeep],
            activeTabId: id,
            lastActiveTabId: null,
            closedTabs: [...tabsToClose, ...state.closedTabs].slice(0, MAX_CLOSED_HISTORY),
          };
        });
      },

      closeTabsToRight: (id) => {
        set((state) => {
          const tabIndex = state.tabs.findIndex((t) => t.id === id);
          if (tabIndex === -1) return state;

          const tabsToKeep = state.tabs.slice(0, tabIndex + 1);
          const tabsToClose = state.tabs.slice(tabIndex + 1).filter((t) => !t.pinned);

          // If the active tab is being closed, activate the clicked tab
          const activeIsClosing = tabsToClose.some((t) => t.id === state.activeTabId);

          return {
            tabs: [...tabsToKeep, ...state.tabs.slice(tabIndex + 1).filter((t) => t.pinned)],
            activeTabId: activeIsClosing ? id : state.activeTabId,
            lastActiveTabId: activeIsClosing ? null : state.lastActiveTabId,
            closedTabs: [...tabsToClose, ...state.closedTabs].slice(0, MAX_CLOSED_HISTORY),
          };
        });
      },

      closeAllTabs: () => {
        set((state) => ({
          tabs: state.tabs.filter((t) => t.pinned), // Keep pinned tabs
          activeTabId: state.tabs.find((t) => t.pinned)?.id ?? null,
          lastActiveTabId: null,
          closedTabs: [...state.tabs.filter((t) => !t.pinned), ...state.closedTabs].slice(0, MAX_CLOSED_HISTORY),
        }));
      },
    }),
    {
      name: 'ols-tabs',
      version: 2,
    }
  )
);
