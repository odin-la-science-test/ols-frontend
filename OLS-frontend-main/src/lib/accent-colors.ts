import type { ComponentType } from 'react';

import { DotsBackground, GridsBackground } from '@/components/common/backgrounds';

// ═══════════════════════════════════════════════════════════════════════════
// ACCENT COLORS & PLATFORM IDENTITY
//
// The OLS app has two platforms with distinct brand identities:
//   Munin Atlas (/atlas/*) — violet/purple, dots background
//   Hugin Lab   (/lab/*)   — emerald/teal, grids background
//
// This file is the single source of truth for platform identity used by:
//   - PlatformProvider (automatic platform context from routing)
//   - ModuleLayout (accent color + background)
//   - Tab bar, mobile bar, activity bar (accent coloring)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Platform-level accents ───
export const MUNIN_PRIMARY = 'hsl(262, 83%, 58%)';  // Violet
export const HUGIN_PRIMARY = 'hsl(160, 84%, 39%)';  // Emerald

// ─── System routes (no accent — neutral shell styling) ───
const SYSTEM_ROUTES = ['/', '/workspace', '/profile', '/settings', '/welcome', '/login', '/register'];

// ─── Platform identity map ───
export type PlatformId = 'munin' | 'hugin';

interface PlatformIdentity {
  accent: string;
  Background: ComponentType;
}

export const PLATFORMS: Record<PlatformId, PlatformIdentity> = {
  munin: { accent: MUNIN_PRIMARY, Background: DotsBackground },
  hugin: { accent: HUGIN_PRIMARY, Background: GridsBackground },
};

// ─── Module platform → PlatformId mapping ───
const MODULE_PLATFORM_MAP: Record<string, PlatformId> = {
  atlas: 'munin',
  lab: 'hugin',
};

export function getPlatformId(modulePlatform: 'atlas' | 'lab' | 'system'): PlatformId | null {
  return MODULE_PLATFORM_MAP[modulePlatform] ?? null;
}

/**
 * Resolve the accent color for a given route path.
 * Returns null for system routes (settings, profile, home, etc.) — shell uses neutral styling.
 * Used by tab bar, mobile bar, activity bar, status bar, menu bar for per-tab/per-icon coloring.
 */
export function getAccentForPath(path: string): string | null {
  if (path.startsWith('/lab')) return HUGIN_PRIMARY;
  if (path.startsWith('/atlas')) return MUNIN_PRIMARY;
  if (isSystemRoute(path)) return null;
  return null;
}

/**
 * Check if a path is a system route (no module accent).
 */
export function isSystemRoute(path: string): boolean {
  return SYSTEM_ROUTES.some(route => path === route || (route !== '/' && path.startsWith(route + '/')));
}
