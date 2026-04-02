import { useAuthStore } from '@/stores/auth-store';

// ═══════════════════════════════════════════════════════════════════════════
// GUEST ACCESS POLICY — Source de verite unique pour les restrictions guest
//
// Toute logique "est-ce qu'un guest peut faire X ?" se concentre ici.
// Les composants utilisent useGuestGuard() (hook) ou ces utilitaires.
// ═══════════════════════════════════════════════════════════════════════════

/** Routes que les guests ne peuvent PAS atteindre (redirect vers /) */
const GUEST_BLOCKED_ROUTES = ['/profile', '/workspace'];

/** Routes visitables en lecture seule pour les guests */
const GUEST_READONLY_ROUTES = ['/settings'];

/** Verifie si une route est bloquee pour les guests */
export function isGuestBlockedRoute(pathname: string): boolean {
  return GUEST_BLOCKED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
}

/** Verifie si une route est en lecture seule pour les guests */
export function isGuestReadOnlyRoute(pathname: string): boolean {
  return GUEST_READONLY_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
}

/**
 * Verifie si l'utilisateur courant est un guest (utilisable hors React).
 * Pour les composants React, preferer useGuestGuard().
 */
export function isGuestUser(): boolean {
  return useAuthStore.getState().user?.role === 'GUEST';
}
