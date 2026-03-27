import type { TourDefinition } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE TOUR — Introduces the empty workspace state
// ═══════════════════════════════════════════════════════════════════════════

export const workspaceTour: TourDefinition = {
  id: 'workspace',
  nameKey: 'tour.workspace.name',
  steps: [
    {
      element: '[data-tour="workspace-actions"]',
      titleKey: 'tour.workspace.actions.title',
      descriptionKey: 'tour.workspace.actions.description',
      side: 'bottom',
    },
    {
      element: '[data-tour="menu-bar"]',
      titleKey: 'tour.workspace.menuBar.title',
      descriptionKey: 'tour.workspace.menuBar.description',
      side: 'bottom',
    },
    {
      element: '[data-tour="activity-bar"]',
      titleKey: 'tour.workspace.activityBar.title',
      descriptionKey: 'tour.workspace.activityBar.description',
      side: 'right',
    },
  ],
};
