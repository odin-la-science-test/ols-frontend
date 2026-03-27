import type { TourDefinition } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SHELL TOUR — Introduces the OLS shell chrome to new users
//
// Triggered on first visit to a module page (where chrome is visible).
// Home/Atlas/Lab hubs hide chrome → they have their own tours.
// ═══════════════════════════════════════════════════════════════════════════

export const globalTour: TourDefinition = {
  id: 'global-shell',
  nameKey: 'tour.global.name',
  steps: [
    {
      titleKey: 'tour.global.welcome.title',
      descriptionKey: 'tour.global.welcome.description',
    },
    {
      element: '[data-tour="menu-bar"]',
      titleKey: 'tour.global.menuBar.title',
      descriptionKey: 'tour.global.menuBar.description',
      side: 'bottom',
    },
    {
      element: '[data-tour="activity-bar"]',
      titleKey: 'tour.global.activityBar.title',
      descriptionKey: 'tour.global.activityBar.description',
      side: 'right',
    },
    {
      element: '[data-tour="tab-bar"]',
      titleKey: 'tour.global.tabBar.title',
      descriptionKey: 'tour.global.tabBar.description',
      side: 'bottom',
    },
    {
      titleKey: 'tour.global.commandPalette.title',
      descriptionKey: 'tour.global.commandPalette.description',
    },
    {
      element: '[data-tour="status-bar"]',
      titleKey: 'tour.global.statusBar.title',
      descriptionKey: 'tour.global.statusBar.description',
      side: 'top',
    },
  ],
};
