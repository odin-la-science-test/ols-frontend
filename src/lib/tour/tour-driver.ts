import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour-theme.css';
import type { TFunction } from 'i18next';
import type { TourDefinition, TourStep } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// TOUR DRIVER — Thin wrapper around driver.js that resolves i18n keys
//
// Isolates the third-party library: if driver.js is ever replaced, only
// this file changes. All OLS code works with TourDefinition / TourStep.
// ═══════════════════════════════════════════════════════════════════════════

function mapStep(step: TourStep, t: TFunction): DriveStep {
  return {
    element: step.element,
    popover: {
      title: t(step.titleKey),
      description: t(step.descriptionKey),
      side: step.side,
      align: step.align ?? 'center',
      popoverClass: 'ols-tour-popover',
    },
  };
}

export interface StartTourOptions {
  definition: TourDefinition;
  t: TFunction;
  onComplete: () => void;
  onSkip?: () => void;
}

let activeDriver: Driver | null = null;

/** Start a guided tour. Returns the driver instance for cleanup. */
export function startTour({ definition, t, onComplete, onSkip }: StartTourOptions): Driver {
  // Destroy any running tour
  if (activeDriver) {
    activeDriver.destroy();
    activeDriver = null;
  }

  const steps = definition.steps.map((s) => mapStep(s, t));
  const totalSteps = steps.length;

  const driverInstance = driver({
    steps,
    showProgress: true,
    progressText: `{{current}} / {{total}}`,
    nextBtnText: t('tour.buttons.next'),
    prevBtnText: t('tour.buttons.previous'),
    doneBtnText: t('tour.buttons.finish'),
    popoverClass: 'ols-tour-popover',
    overlayColor: 'hsl(0 0% 0% / 0.5)',
    stagePadding: 8,
    stageRadius: 8,
    animate: true,
    allowClose: true,
    smoothScroll: true,
    onDestroyed: () => {
      activeDriver = null;
      // Check if the tour was completed (reached the last step)
      const currentIdx = driverInstance.getActiveIndex();
      if (currentIdx === totalSteps - 1 || currentIdx === undefined) {
        onComplete();
      } else {
        onSkip?.();
      }
    },
  });

  activeDriver = driverInstance;
  driverInstance.drive();
  return driverInstance;
}

/** Destroy any active tour */
export function destroyActiveTour(): void {
  if (activeDriver) {
    activeDriver.destroy();
    activeDriver = null;
  }
}

/** Check if a tour is currently active */
export function isTourActive(): boolean {
  return activeDriver !== null;
}
