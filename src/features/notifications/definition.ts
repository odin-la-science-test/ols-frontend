import { lazy } from 'react';
import type { ModuleDefinition } from '@/lib/module-registry/types';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { NotificationsWidget } from '@/components/common/widgets';
import { useUnreadCount } from './hooks';

const NotificationsPage = lazy(() => import('./page').then((m) => ({ default: m.NotificationsPage })));

export const notificationsModule: ModuleDefinition = {
  id: 'notifications',
  moduleKey: 'HUGIN_NOTIFICATIONS',
  translationKey: 'notifications.title',
  descriptionKey: 'notifications.description',
  icon: 'bell',
  accentColor: HUGIN_PRIMARY,
  platform: 'lab',

  route: {
    path: 'lab/notifications',
    element: NotificationsPage,
  },

  activityPanel: {
    titleKey: 'notifications.title',
    icon: 'bell',
    component: lazy(() => import('./components/notifications-panel')),
    priority: 30,
    useBadgeCount: () => {
      const { data } = useUnreadCount();
      return data?.count ?? 0;
    },
  },

  widgets: [{
    id: 'notifications',
    titleKey: 'dashboard.widgets.notifications',
    icon: 'bell',
    component: NotificationsWidget,
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 6 },
    defaultVisible: true,
  }],

};
