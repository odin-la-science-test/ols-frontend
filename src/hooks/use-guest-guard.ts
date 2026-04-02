import { useAuthStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// USE GUEST GUARD — Hook centralise pour les restrictions guest
//
// Remplace tous les `useAuthStore((s) => s.user?.role === 'GUEST')` eparpilles.
// Les composants consomment des booleens semantiques sans connaitre le role.
// ═══════════════════════════════════════════════════════════════════════════

export function useGuestGuard() {
  const isGuest = useAuthStore((s) => s.user?.role === 'GUEST');

  return {
    /** L'utilisateur courant est un invite */
    isGuest: !!isGuest,
    /** L'utilisateur peut effectuer des ecritures (cacher boutons create/edit/delete) */
    canWrite: !isGuest,
    /** Les formulaires doivent etre en lecture seule */
    isReadOnly: !!isGuest,
    /** Afficher un CTA d'inscription */
    showSignUpCTA: !!isGuest,
  };
}
