import { type ReactNode } from 'react';

import { getModuleIcon } from './module-icons';
import { cn } from './utils';

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE UTILS - Utilitaires partagés pour les fonctionnalités workspace
// Évite la duplication de code entre components (DRY)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retourne un composant icône à partir du nom de l'icône
 * Utilisé par CommandPalette, GlobalSidebar, TabBar
 * @param iconName - Nom de l'icône (ex: "Microscope", "Flame")
 * @param className - Classes CSS optionnelles pour l'icône
 */
export function getIconComponent(iconName: string, className?: string): ReactNode {
  const IconComponent = getModuleIcon(iconName);
  return <IconComponent className={cn('h-4 w-4', className)} />;
}
