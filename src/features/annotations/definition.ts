import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { annotationsApi } from './api';
import type { ModuleSearchResult } from '@/lib/module-registry/types';

const AnnotationsPage = lazy(() => import('./page').then((m) => ({ default: m.AnnotationsPage })));

export const annotationsModule: ModuleDefinition = {
  id: 'annotations',
  moduleKey: 'HUGIN_ANNOTATIONS',
  translationKey: 'annotations.title',
  descriptionKey: 'annotations.description',
  icon: 'sticky-note',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/annotations',
    element: AnnotationsPage,
  },

  search: {
    resultTypeKey: 'annotations.title',
    resultIcon: 'sticky-note',
    resultRoute: '/lab/annotations',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await annotationsApi.search(query);
      const results = response.data;
      return results.map((a) => ({
        id: a.id,
        title: a.content.length > 60 ? `${a.content.slice(0, 60)}...` : a.content,
        subtitle: `${a.entityType} #${a.entityId}`,
      }));
    },
  },

  settings: [{
    titleKey: 'annotations.settings.title',
    fields: [
      { key: 'annotations.defaultColor', type: 'select', labelKey: 'annotations.settings.defaultColor', defaultValue: 'YELLOW', options: [
        { value: 'YELLOW', labelKey: 'annotations.color.YELLOW' },
        { value: 'GREEN', labelKey: 'annotations.color.GREEN' },
        { value: 'BLUE', labelKey: 'annotations.color.BLUE' },
        { value: 'PINK', labelKey: 'annotations.color.PINK' },
      ]},
    ],
  }],
};
