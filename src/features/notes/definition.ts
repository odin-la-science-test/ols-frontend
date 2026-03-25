import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { notesApi } from './api';
import type { ModuleSearchResult } from '@/lib/module-registry/types';
import { LatestNotesWidget } from '@/components/common/widgets';

const NotesPage = lazy(() => import('./page').then((m) => ({ default: m.NotesPage })));

export const notesModule: ModuleDefinition = {
  id: 'notes',
  moduleKey: 'HUGIN_NOTES',
  translationKey: 'notes.title',
  descriptionKey: 'notes.description',
  icon: 'notebook-pen',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/notes',
    element: NotesPage,
  },

  activityPanel: {
    titleKey: 'notes.title',
    icon: 'notebook-pen',
    component: lazy(() => import('./components/notes-panel')),
    priority: 20,
  },

  widgets: [{
    id: 'latest-notes',
    titleKey: 'dashboard.widgets.latestNotes',
    icon: 'notebook-pen',
    component: LatestNotesWidget,
    defaultSize: { w: 3, h: 5 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 8 },
    defaultVisible: true,
  }],

  search: {
    resultTypeKey: 'notes.title',
    resultIcon: 'notebook-pen',
    resultRoute: '/lab/notes',
    search: async (query: string): Promise<ModuleSearchResult[]> => {
      const response = await notesApi.search(query);
      const results = response.data;
      return results.map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: n.content?.slice(0, 80),
        tags: n.tags?.slice(0, 3),
      }));
    },
    searchByTag: async (tag: string): Promise<ModuleSearchResult[]> => {
      const response = await notesApi.searchByTag(tag);
      return response.data.map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: n.tags?.join(', '),
        tags: n.tags?.slice(0, 3),
      }));
    },
  },
};
