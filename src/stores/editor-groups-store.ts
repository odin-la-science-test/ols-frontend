import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// EDITOR GROUPS STORE - Multi-module split view à la VS Code
// Allows viewing 2 modules side-by-side in a split layout.
// Each group has its own active tab. The router follows the focused group.
// Persisté en localStorage
// ═══════════════════════════════════════════════════════════════════════════

export type SplitDirection = 'horizontal' | 'vertical';

export interface EditorGroup {
  id: string;
  /** Tab ID currently active in this group */
  activeTabId: string | null;
  /** Tab IDs assigned to this group */
  tabIds: string[];
}

interface EditorGroupsState {
  /** Whether split view is active */
  splitActive: boolean;
  /** Split direction */
  splitDirection: SplitDirection;
  /** Editor groups (1 = normal, 2 = split) */
  groups: EditorGroup[];
  /** ID of the focused (active) group */
  focusedGroupId: string;
  /** Panel sizes as percentages (persisted) */
  panelSizes: number[];

  // Actions
  enableSplit: (direction?: SplitDirection) => void;
  disableSplit: () => void;
  toggleSplit: () => void;
  setSplitDirection: (direction: SplitDirection) => void;
  setFocusedGroup: (groupId: string) => void;
  moveTabToGroup: (tabId: string, targetGroupId: string) => void;
  setGroupActiveTab: (groupId: string, tabId: string) => void;
  addTabToGroup: (groupId: string, tabId: string) => void;
  removeTabFromGroup: (groupId: string, tabId: string) => void;
  setPanelSizes: (sizes: number[]) => void;
}

const DEFAULT_GROUP_ID = 'main';
const SPLIT_GROUP_ID = 'split';

const createDefaultGroups = (): EditorGroup[] => [
  { id: DEFAULT_GROUP_ID, activeTabId: null, tabIds: [] },
];

export const useEditorGroupsStore = create<EditorGroupsState>()(
  persist(
    (set, get) => ({
      splitActive: false,
      splitDirection: 'horizontal',
      groups: createDefaultGroups(),
      focusedGroupId: DEFAULT_GROUP_ID,
      panelSizes: [50, 50],

      enableSplit: (direction) => {
        const state = get();
        if (state.splitActive) return;

        const newDir = direction ?? state.splitDirection;
        const mainGroup = state.groups.find((g) => g.id === DEFAULT_GROUP_ID);

        set({
          splitActive: true,
          splitDirection: newDir,
          groups: [
            mainGroup ?? { id: DEFAULT_GROUP_ID, activeTabId: null, tabIds: [] },
            { id: SPLIT_GROUP_ID, activeTabId: null, tabIds: [] },
          ],
        });
      },

      disableSplit: () => {
        const state = get();
        const mainGroup = state.groups.find((g) => g.id === DEFAULT_GROUP_ID);
        const splitGroup = state.groups.find((g) => g.id === SPLIT_GROUP_ID);

        // Merge split tabs back into main
        const mergedTabIds = [
          ...(mainGroup?.tabIds ?? []),
          ...(splitGroup?.tabIds ?? []),
        ];

        set({
          splitActive: false,
          focusedGroupId: DEFAULT_GROUP_ID,
          groups: [
            {
              id: DEFAULT_GROUP_ID,
              activeTabId: mainGroup?.activeTabId ?? splitGroup?.activeTabId ?? null,
              tabIds: mergedTabIds,
            },
          ],
        });
      },

      toggleSplit: () => {
        const state = get();
        if (state.splitActive) {
          state.disableSplit();
        } else {
          state.enableSplit();
        }
      },

      setSplitDirection: (direction) => set({ splitDirection: direction }),

      setFocusedGroup: (groupId) => set({ focusedGroupId: groupId }),

      moveTabToGroup: (tabId, targetGroupId) => {
        set((state) => {
          const newGroups = state.groups.map((g) => {
            // Remove from current group
            const filtered = g.tabIds.filter((id) => id !== tabId);
            const wasActive = g.activeTabId === tabId;
            return {
              ...g,
              tabIds: g.id === targetGroupId ? [...filtered, tabId] : filtered,
              activeTabId:
                g.id === targetGroupId
                  ? tabId
                  : wasActive
                  ? (filtered[0] ?? null)
                  : g.activeTabId,
            };
          });

          return { groups: newGroups, focusedGroupId: targetGroupId };
        });
      },

      setGroupActiveTab: (groupId, tabId) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, activeTabId: tabId } : g
          ),
        }));
      },

      addTabToGroup: (groupId, tabId) => {
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id !== groupId) return g;
            if (g.tabIds.includes(tabId)) return { ...g, activeTabId: tabId };
            return { ...g, tabIds: [...g.tabIds, tabId], activeTabId: tabId };
          }),
        }));
      },

      removeTabFromGroup: (groupId, tabId) => {
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id !== groupId) return g;
            const newTabIds = g.tabIds.filter((id) => id !== tabId);
            return {
              ...g,
              tabIds: newTabIds,
              activeTabId: g.activeTabId === tabId ? (newTabIds[0] ?? null) : g.activeTabId,
            };
          }),
        }));
      },

      setPanelSizes: (sizes) => set({ panelSizes: sizes }),
    }),
    {
      name: 'ols-editor-groups',
      version: 1,
    }
  )
);
