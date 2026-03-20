'use client';

/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { MUNIN_PRIMARY } from '@/lib/accent-colors';
import { DotsBackground } from '@/components/common';
import { useSidebarStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE LAYOUT - Compound Component Pattern
// Professional 3-column layout for module pages
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleLayoutContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
  accentColor: string;
}

const ModuleLayoutContext = React.createContext<ModuleLayoutContextValue | null>(null);

export function useModuleLayout() {
  const context = React.useContext(ModuleLayoutContext);
  if (!context) {
    // Graceful fallback instead of throwing — avoids crash during
    // fast navigation / HMR when component renders before provider mounts
    return {
      sidebarOpen: false,
      setSidebarOpen: () => {},
      detailOpen: false,
      setDetailOpen: () => {},
      accentColor: MUNIN_PRIMARY,
    } as ModuleLayoutContextValue;
  }
  return context;
}

// ─── Main Layout Container ───
interface ModuleLayoutProps {
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export function ModuleLayout({ 
  children, 
  accentColor,
  className 
}: ModuleLayoutProps) {
  const sidebarOpen = useSidebarStore((state) => state.isOpen);
  const setSidebarOpen = useSidebarStore((state) => state.setOpen);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // When accentColor is provided, override --color-primary/--color-ring inline.
  // When omitted (system pages), let the theme's native CSS variables apply.
  const effectiveAccent = accentColor ?? 'var(--color-primary)';
  const style = accentColor
    ? {
        '--module-accent': accentColor,
        '--module-accent-subtle': `color-mix(in srgb, var(--module-accent) 15%, transparent)`,
        '--module-accent-muted': `color-mix(in srgb, var(--module-accent) 30%, transparent)`,
        '--color-ring': accentColor,
        '--color-primary': accentColor,
      } as React.CSSProperties
    : {
        // System pages: --module-accent aliases the theme's primary, no inline overrides
        '--module-accent': 'var(--color-primary)',
        '--module-accent-subtle': `color-mix(in srgb, var(--module-accent) 15%, transparent)`,
        '--module-accent-muted': `color-mix(in srgb, var(--module-accent) 30%, transparent)`,
      } as React.CSSProperties;

  return (
    <ModuleLayoutContext.Provider
      value={{ sidebarOpen, setSidebarOpen, detailOpen, setDetailOpen, accentColor: effectiveAccent }}
    >
      <div 
        className={cn(
          'h-full flex flex-col relative overflow-hidden',
          className
        )}
        style={style}
      >
        {/* Background */}
        <DotsBackground />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </ModuleLayoutContext.Provider>
  );
}

// ─── Subcomponents ───
// These are lazy loaded for performance when used as properties of ModuleLayout
ModuleLayout.Header = React.lazy(() => import('./module-header').then(m => ({ default: m.ModuleHeader })));
ModuleLayout.Sidebar = React.lazy(() => import('./module-sidebar').then(m => ({ default: m.ModuleSidebar })));
ModuleLayout.Content = React.lazy(() => import('./module-content').then(m => ({ default: m.ModuleContent })));
