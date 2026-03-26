import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { contactsApi } from './api';
import type { ModuleSearchResult } from '@/lib/module-registry/types';

const ContactsPage = lazy(() => import('./page').then((m) => ({ default: m.ContactsPage })));

export const contactsModule: ModuleDefinition = {
  id: 'contacts',
  moduleKey: 'HUGIN_CONTACTS',
  translationKey: 'contacts.title',
  descriptionKey: 'contacts.description',
  icon: 'contact-round',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/contacts',
    element: ContactsPage,
  },

  search: {
    resultTypeKey: 'contacts.title',
    resultIcon: 'contact-round',
    resultRoute: '/lab/contacts',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await contactsApi.search(query);
      const results = response.data;
      return results.map((c) => ({
        id: c.id,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: c.organization ?? c.email ?? undefined,
      }));
    },
  },

  tour: [
    { element: '[data-tour="collection-table"]', titleKey: 'contacts.tour.table.title', descriptionKey: 'contacts.tour.table.description' },
    { element: '[data-tour="detail-panel"]', titleKey: 'contacts.tour.detail.title', descriptionKey: 'contacts.tour.detail.description', side: 'left' },
    { element: '[data-tour="search-input"]', titleKey: 'contacts.tour.search.title', descriptionKey: 'contacts.tour.search.description', side: 'bottom' },
  ],
};
