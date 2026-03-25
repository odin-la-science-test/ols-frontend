'use client';

import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// LIST SKELETON — Placeholder loading pour listes et grilles
//
// Remplace les skeletons hardcodés dans chaque module par un composant
// partagé avec des props configurables.
//
// Usage :
//   <ListSkeleton layout="grid" count={6} itemHeight="h-36"
//     columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
//   <ListSkeleton layout="list" count={4} itemHeight="h-24" />
// ═══════════════════════════════════════════════════════════════════════════

interface ListSkeletonProps {
  /** Layout : grille ou liste verticale */
  layout?: 'grid' | 'list';
  /** Nombre d'éléments skeleton à afficher */
  count?: number;
  /** Classe Tailwind pour la hauteur des items (ex: 'h-20', 'h-36') */
  itemHeight?: string;
  /** Classes Tailwind pour les colonnes grid (ex: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3') */
  columns?: string;
  className?: string;
}

export function ListSkeleton({
  layout = 'list',
  count = 4,
  itemHeight = 'h-24',
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  className,
}: ListSkeletonProps) {
  const containerClass = layout === 'grid'
    ? cn('grid gap-3', columns, className)
    : cn('space-y-3', className);

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(itemHeight, 'rounded-lg bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] animate-pulse')} />
      ))}
    </div>
  );
}
