import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkspaceSnapshot } from '@/lib/workspace-snapshot';


// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE STORE - Récents, épinglés et contexte de reprise
// Desktop only - Persisté en localStorage
// ═══════════════════════════════════════════════════════════════════════════

export interface RecentModule {
  path: string;
  title: string;
  icon: string;
  timestamp: number;
  /** 'navigation' (default) or 'action' — actions are toggle/settings-type items */
  type?: 'navigation' | 'action';
}

/**
 * État persisté par module — opaque au niveau du store.
 * Chaque layout/module définit son propre type via useModulePersistence<T>.
 * Le store ne fait que sérialiser/désérialiser du JSON.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleContext = Record<string, any>;

export type LayoutMode = 'ide' | 'classic';

interface WorkspaceState {
  // Mode de layout : classic (defaut) ou IDE (avance)
  layoutMode: LayoutMode;
  // Modules récents (max 6)
  recentModules: RecentModule[];
  // Modules épinglés (max 6)
  pinnedModules: string[];
  // Contexte sauvegardé par module (scroll, filtres, sélection)
  moduleContexts: Record<string, ModuleContext>;
  // Snapshots de layout par module (sauvegardés au changement de module)
  moduleSnapshots: Record<string, WorkspaceSnapshot>;
  // Sidebar globale ouverte
  globalSidebarOpen: boolean;
  // Barre d'onglets visible
  tabBarVisible: boolean;
  // Focus Mode - masque tout le chrome UI
  focusMode: boolean;
  // Breadcrumbs - fil d'Ariane contextuel
  showBreadcrumbs: boolean;
  // Status Bar - barre d'info contextuelle en bas
  statusBarVisible: boolean;
  // Menu Bar - barre de menus en haut
  menuBarVisible: boolean;
  
  // Actions
  addRecent: (module: Omit<RecentModule, 'timestamp'>) => void;
  removeRecent: (path: string) => void;
  clearRecents: () => void;
  
  togglePin: (path: string) => void;
  isPinned: (path: string) => boolean;
  reorderPinned: (fromIndex: number, toIndex: number) => void;
  
  saveModuleContext: (path: string, context: Partial<ModuleContext>) => void;
  getModuleContext: (path: string) => ModuleContext | undefined;
  clearModuleContext: (path: string) => void;

  saveModuleSnapshot: (key: string, snapshot: WorkspaceSnapshot) => void;
  getModuleSnapshot: (key: string) => WorkspaceSnapshot | undefined;
  
  setGlobalSidebarOpen: (open: boolean) => void;
  toggleGlobalSidebar: () => void;
  
  setTabBarVisible: (visible: boolean) => void;
  toggleTabBar: () => void;
  
  setFocusMode: (enabled: boolean) => void;
  toggleFocusMode: () => void;
  
  setShowBreadcrumbs: (show: boolean) => void;
  toggleBreadcrumbs: () => void;
  
  setStatusBarVisible: (visible: boolean) => void;
  toggleStatusBar: () => void;

  setMenuBarVisible: (visible: boolean) => void;
  toggleMenuBar: () => void;

  setLayoutMode: (mode: LayoutMode) => void;

  /** Layout du panneau Outils quand 2 groupes sont visibles: 'stacked' (empilé) ou 'tabs' (onglets) */
  sidebarFilterLayout: 'stacked' | 'tabs';
  toggleSidebarFilterLayout: () => void;
  /** Layout du panneau Détail quand 2 groupes sont visibles: 'stacked' (empilé) ou 'tabs' (onglets) */
  sidebarDetailLayout: 'stacked' | 'tabs';
  toggleSidebarDetailLayout: () => void;
}

