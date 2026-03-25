'use client';

import type { ReactNode } from 'react';
import { SparklesBackground, QuickSettings } from '@/components/common';

interface ErrorShellProps {
  children: ReactNode;
}

export function ErrorShell({ children }: ErrorShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <SparklesBackground />
      <QuickSettings />
      {children}
    </div>
  );
}
