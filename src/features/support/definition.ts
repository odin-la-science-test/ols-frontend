import { lazy } from 'react';
import type { ModuleDefinition, ModuleSearchResult } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { supportApi } from './api';

const SupportPage = lazy(() => import('./page').then((m) => ({ default: m.SupportPage })));

export const supportModule: ModuleDefinition = {
  id: 'support',
  moduleKey: 'HUGIN_SUPPORT',
  translationKey: 'support.title',
  descriptionKey: 'support.description',
  icon: 'life-buoy',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/support',
    element: SupportPage,
  },

  adminView: lazy(() => import('./admin-page').then((m) => ({ default: m.AdminSupportPage }))),

  activityPanel: {
    titleKey: 'support.title',
    icon: 'life-buoy',
    component: lazy(() => import('./components/support-panel')),
    priority: 40,
  },

  search: {
    resultTypeKey: 'support.title',
    resultIcon: 'life-buoy',
    resultRoute: '/lab/support',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await supportApi.search(query);
      return response.data.map((t) => ({
        id: t.id,
        title: t.subject,
        subtitle: t.status,
      }));
    },
  },
};
