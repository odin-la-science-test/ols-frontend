import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { MUNIN_PRIMARY } from '@/lib/accent-colors';
import { bacteriologyApi } from './api';
import type { ModuleSearchResult } from '@/lib/module-registry/types';

const BacteriologyPage = lazy(() => import('./page').then((m) => ({ default: m.BacteriologyPage })));

export const bacteriologyModule: ModuleDefinition = {
  id: 'bacteriology',
  moduleKey: 'MUNIN_BACTERIO',
  translationKey: 'bacteriology.title',
  descriptionKey: 'bacteriology.description',
  icon: 'bug',
  accentColor: MUNIN_PRIMARY,
  platform: 'atlas',

  route: {
    path: 'atlas/bacteriology',
    element: BacteriologyPage,
  },

  search: {
    resultTypeKey: 'bacteriology.title',
    resultIcon: 'bug',
    resultRoute: '/atlas/bacteriology',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await bacteriologyApi.search(query);
      return response.data.map((b) => ({
        id: b.id,
        title: b.species,
        subtitle: b.strain,
        tags: b.resistanceGenes?.slice(0, 3),
      }));
    },
  },

  tour: [
    { element: '[data-tour="collection-table"]', titleKey: 'bacteriology.tour.table.title', descriptionKey: 'bacteriology.tour.table.description' },
    { element: '[data-tour="detail-panel"]', titleKey: 'bacteriology.tour.detail.title', descriptionKey: 'bacteriology.tour.detail.description', side: 'left' },
    { element: '[data-tour="filter-panel"]', titleKey: 'bacteriology.tour.filters.title', descriptionKey: 'bacteriology.tour.filters.description', side: 'left' },
    { element: '[data-tour="stats-bar"]', titleKey: 'bacteriology.tour.stats.title', descriptionKey: 'bacteriology.tour.stats.description', side: 'bottom' },
  ],


  settings: [{
    titleKey: 'bacteriology.settings.title',
    fields: [
      { key: 'bacteriology.scoreFormat', type: 'select', labelKey: 'bacteriology.settings.scoreFormat', defaultValue: 'percent', options: [
        { value: 'percent', labelKey: 'bacteriology.settings.scorePercent' },
        { value: 'fraction', labelKey: 'bacteriology.settings.scoreFraction' },
      ]},
      { key: 'bacteriology.maxResults', type: 'number', labelKey: 'bacteriology.settings.maxResults', defaultValue: 10, min: 3, max: 50 },
    ],
  }],
};
