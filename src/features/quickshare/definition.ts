import { lazy } from 'react';
import type { ModuleDefinition, ModuleSearchResult } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { quickShareApi } from './api';

const QuickSharePage = lazy(() => import('./page').then((m) => ({ default: m.QuickSharePage })));
const SharedViewPage = lazy(() => import('./public-page').then((m) => ({ default: m.SharedViewPage })));

export const quickshareModule: ModuleDefinition = {
  id: 'quickshare',
  moduleKey: 'HUGIN_QUICKSHARE',
  translationKey: 'quickshare.title',
  descriptionKey: 'quickshare.description',
  icon: 'share-2',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/quickshare',
    element: QuickSharePage,
    children: [
      {
        path: 's/:code',
        element: SharedViewPage,
        public: true,
      },
    ],
  },

  search: {
    resultTypeKey: 'quickshare.title',
    resultIcon: 'share-2',
    resultRoute: '/lab/quickshare',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await quickShareApi.search(query);
      return response.data.map((s) => ({
        id: s.id,
        title: s.title ?? s.shareCode,
        subtitle: s.type === 'TEXT' ? 'Texte' : `${s.files.length} fichier(s)`,
      }));
    },
  },

  tour: [
    { element: '[data-tour="collection-table"]', titleKey: 'quickshare.tour.table.title', descriptionKey: 'quickshare.tour.table.description' },
    { element: '[data-tour="detail-panel"]', titleKey: 'quickshare.tour.detail.title', descriptionKey: 'quickshare.tour.detail.description', side: 'left' },
  ],
};
