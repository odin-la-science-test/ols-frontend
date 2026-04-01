import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { organizationApi } from './api';
import type { ModuleSearchResult } from '@/lib/module-registry/types';

const OrganizationPage = lazy(() => import('./page').then((m) => ({ default: m.OrganizationPage })));

export const organizationModule: ModuleDefinition = {
  id: 'organization',
  moduleKey: 'HUGIN_ORGANIZATIONS',
  translationKey: 'organization.title',
  descriptionKey: 'organization.description',
  icon: 'building-2',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/organization',
    element: OrganizationPage,
    children: [
      {
        path: 'lab/organization/:id',
        element: lazy(() => import('./components/members-page').then((m) => ({ default: m.MembersPage }))),
      },
    ],
  },

  adminView: lazy(() => import('./admin-page').then((m) => ({ default: m.AdminOrganizationPage }))),

  search: {
    resultTypeKey: 'organization.title',
    resultIcon: 'building-2',
    resultRoute: '/lab/organization',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await organizationApi.search(query);
      const results = response.data;
      return results.map((o) => ({
        id: o.id,
        title: o.name,
        subtitle: o.createdByName,
      }));
    },
  },

  tour: [
    { element: '[data-tour="collection-table"]', titleKey: 'organization.tour.table.title', descriptionKey: 'organization.tour.table.description' },
    { element: '[data-tour="detail-panel"]', titleKey: 'organization.tour.detail.title', descriptionKey: 'organization.tour.detail.description', side: 'left' },
    { element: '[data-tour="search-input"]', titleKey: 'organization.tour.search.title', descriptionKey: 'organization.tour.search.description', side: 'bottom' },
  ],
};
