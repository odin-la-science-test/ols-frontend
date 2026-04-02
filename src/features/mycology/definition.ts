import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { MUNIN_PRIMARY } from '@/lib/accent-colors';
import { mycologyApi } from './api';
import type { ModuleSearchResult } from '@/lib/module-registry/types';

const MycologyPage = lazy(() => import('./page').then((m) => ({ default: m.MycologyPage })));

export const mycologyModule: ModuleDefinition = {
  id: 'mycology',
  moduleKey: 'MUNIN_MYCO',
  translationKey: 'mycology.title',
  descriptionKey: 'mycology.description',
  icon: 'leaf',
  accentColor: MUNIN_PRIMARY,
  platform: 'atlas',
  guestAccess: 'read',

  route: {
    path: 'atlas/mycology',
    element: MycologyPage,
  },

  search: {
    resultTypeKey: 'mycology.title',
    resultIcon: 'leaf',
    resultRoute: '/atlas/mycology',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await mycologyApi.search(query);
      return response.data.map((f) => ({
        id: f.id,
        title: f.species,
        subtitle: f.type,
        tags: f.secondaryMetabolites?.slice(0, 3),
      }));
    },
  },

  tour: [
    { element: '[data-tour="collection-table"]', titleKey: 'mycology.tour.table.title', descriptionKey: 'mycology.tour.table.description' },
    { element: '[data-tour="detail-panel"]', titleKey: 'mycology.tour.detail.title', descriptionKey: 'mycology.tour.detail.description', side: 'left' },
    { element: '[data-tour="filter-panel"]', titleKey: 'mycology.tour.filters.title', descriptionKey: 'mycology.tour.filters.description', side: 'left' },
    { element: '[data-tour="stats-bar"]', titleKey: 'mycology.tour.stats.title', descriptionKey: 'mycology.tour.stats.description', side: 'bottom' },
  ],

  settings: [{
    titleKey: 'mycology.settings.title',
    fields: [
      { key: 'mycology.scoreFormat', type: 'select', labelKey: 'mycology.settings.scoreFormat', defaultValue: 'percent', options: [
        { value: 'percent', labelKey: 'mycology.settings.scorePercent' },
        { value: 'fraction', labelKey: 'mycology.settings.scoreFraction' },
      ]},
      { key: 'mycology.maxResults', type: 'number', labelKey: 'mycology.settings.maxResults', defaultValue: 10, min: 3, max: 50 },
    ],
  }],
};
