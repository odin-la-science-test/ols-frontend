import { lazy, Suspense } from 'react';

import dynamicIconImports from 'lucide-react/dynamicIconImports';
import type { LucideProps } from 'lucide-react';
import { HelpCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC ICON — Renders a Lucide icon by kebab-case name with lazy loading
//
// Uses lucide-react/dynamicIconImports: each icon is code-split and loaded
// on demand, then cached. No manual registry to maintain.
//
// Usage:
//   <DynamicIcon name="flask-conical" className="h-4 w-4" />
// ═══════════════════════════════════════════════════════════════════════════

/** All valid Lucide icon names (kebab-case) */
export type IconName = keyof typeof dynamicIconImports;

const iconCache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();

function getLazyIcon(name: string): React.LazyExoticComponent<React.ComponentType<LucideProps>> | null {
  if (!(name in dynamicIconImports)) return null;
  if (!iconCache.has(name)) {
    iconCache.set(name, lazy(dynamicIconImports[name as IconName]));
  }
  return iconCache.get(name)!;
}

interface DynamicIconProps extends LucideProps {
  /** Lucide icon name in kebab-case (e.g. 'flask-conical', 'microscope') */
  name: string;
}

/**
 * Renders a Lucide icon by name with lazy loading and caching.
 * Falls back to HelpCircle for unknown icon names.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const LazyIcon = getLazyIcon(name);

  if (!LazyIcon) {
    return <HelpCircle {...props} />;
  }

  return (
    <Suspense fallback={<div className={props.className} />}>
      <LazyIcon {...props} />
    </Suspense>
  );
}
