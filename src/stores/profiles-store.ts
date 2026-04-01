import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemePresetId } from '@/lib/theme-presets';
import type { Density } from './theme-store';
import type { LayoutMode } from './workspace-store';
import type { WidgetConfig, ShortcutConfig } from './dashboard-store';
import type { ActivityBarItem, ActivityBarPosition } from './activity-bar-store';
import type { Tab } from './tabs-store';
// Direct store imports — safe because we only call .getState() / .setState()
// at runtime, never at module init time. Vite ESM handles the cycle fine.
import { useThemeStore } from './theme-store';
import { useWorkspaceStore } from './workspace-store';
import { useActivityBarStore } from './activity-bar-store';
import { useDashboardStore } from './dashboard-store';
import { useTabsStore } from './tabs-store';
import { useBottomPanelStore } from './bottom-panel-store';
import { useSidebarModeStore, type SidebarMode } from './sidebar-mode-store';

// ═══════════════════════════════════════════════════════════════════════════
// PROFILES STORE - Workspace Profiles à la VS Code
// Sauvegarde et restaure des configurations complètes de l'espace de travail
// Persisté en localStorage
//
// captureSnapshot() / applySnapshot() are centralised here so that
// every consumer (UserMenu, ActivityBar, CommandPalette, Settings)
// can call them without duplicating 30+ lines of store wiring.
//
// Auto-save: a cross-store subscriber watches theme, workspace,
// activityBar, dashboard & tabs stores and silently updates the
// active profile's snapshot whenever any of them change.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Profile Snapshot ───
// Captures the full workspace configuration at a point in time

export interface ProfileSnapshot {
  // Theme
  themePreset: ThemePresetId;
  density: Density;
  fontSize: number;
  // Workspace
  layoutMode: LayoutMode;
  globalSidebarOpen: boolean;
  tabBarVisible: boolean;
  showBreadcrumbs: boolean;
  statusBarVisible: boolean;
  menuBarVisible: boolean;
  // Activity Bar
  activityBarVisible: boolean;
  activityBarItems: ActivityBarItem[];
  activityBarPosition?: ActivityBarPosition;
  // Dashboard
  dashboardWidgets: WidgetConfig[];
  dashboardShortcuts: ShortcutConfig[];
  // Sidebar Modes
  primarySidebarMode?: SidebarMode;
  secondarySidebarMode?: SidebarMode;
  // Bottom Panel
  bottomPanelVisible: boolean;
  bottomPanelAlignment?: 'center' | 'left' | 'right' | 'justify';
  // Open tabs
  openTabs: Tab[];
  activeTabId: string | null;
}

export interface WorkspaceProfile {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  snapshot: ProfileSnapshot;
  createdAt: number;
  updatedAt: number;
  isDefault: boolean; // default profile cannot be deleted
}

export type ProfileIconId =
  | 'microscope'
  | 'bar-chart-3'
  | 'shield'
  | 'zap'
  | 'presentation'
  | 'flask-conical'
  | 'book-open'
  | 'monitor'
  | 'coffee'
  | 'sparkles';

export const PROFILE_ICONS: ProfileIconId[] = [
  'microscope',
  'bar-chart-3',
  'shield',
  'zap',
  'presentation',
  'flask-conical',
  'book-open',
  'monitor',
  'coffee',
  'sparkles',
];

interface ProfilesState {
  /** All saved profiles */
  profiles: WorkspaceProfile[];
  /** ID of the currently active profile (null = no profile active) */
  activeProfileId: string | null;
  _lastModified: number;

  // Actions
  /** Create a new profile from the current workspace state */
  createProfile: (name: string, icon: string, description: string, snapshot: ProfileSnapshot) => string;
  /** Update an existing profile's snapshot */
  updateProfileSnapshot: (id: string, snapshot: ProfileSnapshot) => void;
  /** Rename a profile */
  renameProfile: (id: string, name: string) => void;
  /** Update profile metadata (icon, description) */
  updateProfileMeta: (id: string, updates: { icon?: string; description?: string }) => void;
  /** Delete a profile (cannot delete default) */
  deleteProfile: (id: string) => void;
  /** Set the active profile ID */
  setActiveProfileId: (id: string | null) => void;
  /** Export a profile as JSON string */
  exportProfile: (id: string) => string | null;
  /** Import a profile from a JSON string, returns the new profile ID or null on error */
  importProfile: (json: string) => string | null;
  /** Reset to defaults (keeps only default profile) */
  resetToDefaults: () => void;
}

