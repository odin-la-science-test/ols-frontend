import type { TourDefinition } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS TOUR — Guides users through key settings sections
// ═══════════════════════════════════════════════════════════════════════════

export const settingsTour: TourDefinition = {
  id: 'system-settings',
  nameKey: 'settingsPage.tour.name',
  steps: [
    {
      element: '#appearance',
      titleKey: 'settingsPage.tour.appearance.title',
      descriptionKey: 'settingsPage.tour.appearance.description',
      side: 'right',
    },
    {
      element: '#density',
      titleKey: 'settingsPage.tour.density.title',
      descriptionKey: 'settingsPage.tour.density.description',
      side: 'right',
    },
    {
      element: '#keybindings',
      titleKey: 'settingsPage.tour.keybindings.title',
      descriptionKey: 'settingsPage.tour.keybindings.description',
      side: 'right',
    },
    {
      element: '#profiles',
      titleKey: 'settingsPage.tour.profiles.title',
      descriptionKey: 'settingsPage.tour.profiles.description',
      side: 'right',
    },
  ],
};
