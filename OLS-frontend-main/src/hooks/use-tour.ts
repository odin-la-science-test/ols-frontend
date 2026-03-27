import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourStore } from '@/stores/tour-store';
import { registry } from '@/lib/module-registry';
import { startTour, destroyActiveTour } from '@/lib/tour/tour-driver';
import type { TourDefinition } from '@/lib/tour/types';

// ═══════════════════════════════════════════════════════════════════════════
// USE TOUR — Main hook for triggering guided tours
// ═══════════════════════════════════════════════════════════════════════════

/** Build a TourDefinition from a module's tour steps */
function buildModuleTourDef(moduleId: string): TourDefinition | null {
  const mod = registry.getById(moduleId);
  if (!mod?.tour || mod.tour.length === 0) return null;
  return {
    id: `tour-${moduleId}`,
    nameKey: mod.translationKey,
    steps: mod.tour,
  };
}

export function useTour() {
  const { t } = useTranslation();
  const { completeTour, isTourCompleted } = useTourStore();

  /** Start any tour by its definition */
  const runTour = useCallback(
    (definition: TourDefinition) => {
      startTour({
        definition,
        t,
        onComplete: () => completeTour(definition.id),
      });
    },
    [t, completeTour],
  );

  /** Start a module tour by module ID */
  const startModuleTour = useCallback(
    (moduleId: string) => {
      const def = buildModuleTourDef(moduleId);
      if (def) runTour(def);
    },
    [runTour],
  );

  /** Start a module tour only if not yet completed (for auto-trigger) */
  const triggerModuleTourIfNew = useCallback(
    (moduleId: string) => {
      const tourId = `tour-${moduleId}`;
      if (isTourCompleted(tourId)) return;
      startModuleTour(moduleId);
    },
    [isTourCompleted, startModuleTour],
  );

  /** Replay any tour (ignores completion state) */
  const replayTour = useCallback(
    (definition: TourDefinition) => {
      runTour(definition);
    },
    [runTour],
  );

  /** Stop the active tour */
  const stopTour = useCallback(() => {
    destroyActiveTour();
  }, []);

  return { runTour, startModuleTour, triggerModuleTourIfNew, replayTour, stopTour };
}
