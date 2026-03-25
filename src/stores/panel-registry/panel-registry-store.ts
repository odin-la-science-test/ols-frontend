import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  PanelRegistryState,
  PanelZone,
  SidebarZoneState,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// PANEL REGISTRY STORE — Unified panel management for the workspace
//
// Every panel in the application (explorer, notes, notifications, module
// filters, module detail, etc.) is registered here. Each panel has a
// placement: which zone it currently lives in.
//
// Zones:
//   'activity-bar'  → flyout from the activity bar (app-level panels)
//   'primary'       → primary sidebar (left by default)
//   'secondary'     → secondary sidebar (right by default)
//
// The Activity Bar controls app-level panels (explorer, notes, notifs).
// The Sidebars render module-level panels (filters, detail) AND any
// app-level panel that the user drags into them.
//
// Panels can be moved between zones via drag & drop or programmatically.
// Both sidebars use the same UnifiedSidebar component.
//
// Persistence: only panel placements and user preferences are persisted.
// Runtime registrations (module filters, detail) are transient.
// ═══════════════════════════════════════════════════════════════════════════

const ALL_ZONES: PanelZone[] = ['activity-panel', 'primary', 'secondary'];

const DEFAULT_ZONES: Record<PanelZone, SidebarZoneState> = {
  'activity-panel': {
    stack: ['explorer'],
    activeTab: 'explorer',
    viewMode: 'tabs',
    isOpen: true,
  },
  primary: {
    stack: [],
    activeTab: null,
    viewMode: 'tabs',
    isOpen: false,
  },
  secondary: {
    stack: [],
    activeTab: null,
    viewMode: 'tabs',
    isOpen: false,
  },
};

