import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/stores/auth-store';
import { useIsUserOnline } from '@/stores/online-users-store';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// USER AVATAR - Composant composite DRY pour afficher l'avatar d'un user
//
// Encapsule : Avatar + image/fallback initiales + presence (isOnline)
// Utiliser ce composant partout ou l'on affiche l'avatar d'un autre user.
// ═══════════════════════════════════════════════════════════════════════════

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-xl',
} as const;

type AvatarSize = keyof typeof SIZE_CLASSES;

interface UserAvatarProps {
  /** ID utilisateur — requis pour la presence */
  userId?: number;
  /** ID avatar (ex: "robot-1") — resolu via getAvatarUrl() */
  avatarId?: string | null;
  /** Nom complet — utilise pour generer les initiales fallback */
  name: string;
  /** Taille du composant */
  size?: AvatarSize;
  /** Afficher le point vert de presence (defaut: true si userId fourni) */
  showPresence?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserAvatar({
  userId,
  avatarId,
  name,
  size = 'md',
  showPresence,
  className,
}: UserAvatarProps) {
  const shouldShowPresence = showPresence ?? (userId != null);
  const isOnline = useIsUserOnline(userId ?? 0);

  return (
    <Avatar
      className={cn(SIZE_CLASSES[size], className)}
      isOnline={shouldShowPresence && isOnline}
    >
      <AvatarImage src={getAvatarUrl(avatarId)} alt={name} />
      <AvatarFallback className={SIZE_CLASSES[size]}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
