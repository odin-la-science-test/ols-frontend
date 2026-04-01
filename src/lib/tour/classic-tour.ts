import type { TourDefinition } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIC SHELL TOUR — Introduces the classic layout to new users
//
// Triggered on first visit to a module page in classic mode.
// Presents: sidebar navigation, search, breadcrumbs, and command palette.
// ═══════════════════════════════════════════════════════════════════════════

export const classicTour: TourDefinition = {
  id: 'classic-shell',
  nameKey: 'tour.classic.name',
  steps: [
    {
      titleKey: 'tour.classic.welcome.title',
      descriptionKey: 'tour.classic.welcome.description',
    },
    {
      element: '[data-tour="classic-sidebar"]',
      titleKey: 'tour.classic.sidebar.title',
      descriptionKey: 'tour.classic.sidebar.description',
      side: 'right',
    },
    {
      element: '[data-tour="classic-sidebar-search"]',
      titleKey: 'tour.classic.search.title',
      descriptionKey: 'tour.classic.search.description',
      side: 'right',
    },
    {
      titleKey: 'tour.classic.commandPalette.title',
      descriptionKey: 'tour.classic.commandPalette.description',
    },
  ],
};