const generateProfileId = () => `profile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const DEFAULT_PROFILE_ID = 'default';

/** The built-in default profile — values match the app defaults */
function createDefaultProfile(): WorkspaceProfile {
  return {
    id: DEFAULT_PROFILE_ID,
    name: 'profiles.defaultName',
    icon: 'monitor',
    description: 'profiles.defaultDesc',
    snapshot: {
      themePreset: 'odin-dim',
      density: 'normal',
      fontSize: 14,
      layoutMode: 'classic',
      globalSidebarOpen: true,
      tabBarVisible: true,
      showBreadcrumbs: true,
      statusBarVisible: true,
      menuBarVisible: true,
      activityBarVisible: true,
      activityBarItems: [],
      activityBarPosition: 'left',
      dashboardWidgets: [
        { id: 'quick-shortcuts', visible: true },
        { id: 'recent-activity', visible: true },
        { id: 'latest-notes', visible: true },
        { id: 'notifications', visible: true },
      ],
      dashboardShortcuts: [],
      bottomPanelVisible: false,
      bottomPanelAlignment: 'center',
      openTabs: [],
      activeTabId: null,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  };
}

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set, get) => ({
      profiles: [createDefaultProfile()],
      activeProfileId: DEFAULT_PROFILE_ID,
      _lastModified: 0,

      createProfile: (name, icon, description, snapshot) => {
        const id = generateProfileId();
        const now = Date.now();
        const profile: WorkspaceProfile = {
          id,
          name,
          icon,
          description,
          snapshot,
          createdAt: now,
          updatedAt: now,
          isDefault: false,
        };
        // Also update the currently active profile's snapshot before switching away
        const currentId = get().activeProfileId;
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === currentId ? { ...p, snapshot, updatedAt: now } : p
          ).concat(profile),
          activeProfileId: id,
          _lastModified: Date.now(),
        }));
        return id;
      },

      updateProfileSnapshot: (id, snapshot) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id
              ? { ...p, snapshot, updatedAt: Date.now() }
              : p
          ),
        }));
      },

      renameProfile: (id, name) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p
          ),
          _lastModified: Date.now(),
        }));
      },

      updateProfileMeta: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
          _lastModified: Date.now(),
        }));
      },

      deleteProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (!profile || profile.isDefault) return;
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId:
            state.activeProfileId === id ? DEFAULT_PROFILE_ID : state.activeProfileId,
          _lastModified: Date.now(),
        }));
      },

      setActiveProfileId: (id) => {
        set({ activeProfileId: id });
      },

      exportProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (!profile) return null;
        // Strip internal fields for export
        const exportData = {
          name: profile.name,
          icon: profile.icon,
          description: profile.description,
          snapshot: profile.snapshot,
          exportedAt: Date.now(),
          version: 1,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importProfile: (json) => {
        try {
          const data = JSON.parse(json);
          // Validate minimum required fields
          if (!data.name || !data.snapshot) return null;
          if (typeof data.snapshot.themePreset !== 'string') return null;

          const id = generateProfileId();
          const now = Date.now();
          const profile: WorkspaceProfile = {
            id,
            name: data.name,
            icon: data.icon || 'sparkles',
            description: data.description || '',
            snapshot: data.snapshot,
            createdAt: now,
            updatedAt: now,
            isDefault: false,
          };
          set((state) => ({
            profiles: [...state.profiles, profile],
            _lastModified: Date.now(),
          }));
          return id;
        } catch {
          return null;
        }
      },

      resetToDefaults: () => {
        set({
          profiles: [createDefaultProfile()],
          activeProfileId: DEFAULT_PROFILE_ID,
          _lastModified: Date.now(),
        });
      },
    }),
    {
      name: 'ols-profiles',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          // v1 → v2: add openTabs + activeTabId to every profile snapshot
          if (Array.isArray(state.profiles)) {
            state.profiles = (state.profiles as WorkspaceProfile[]).map((p) => ({
              ...p,
              snapshot: {
                ...p.snapshot,
                openTabs: (p.snapshot as ProfileSnapshot).openTabs ?? [],
                activeTabId: (p.snapshot as ProfileSnapshot).activeTabId ?? null,
              },
            }));
          }
        }
        if (version < 3) {
          // v2 → v3: add layoutMode to every profile snapshot
          if (Array.isArray(state.profiles)) {
            state.profiles = (state.profiles as WorkspaceProfile[]).map((p) => ({
              ...p,
              snapshot: {
                ...p.snapshot,
                layoutMode: (p.snapshot as ProfileSnapshot).layoutMode ?? 'classic',
              },
            }));
          }
        }
        return state as unknown as ProfilesState;
      },
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// CENTRALISED HELPERS — used by UserMenu, ActivityBar, CommandPalette, etc.
// Import these instead of duplicating 30 lines in each component.
// ═══════════════════════════════════════════════════════════════════════════

/** Capture the current workspace state into a ProfileSnapshot */
export function captureSnapshot(): ProfileSnapshot {
  const theme = useThemeStore.getState();
  const workspace = useWorkspaceStore.getState();
  const activityBar = useActivityBarStore.getState();
  const dashboard = useDashboardStore.getState();
  const tabs = useTabsStore.getState();
  return {
    themePreset: theme.themePreset,
    density: theme.density,
    fontSize: theme.fontSize,
    layoutMode: workspace.layoutMode,
    globalSidebarOpen: workspace.globalSidebarOpen,
    tabBarVisible: workspace.tabBarVisible,
    showBreadcrumbs: workspace.showBreadcrumbs,
    statusBarVisible: workspace.statusBarVisible,
    menuBarVisible: workspace.menuBarVisible,
    activityBarVisible: activityBar.activityBarVisible,
    activityBarItems: activityBar.items,
    activityBarPosition: activityBar.position,
    dashboardWidgets: dashboard.widgets,
    dashboardShortcuts: dashboard.customShortcuts,
    bottomPanelVisible: useBottomPanelStore.getState().visible,
    bottomPanelAlignment: useBottomPanelStore.getState().alignment,
    primarySidebarMode: useSidebarModeStore.getState().primaryMode,
    secondarySidebarMode: useSidebarModeStore.getState().secondaryMode,
    openTabs: tabs.tabs,
    activeTabId: tabs.activeTabId,
  };
}

/** Apply a ProfileSnapshot to all stores */
export function applySnapshot(snapshot: ProfileSnapshot): void {
  _applyingSnapshot = true;
  try {
    // Theme
    const ts = useThemeStore.getState();
    ts.setThemePreset(snapshot.themePreset);
    ts.setDensity(snapshot.density);
    ts.setFontSize(snapshot.fontSize);

    // Workspace layout
    const ws = useWorkspaceStore.getState();
    if (snapshot.layoutMode) {
      ws.setLayoutMode(snapshot.layoutMode);
    }
    ws.setGlobalSidebarOpen(snapshot.globalSidebarOpen);
    ws.setTabBarVisible(snapshot.tabBarVisible);
    if (snapshot.showBreadcrumbs !== undefined) {
      ws.setShowBreadcrumbs(snapshot.showBreadcrumbs);
    }
    if (snapshot.statusBarVisible !== undefined) {
      ws.setStatusBarVisible(snapshot.statusBarVisible);
    }
    if (snapshot.menuBarVisible !== undefined) {
      ws.setMenuBarVisible(snapshot.menuBarVisible);
    }

    // Activity Bar
    useActivityBarStore.getState().setActivityBarVisible(snapshot.activityBarVisible);
    if (snapshot.activityBarItems?.length) {
      useActivityBarStore.setState({ items: snapshot.activityBarItems });
    }
    if (snapshot.activityBarPosition) {
      useActivityBarStore.getState().setPosition(snapshot.activityBarPosition);
    }

    // Dashboard
    if (snapshot.dashboardWidgets?.length) {
      useDashboardStore.setState({ widgets: snapshot.dashboardWidgets });
    }
    if (snapshot.dashboardShortcuts?.length) {
      useDashboardStore.setState({ customShortcuts: snapshot.dashboardShortcuts });
    }

    // Bottom Panel
    if (snapshot.bottomPanelVisible !== undefined) {
      useBottomPanelStore.getState().setVisible(snapshot.bottomPanelVisible);
    }
    if (snapshot.bottomPanelAlignment) {
      useBottomPanelStore.getState().setAlignment(snapshot.bottomPanelAlignment);
    }

    // Sidebar Modes
    if (snapshot.primarySidebarMode) {
      useSidebarModeStore.getState().setPrimaryMode(snapshot.primarySidebarMode);
    }
    if (snapshot.secondarySidebarMode) {
      useSidebarModeStore.getState().setSecondaryMode(snapshot.secondarySidebarMode);
    }

    // Tabs
    if (snapshot.openTabs) {
      useTabsStore.setState({ tabs: snapshot.openTabs, activeTabId: snapshot.activeTabId ?? null });
    }
  } finally {
    // Release guard after a tick so any synchronous subscriber fires get suppressed
    setTimeout(() => { _applyingSnapshot = false; }, 50);
  }
}

// ─── Auto-save: silently update active profile when stores change ───

let _autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
let _subscribed = false;
let _applyingSnapshot = false; // guard: don't auto-save while switching profiles

/** Debounced auto-save of the active profile snapshot */
function scheduleAutoSave() {
  if (_applyingSnapshot) return;
  if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => {
    if (_applyingSnapshot) return;
    const { activeProfileId } = useProfilesStore.getState();
    if (!activeProfileId) return;
    const snap = captureSnapshot();
    useProfilesStore.getState().updateProfileSnapshot(activeProfileId, snap);
  }, 2000);
}

/** Subscribe to all relevant stores so that the active profile auto-saves. */
function initAutoSave() {
  if (_subscribed) return;
  _subscribed = true;

  // Small delay to let all stores hydrate from localStorage
  setTimeout(() => {
    let themeReady = false;
    let workspaceReady = false;
    let activityBarReady = false;
    let dashboardReady = false;
    let tabsReady = false;

    useThemeStore.subscribe(() => {
      if (!themeReady) { themeReady = true; return; }
      scheduleAutoSave();
    });
    useWorkspaceStore.subscribe(() => {
      if (!workspaceReady) { workspaceReady = true; return; }
      scheduleAutoSave();
    });
    useActivityBarStore.subscribe(() => {
      if (!activityBarReady) { activityBarReady = true; return; }
      scheduleAutoSave();
    });
    useDashboardStore.subscribe(() => {
      if (!dashboardReady) { dashboardReady = true; return; }
      scheduleAutoSave();
    });
    useTabsStore.subscribe(() => {
      if (!tabsReady) { tabsReady = true; return; }
      scheduleAutoSave();
    });
  }, 500);
}

// Kick off auto-save subscriptions
initAutoSave();
