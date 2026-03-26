import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage, OAuthCallbackPage, HomePage, LandingPage, BetaConditionsPage, MuninAtlasPage, HuginLabPage, NotFoundPage, ErrorPage, WorkspacePage } from '@/pages';
import { ProtectedRoute, PublicRoute, AppShell } from '@/components/common';
import { ProfilePage } from '@/features/profile';
import { SettingsPage } from '@/features/settings';
import { registry } from '@/lib/module-registry';
import type { ModuleRoute } from '@/lib/module-registry';
import { getPlatformId } from '@/lib/accent-colors';
import { PlatformProvider } from '@/contexts/platform-context';
import { useAuthStore } from '@/stores';
import { useAdminViewStore } from '@/stores/admin-view-store';
import type { ModuleDefinition } from '@/lib/module-registry/types';

/**
 * Wrapper that renders adminView for ADMIN users, or the regular element otherwise.
 * Admin can toggle to user view via the module menu bar.
 */
function AdminViewSwitch({ mod }: { mod: ModuleDefinition }) {
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const isUserViewForced = useAdminViewStore((s) => s.isUserViewForced(mod.id));
  const AdminView = mod.adminView;
  const UserView = mod.route.element;

  const showAdmin = isAdmin && AdminView && !isUserViewForced;
  const View = showAdmin ? AdminView : UserView;

  return (
    <Suspense fallback={null}>
      <View />
    </Suspense>
  );
}

/**
 * Convert a ModuleRoute to a React Router route object.
 * Wraps the lazy element in Suspense for code-splitting.
 * If a platformId is provided, wraps in PlatformProvider for automatic accent + background.
 */
function toRouteObject(route: ModuleRoute, modulePlatform?: 'atlas' | 'lab' | 'system') {
  const Element = route.element;
  const platformId = modulePlatform ? getPlatformId(modulePlatform) : null;

  const content = (
    <Suspense fallback={null}>
      <Element />
    </Suspense>
  );

  return {
    path: route.path,
    element: platformId
      ? <PlatformProvider platform={platformId}>{content}</PlatformProvider>
      : content,
  };
}

// ─── Build module routes from registry ───
function buildModuleRoutes() {
  const routes: ReturnType<typeof toRouteObject>[] = [];

  for (const mod of registry.getAll()) {
    // If module has an admin view, use AdminViewSwitch to swap views based on role
    if (mod.adminView) {
      const platformId = getPlatformId(mod.platform);
      const element = platformId
        ? <PlatformProvider platform={platformId}><AdminViewSwitch mod={mod} /></PlatformProvider>
        : <AdminViewSwitch mod={mod} />;
      routes.push({ path: mod.route.path, element });
    } else {
      routes.push(toRouteObject(mod.route, mod.platform));
    }

    // Child routes (e.g., public shared view)
    if (mod.route.children) {
      for (const child of mod.route.children) {
        if (!child.public) {
          routes.push(toRouteObject(child, mod.platform));
        }
      }
    }

  }

  return routes;
}

// ─── Build public routes from registry (no auth required) ───
function buildPublicRoutes() {
  const routes: ReturnType<typeof toRouteObject>[] = [];

  for (const mod of registry.getAll()) {
    if (mod.route.children) {
      for (const child of mod.route.children) {
        if (child.public) {
          routes.push(toRouteObject(child));
        }
      }
    }
  }

  return routes;
}

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
      // All module routes (generated from registry)
      ...buildModuleRoutes(),
    ],
  },
  {
    path: 'welcome',
    element: <PublicRoute><LandingPage /></PublicRoute>,
  },
  {
    path: 'beta-conditions',
    element: <BetaConditionsPage />,
  },
  {
    path: 'login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: 'register',
    element: <PublicRoute><RegisterPage /></PublicRoute>,
  },
  {
    path: 'forgot-password',
    element: <PublicRoute><ForgotPasswordPage /></PublicRoute>,
  },
  {
    path: 'reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: 'verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: 'oauth-callback',
    element: <OAuthCallbackPage />,
  },
  // Public module routes (no auth required, e.g., shared view)
  ...buildPublicRoutes(),
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
