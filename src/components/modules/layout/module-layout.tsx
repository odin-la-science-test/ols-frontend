'use client';

/* eslint-disable react-refresh/only-export-components */
import { createContext, lazy, useContext, useState, type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { PLATFORMS, MUNIN_PRIMARY } from '@/lib/accent-colors';
import { DotsBackground } from '@/components/common';
import { useSidebarStore } from '@/stores';
import { usePlatform } from '@/contexts/platform-context';

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

const ModuleLayoutContext = createContext<ModuleLayoutContextValue | null>(null);

export function useModuleLayout() {
  const context = useContext(ModuleLayoutContext);
  if (!context) {
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
  children: ReactNode;
  className?: string;
}

export function ModuleLayout({ children, className }: ModuleLayoutProps) {
  const sidebarOpen = useSidebarStore((state) => state.isOpen);
  const setSidebarOpen = useSidebarStore((state) => state.setOpen);
  const [detailOpen, setDetailOpen] = useState(false);

  // Derive accent + background from platform context
  const platformId = usePlatform();
  const platform = platformId ? PLATFORMS[platformId] : null;
  const Background = platform?.Background ?? DotsBackground;

  // System pages (no platform) use foreground-based neutral accent
  const SYSTEM_ACCENT = 'hsl(var(--foreground))';
  const effectiveAccent = platform?.accent ?? SYSTEM_ACCENT;
  const style = platform
    ? {
        '--module-accent': platform.accent,
        '--module-accent-subtle': `color-mix(in srgb, var(--module-accent) 15%, transparent)`,
        '--module-accent-muted': `color-mix(in srgb, var(--module-accent) 30%, transparent)`,
        '--color-ring': platform.accent,
        '--color-primary': platform.accent,
      } as CSSProperties
    : {
        '--module-accent': SYSTEM_ACCENT,
        '--module-accent-subtle': `color-mix(in srgb, var(--module-accent) 10%, transparent)`,
        '--module-accent-muted': `color-mix(in srgb, var(--module-accent) 20%, transparent)`,
      } as CSSProperties;

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
        <Background />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </ModuleLayoutContext.Provider>
  );
}

// ─── Subcomponents ───
ModuleLayout.Header = lazy(() => import('./module-header').then(m => ({ default: m.ModuleHeader })));
ModuleLayout.Sidebar = lazy(() => import('./module-sidebar').then(m => ({ default: m.ModuleSidebar })));
ModuleLayout.Content = lazy(() => import('./module-content').then(m => ({ default: m.ModuleContent })));
