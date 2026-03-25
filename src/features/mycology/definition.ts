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
};
