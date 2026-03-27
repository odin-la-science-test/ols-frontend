import type { TourDefinition } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE TOUR — Guides users through profile page sections
// ═══════════════════════════════════════════════════════════════════════════

export const profileTour: TourDefinition = {
  id: 'system-profile',
  nameKey: 'profile.tour.name',
  steps: [
    {
      element: '#identity',
      titleKey: 'profile.tour.avatar.title',
      descriptionKey: 'profile.tour.avatar.description',
      side: 'right',
    },
    {
      element: '#personal-info',
      titleKey: 'profile.tour.info.title',
      descriptionKey: 'profile.tour.info.description',
      side: 'right',
    },
    {
      element: '#security',
      titleKey: 'profile.tour.security.title',
      descriptionKey: 'profile.tour.security.description',
      side: 'right',
    },
    {
      element: '#sessions',
      titleKey: 'profile.tour.sessions.title',
      descriptionKey: 'profile.tour.sessions.description',
      side: 'right',
    },
  ],
};
