import { createBrowserRouter } from 'react-router-dom';
import { LoginPage, RegisterPage, HomePage, LandingPage, MuninAtlasPage, HuginLabPage, NotFoundPage, ErrorPage, WorkspacePage } from '@/pages';
import { ProtectedRoute, AppShell } from '@/components/common';
import { BacteriologyPage } from '@/features/bacteriology';
import { MycologyPage } from '@/features/mycology';
import { QuickSharePage } from '@/features/quickshare';
import { SharedViewPage } from '@/features/quickshare';
import { NotesPage } from '@/features/notes';
import { ContactsPage } from '@/features/contacts';
import { NotificationsPage } from '@/features/notifications';
import { SupportPage, AdminSupportPage } from '@/features/support';
import { ProfilePage } from '@/features/profile';
import { SettingsPage } from '@/features/settings';

export const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'workspace',
        element: <WorkspacePage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        // Munin Atlas - Base de connaissances
        path: 'atlas',
        element: <MuninAtlasPage />,
      },
      {
        // Hugin Lab - Outils de laboratoire
        path: 'lab',
        element: <HuginLabPage />,
      },
      {
        // Module: Bactériologie
        path: 'atlas/bacteriology',
        element: <BacteriologyPage />,
      },
      {
        // Module: Mycologie
        path: 'atlas/mycology',
        element: <MycologyPage />,
      },
      {
        // QuickShare module
        path: 'lab/quickshare',
        element: <QuickSharePage />,
      },
      {
        // Notes module
        path: 'lab/notes',
        element: <NotesPage />,
      },
      {
        // Contacts module
        path: 'lab/contacts',
        element: <ContactsPage />,
      },
      {
        // Notifications module
        path: 'lab/notifications',
        element: <NotificationsPage />,
      },
      {
        // Support module (user-facing)
        path: 'lab/support',
        element: <SupportPage />,
      },
      {
        // Admin support dashboard
        path: 'lab/admin/support',
        element: <AdminSupportPage />,
      },
    ],
  },
  {
    path: 'welcome',
    element: <LandingPage />,
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'register',
    element: <RegisterPage />,
  },
  {
    // Public share view (no auth required)
    path: 's/:code',
    element: <SharedViewPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