const MAX_RECENT = 10;
const MAX_PINNED = 6;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      layoutMode: 'classic' as LayoutMode,
      recentModules: [],
      pinnedModules: [],
      moduleContexts: {},
      moduleSnapshots: {},
      globalSidebarOpen: true,
      tabBarVisible: true,
      focusMode: false,
      showBreadcrumbs: true,
      statusBarVisible: true,
      menuBarVisible: true,
      sidebarFilterLayout: 'stacked',
      sidebarDetailLayout: 'stacked',

      // ─── Récents ───
      addRecent: (module) => {
        set((state) => {
          // Ne pas ajouter si déjà épinglé (sauf les actions)
          if (!module.type && state.pinnedModules.includes(module.path)) {
            return state;
          }
          
          // Si déjà en tête des récents, ne rien changer (évite les re-renders)
          if (state.recentModules[0]?.path === module.path) {
            return state;
          }
          
          // Retirer si déjà présent dans les récents
          const filtered = state.recentModules.filter((m) => m.path !== module.path);
          
          // Ajouter en premier avec timestamp
          const newRecent: RecentModule = {
            ...module,
            timestamp: Date.now(),
          };
          
          // Limiter à MAX_RECENT
          const newRecents = [newRecent, ...filtered].slice(0, MAX_RECENT);
          
          return { recentModules: newRecents };
        });
      },

      removeRecent: (path) => {
        set((state) => ({
          recentModules: state.recentModules.filter((m) => m.path !== path),
        }));
      },

      clearRecents: () => {
        set({ recentModules: [] });
      },

      // ─── Épinglés ───
      togglePin: (path) => {
        set((state) => {
          const isPinned = state.pinnedModules.includes(path);
          
          if (isPinned) {
            // Retirer de épinglés
            return {
              pinnedModules: state.pinnedModules.filter((p) => p !== path),
            };
          } else {
            // Ajouter aux épinglés (si pas au max)
            if (state.pinnedModules.length >= MAX_PINNED) {
              return state; // Ne pas ajouter si max atteint
            }
            
            // Retirer des récents si présent
            const newRecents = state.recentModules.filter((m) => m.path !== path);
            
            return {
              pinnedModules: [...state.pinnedModules, path],
              recentModules: newRecents,
            };
          }
        });
      },

      isPinned: (path) => {
        return get().pinnedModules.includes(path);
      },

      reorderPinned: (fromIndex, toIndex) => {
        set((state) => {
          const newPinned = [...state.pinnedModules];
          const [removed] = newPinned.splice(fromIndex, 1);
          newPinned.splice(toIndex, 0, removed);
          return { pinnedModules: newPinned };
        });
      },

      // ─── Contexte de module ───
      saveModuleContext: (path, context) => {
        set((state) => ({
          moduleContexts: {
            ...state.moduleContexts,
            [path]: {
              ...state.moduleContexts[path],
              ...context,
            },
          },
        }));
      },

      getModuleContext: (path) => {
        return get().moduleContexts[path];
      },

      clearModuleContext: (path) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [path]: _removed, ...rest } = state.moduleContexts;
          return { moduleContexts: rest };
        });
      },

      saveModuleSnapshot: (key, snapshot) => {
        set((state) => ({
          moduleSnapshots: { ...state.moduleSnapshots, [key]: snapshot },
        }));
      },

      getModuleSnapshot: (key) => {
        return get().moduleSnapshots[key];
      },

      // ─── Sidebar globale ───
      setGlobalSidebarOpen: (open) => {
        set({ globalSidebarOpen: open });
      },

      toggleGlobalSidebar: () => {
        set((state) => ({ globalSidebarOpen: !state.globalSidebarOpen }));
      },

      // ─── Tab Bar ───
      setTabBarVisible: (visible) => {
        set({ tabBarVisible: visible });
      },

      toggleTabBar: () => {
        set((state) => ({ tabBarVisible: !state.tabBarVisible }));
      },

      // ─── Focus Mode ───
      setFocusMode: (enabled) => {
        set({ focusMode: enabled });
      },

      toggleFocusMode: () => {
        set((state) => ({ focusMode: !state.focusMode }));
      },

      // ─── Breadcrumbs ───
      setShowBreadcrumbs: (show) => {
        set({ showBreadcrumbs: show });
      },

      toggleBreadcrumbs: () => {
        set((state) => ({ showBreadcrumbs: !state.showBreadcrumbs }));
      },

      // ─── Status Bar ───
      setStatusBarVisible: (visible) => {
        set({ statusBarVisible: visible });
      },

      toggleStatusBar: () => {
        set((state) => ({ statusBarVisible: !state.statusBarVisible }));
      },

      // ─── Menu Bar ───
      setMenuBarVisible: (visible) => {
        set({ menuBarVisible: visible });
      },

      toggleMenuBar: () => {
        set((state) => ({ menuBarVisible: !state.menuBarVisible }));
      },

      // ─── Layout Mode ───
      setLayoutMode: (mode) => {
        set({ layoutMode: mode });
      },

      // ─── Sidebar Filter Layout ───
      toggleSidebarFilterLayout: () => {
        set((state) => ({
          sidebarFilterLayout: state.sidebarFilterLayout === 'stacked' ? 'tabs' : 'stacked',
        }));
      },

      // ─── Sidebar Detail Layout ───
      toggleSidebarDetailLayout: () => {
        set((state) => ({
          sidebarDetailLayout: state.sidebarDetailLayout === 'stacked' ? 'tabs' : 'stacked',
        }));
      },
    }),
    {
      name: 'ols-workspace',
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        const s = (persistedState ?? {}) as Record<string, unknown>;
        if (version < 2) {
          s.moduleSnapshots = {};
        }
        if (version < 3) {
          s.layoutMode = 'classic';
        }
        return s as unknown as WorkspaceState;
      },
    }
  )
);
