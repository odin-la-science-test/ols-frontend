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
};
