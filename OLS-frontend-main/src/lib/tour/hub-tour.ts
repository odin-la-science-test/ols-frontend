import type { TourDefinition } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// HUB TOURS — Introduce Atlas and Lab platform hubs
// ═══════════════════════════════════════════════════════════════════════════

export const atlasTour: TourDefinition = {
  id: 'hub-atlas',
  nameKey: 'tour.atlas.name',
  steps: [
    {
      titleKey: 'tour.atlas.welcome.title',
      descriptionKey: 'tour.atlas.welcome.description',
    },
    {
      element: '[data-tour="hub-modules-grid"]',
      titleKey: 'tour.atlas.modules.title',
      descriptionKey: 'tour.atlas.modules.description',
      side: 'top',
    },
  ],
};

export const labTour: TourDefinition = {
  id: 'hub-lab',
  nameKey: 'tour.lab.name',
  steps: [
    {
      titleKey: 'tour.lab.welcome.title',
      descriptionKey: 'tour.lab.welcome.description',
    },
    {
      element: '[data-tour="hub-modules-grid"]',
      titleKey: 'tour.lab.modules.title',
      descriptionKey: 'tour.lab.modules.description',
      side: 'top',
    },
  ],
};
