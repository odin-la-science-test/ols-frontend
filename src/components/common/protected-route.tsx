import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores';
import { isGuestBlockedRoute } from '@/lib/guest-access';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.user?.role === 'GUEST');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isGuest && isGuestBlockedRoute(location.pathname)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