export const usePanelRegistryStore = create<PanelRegistryState>()(
  persist(
    (set, get) => ({
      panels: {},
      zones: {
        'activity-panel': { ...DEFAULT_ZONES['activity-panel'] },
        primary: { ...DEFAULT_ZONES.primary },
        secondary: { ...DEFAULT_ZONES.secondary },
      },
      panelPlacements: {},

      // ── Registration ──

      registerPanel: (panel) => {
        const state = get();
        // Use persisted placement if available, otherwise use the panel's default
        const zone = state.panelPlacements[panel.id] ?? panel.zone;
        const updatedPanel = { ...panel, zone };

        set((s) => ({
          panels: { ...s.panels, [panel.id]: updatedPanel },
        }));

        // If it's an app panel and the zone has this panel in its stack, ensure zone is synced
        // For module panels, they get added to the stack when explicitly opened
      },

      unregisterPanel: (panelId) => {
        set((s) => {
          const { [panelId]: _, ...restPanels } = s.panels;

          // Also remove from any zone stacks
          const newZones = { ...s.zones };
          for (const zone of ALL_ZONES) {
            const zs = newZones[zone];
            if (zs.stack.includes(panelId)) {
              const newStack = zs.stack.filter((id) => id !== panelId);
              const newActive = zs.activeTab === panelId
                ? (newStack[0] ?? null)
                : zs.activeTab;
              newZones[zone] = {
                ...zs,
                stack: newStack,
                activeTab: newActive,
                isOpen: newStack.length > 0 ? zs.isOpen : false,
              };
            }
          }

          return { panels: restPanels, zones: newZones };
        });
      },

      // ── Zone management ──

      openZone: (zone) => {
        set((s) => ({
          zones: {
            ...s.zones,
            [zone]: { ...s.zones[zone], isOpen: true },
          },
        }));
      },

      closeZone: (zone) => {
        set((s) => ({
          zones: {
            ...s.zones,
            [zone]: { ...s.zones[zone], isOpen: false },
          },
        }));
      },

      toggleZone: (zone) => {
        set((s) => ({
          zones: {
            ...s.zones,
            [zone]: { ...s.zones[zone], isOpen: !s.zones[zone].isOpen },
          },
        }));
      },

      addToZone: (zone, panelId) => {
        set((s) => {
          const zs = s.zones[zone];
          if (zs.stack.includes(panelId)) return s; // already there

          // Remove from other zones first (a panel should only live in one zone)
          const newZones = { ...s.zones };
          for (const z of ALL_ZONES) {
            if (z === zone) continue;
            const otherZs = newZones[z];
            if (otherZs.stack.includes(panelId)) {
              const cleaned = otherZs.stack.filter((id) => id !== panelId);
              newZones[z] = {
                ...otherZs,
                stack: cleaned,
                activeTab: otherZs.activeTab === panelId ? (cleaned[0] ?? null) : otherZs.activeTab,
                isOpen: cleaned.length > 0 ? otherZs.isOpen : false,
              };
            }
          }

          const newStack = [...zs.stack, panelId];
          return {
            zones: {
              ...newZones,
              [zone]: {
                ...zs,
                stack: newStack,
                activeTab: panelId,
                isOpen: true,
              },
            },
          };
        });
      },

      removeFromZone: (zone, panelId) => {
        set((s) => {
          const zs = s.zones[zone];
          const newStack = zs.stack.filter((id) => id !== panelId);
          const newActive = zs.activeTab === panelId
            ? (newStack[0] ?? null)
            : zs.activeTab;
          return {
            zones: {
              ...s.zones,
              [zone]: {
                ...zs,
                stack: newStack,
                activeTab: newActive,
                isOpen: newStack.length > 0 ? zs.isOpen : false,
              },
            },
          };
        });
      },

      setZoneStack: (zone, panelIds) => {
        set((s) => {
          // Remove these panels from other zones first (prevent cross-zone duplicates)
          const newZones = { ...s.zones };
          const panelSet = new Set(panelIds);
          for (const z of ALL_ZONES) {
            if (z === zone) continue;
            const otherZs = newZones[z];
            const hasAny = otherZs.stack.some((id) => panelSet.has(id));
            if (hasAny) {
              const cleaned = otherZs.stack.filter((id) => !panelSet.has(id));
              newZones[z] = {
                ...otherZs,
                stack: cleaned,
                activeTab: panelSet.has(otherZs.activeTab ?? '') ? (cleaned[0] ?? null) : otherZs.activeTab,
                isOpen: cleaned.length > 0 ? otherZs.isOpen : false,
              };
            }
          }

          return {
            zones: {
              ...newZones,
              [zone]: {
                ...s.zones[zone],
                stack: panelIds,
                activeTab: panelIds[0] ?? null,
                isOpen: panelIds.length > 0,
              },
            },
          };
        });
      },

      setActiveTab: (zone, panelId) => {
        set((s) => ({
          zones: {
            ...s.zones,
            [zone]: { ...s.zones[zone], activeTab: panelId },
          },
        }));
      },

      toggleViewMode: (zone) => {
        set((s) => ({
          zones: {
            ...s.zones,
            [zone]: {
              ...s.zones[zone],
              viewMode: s.zones[zone].viewMode === 'tabs' ? 'stacked' : 'tabs',
            },
          },
        }));
      },

      setViewMode: (zone, mode) => {
        set((s) => ({
          zones: {
            ...s.zones,
            [zone]: { ...s.zones[zone], viewMode: mode },
          },
        }));
      },

      // ── Panel movement ──

      movePanel: (panelId, toZone) => {
        const state = get();
        const panel = state.panels[panelId];
        if (!panel) return;

        const fromZone = panel.zone;
        if (fromZone === toZone) return;

        // Remove from old zone stack
        const oldZs = state.zones[fromZone];
        const newOldStack = oldZs.stack.filter((id) => id !== panelId);
        const newOldActive = oldZs.activeTab === panelId
          ? (newOldStack[0] ?? null)
          : oldZs.activeTab;

        // Add to new zone stack
        const newZs = state.zones[toZone];
        const newNewStack = [...newZs.stack, panelId];

        set({
          panels: {
            ...state.panels,
            [panelId]: { ...panel, zone: toZone },
          },
          zones: {
            ...state.zones,
            [fromZone]: {
              ...oldZs,
              stack: newOldStack,
              activeTab: newOldActive,
              isOpen: newOldStack.length > 0 ? oldZs.isOpen : false,
            },
            [toZone]: {
              ...newZs,
              stack: newNewStack,
              activeTab: panelId,
              isOpen: true,
            },
          },
          // Persist the user's choice
          panelPlacements: {
            ...state.panelPlacements,
            [panelId]: toZone,
          },
        });
      },

      reorderInZone: (zone, fromIndex, toIndex) => {
        set((s) => {
          const zs = s.zones[zone];
          const newStack = [...zs.stack];
          const [removed] = newStack.splice(fromIndex, 1);
          newStack.splice(toIndex, 0, removed);
          return {
            zones: {
              ...s.zones,
              [zone]: { ...zs, stack: newStack },
            },
          };
        });
      },

      // ── Toggle behaviors ──

      togglePanel: (panelId, zone) => {
        const state = get();
        const zs = state.zones[zone];

        if (zs.stack.includes(panelId)) {
          if (zs.stack.length === 1) {
            // Single panel — toggle zone open/closed
            set({
              zones: {
                ...state.zones,
                [zone]: { ...zs, isOpen: !zs.isOpen },
              },
            });
          } else {
            // Multi-panel — if it's already the active tab, close the zone
            // Otherwise just switch to it
            if (zs.activeTab === panelId) {
              set({
                zones: {
                  ...state.zones,
                  [zone]: { ...zs, isOpen: !zs.isOpen },
                },
              });
            } else {
              set({
                zones: {
                  ...state.zones,
                  [zone]: { ...zs, activeTab: panelId, isOpen: true },
                },
              });
            }
          }
        } else {
          // Panel not in zone — replace stack with just this panel
          set({
            zones: {
              ...state.zones,
              [zone]: {
                ...zs,
                stack: [panelId],
                activeTab: panelId,
                isOpen: true,
              },
            },
          });
        }
      },

      stackPanel: (panelId, zone) => {
        const state = get();
        const zs = state.zones[zone];

        if (zs.stack.includes(panelId)) {
          // Already in stack — remove it (toggle off)
          const newStack = zs.stack.filter((id) => id !== panelId);
          const newActive = zs.activeTab === panelId
            ? (newStack[0] ?? null)
            : zs.activeTab;
          set({
            zones: {
              ...state.zones,
              [zone]: {
                ...zs,
                stack: newStack,
                activeTab: newActive,
                isOpen: newStack.length > 0,
              },
            },
          });
        } else {
          // Not in stack — add it
          const newStack = [...zs.stack, panelId];
          set({
            zones: {
              ...state.zones,
              [zone]: {
                ...zs,
                stack: newStack,
                activeTab: panelId,
                isOpen: true,
              },
            },
          });
        }
      },

      // ── Queries ──

      getPanelsForZone: (zone) => {
        const state = get();
        return Object.values(state.panels)
          .filter((p) => p.zone === zone)
          .sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
      },

      isInZoneStack: (zone, panelId) => {
        return get().zones[zone].stack.includes(panelId);
      },

      getActivePanel: (zone) => {
        const zs = get().zones[zone];
        if (!zs.isOpen || zs.stack.length === 0) return null;
        return zs.activeTab ?? zs.stack[0] ?? null;
      },

      getZoneForPanel: (panelId, fallback) => {
        const state = get();
        // User placement override wins
        if (state.panelPlacements[panelId]) return state.panelPlacements[panelId];
        // Then the registered panel's zone
        const panel = state.panels[panelId];
        if (panel) return panel.zone;
        // Final fallback
        return fallback ?? 'primary';
      },

      resetToDefaults: () => {
        set({
          zones: {
            'activity-panel': { ...DEFAULT_ZONES['activity-panel'] },
            primary: { ...DEFAULT_ZONES.primary },
            secondary: { ...DEFAULT_ZONES.secondary },
          },
          panelPlacements: {},
        });
      },
    }),
    {
      name: 'ols-panel-registry',
      version: 2,
      partialize: (state) => ({
        zones: state.zones,
        panelPlacements: state.panelPlacements,
        // Don't persist panels — they re-register on mount
      }),
      migrate: (persistedState: unknown, _version: number) => {
        // Ensure all zones exist — old persisted data may be missing 'activity-panel'
        const s = (persistedState ?? {}) as Record<string, unknown>;
        const zones = ((s.zones ?? {}) as Record<string, SidebarZoneState>);
        return {
          ...s,
          zones: {
            'activity-panel': zones['activity-panel'] ?? { ...DEFAULT_ZONES['activity-panel'] },
            primary: zones['primary'] ?? { ...DEFAULT_ZONES.primary },
            secondary: zones['secondary'] ?? { ...DEFAULT_ZONES.secondary },
          },
          panelPlacements: (s.panelPlacements ?? {}) as Record<string, PanelZone>,
        };
      },
    },
  ),
);
