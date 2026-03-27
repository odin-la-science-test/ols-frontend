import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { studyCollectionsApi } from './api';
import type { ModuleSearchResult } from '@/lib/module-registry/types';

const StudyCollectionsPage = lazy(() =>
  import('./page').then((m) => ({ default: m.StudyCollectionsPage }))
);

export const studyCollectionsModule: ModuleDefinition = {
  id: 'study-collections',
  moduleKey: 'HUGIN_STUDY_COLLECTIONS',
  translationKey: 'studyCollections.title',
  descriptionKey: 'studyCollections.description',
  icon: 'library-big',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/study-collections',
    element: StudyCollectionsPage,
  },

  search: {
    resultTypeKey: 'studyCollections.title',
    resultIcon: 'library-big',
    resultRoute: '/lab/study-collections',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await studyCollectionsApi.search(query);
      const results = response.data;
      return results.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.description || undefined,
      }));
    },
  },

};
