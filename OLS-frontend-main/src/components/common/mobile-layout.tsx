'use client';

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Mobile Layout — responsive mobile view with media query detection
// ═══════════════════════════════════════════════════════════════════════════

export interface MobileLayoutProps {
  isMinimalShell: boolean;
}

export function MobileLayout({ isMinimalShell }: MobileLayoutProps) {
  // Only mount the Outlet on mobile to avoid double-mounting the module page
  // (DesktopResizableLayout already mounts its own Outlet for desktop).
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' ? !window.matchMedia('(min-width: 1024px)').matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsMobile(!mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden lg:hidden">
      <main className={cn('relative flex-1', isMinimalShell ? 'overflow-auto h-screen' : 'overflow-hidden')}>
        <Outlet />
      </main>
    </div>
  );
}
