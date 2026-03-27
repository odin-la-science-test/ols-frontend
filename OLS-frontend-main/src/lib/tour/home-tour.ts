import type { TourDefinition } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// HOME TOUR — Introduces the dashboard and platform navigation
// ═══════════════════════════════════════════════════════════════════════════

export const homeTour: TourDefinition = {
  id: 'home',
  nameKey: 'tour.home.name',
  steps: [
    {
      titleKey: 'tour.home.welcome.title',
      descriptionKey: 'tour.home.welcome.description',
    },
    {
      element: '[data-tour="platform-cards"]',
      titleKey: 'tour.home.platforms.title',
      descriptionKey: 'tour.home.platforms.description',
      side: 'bottom',
    },
    {
      element: '[data-tour="dashboard-grid"]',
      titleKey: 'tour.home.dashboard.title',
      descriptionKey: 'tour.home.dashboard.description',
      side: 'top',
    },
    {
      element: '[data-tour="dashboard-toolbar"]',
      titleKey: 'tour.home.customize.title',
      descriptionKey: 'tour.home.customize.description',
      side: 'top',
    },
  ],
};
