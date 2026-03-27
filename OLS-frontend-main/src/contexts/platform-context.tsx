'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { PlatformId } from '@/lib/accent-colors';

const PlatformContext = createContext<PlatformId | null>(null);

export function usePlatform(): PlatformId | null {
  return useContext(PlatformContext);
}

export function PlatformProvider({ platform, children }: { platform: PlatformId; children: ReactNode }) {
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}
