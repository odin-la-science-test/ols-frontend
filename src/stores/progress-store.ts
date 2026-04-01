import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS STORE — Local tracking of learning progress metrics
//
// Tracks module visits, entity creations and identifications.
// Persisted to localStorage with custom serializer for Set.
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressState {
  modulesVisited: Set<string>;
  entitiesCreated: number;
  identificationsRun: number;

  trackModuleVisit: (moduleId: string) => void;
  trackEntityCreated: () => void;
  trackIdentification: () => void;
}

/** Custom storage that serializes Set<string> as string[] in JSON */
const storage: PersistStorage<ProgressState> = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      state: { modulesVisited: string[]; entitiesCreated: number; identificationsRun: number };
      version?: number;
    };

    return {
      ...parsed,
      state: {
        ...parsed.state,
        modulesVisited: new Set(parsed.state.modulesVisited),
      } as unknown as ProgressState,
    };
  },

  setItem: (name, value) => {
    const toStore = {
      ...value,
      state: {
        modulesVisited: Array.from(value.state.modulesVisited),
        entitiesCreated: value.state.entitiesCreated,
        identificationsRun: value.state.identificationsRun,
      },
    };
    localStorage.setItem(name, JSON.stringify(toStore));
  },

  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      modulesVisited: new Set<string>(),
      entitiesCreated: 0,
      identificationsRun: 0,

      trackModuleVisit: (moduleId: string) =>
        set((state) => {
          if (state.modulesVisited.has(moduleId)) return state;
          const next = new Set(state.modulesVisited);
          next.add(moduleId);
          return { modulesVisited: next };
        }),

      trackEntityCreated: () =>
        set((state) => ({ entitiesCreated: state.entitiesCreated + 1 })),

      trackIdentification: () =>
        set((state) => ({ identificationsRun: state.identificationsRun + 1 })),
    }),
    {
      name: 'ols-progress',
      storage,
    },
  ),
);
