// ═══════════════════════════════════════════════════════════════════════════
// ACCENT COLORS - Centralized route-to-accent color mapping
//
// The OLS app has two platforms with distinct brand identities:
//   Munin Atlas (/atlas/*) — violet/purple
//   Hugin Lab   (/lab/*)   — emerald/teal
//
// Each module within a platform can have a more specific accent shade.
// This file is the single source of truth for all accent colors used by:
//   - Tab bar (active tab color)
//   - Mobile bottom bar (active tab color)
//   - Activity bar (active indicator & badge color)
//   - ModuleLayout (per-module accent via inline styles)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Platform-level accents ───
export const MUNIN_PRIMARY = 'hsl(262, 83%, 58%)';  // Violet
export const HUGIN_PRIMARY = 'hsl(160, 84%, 39%)';  // Emerald

/**
 * Resolve the accent color for a given route path.
 * Used by tab bar, mobile bar, and activity bar for per-tab/per-icon coloring.
 *
 * More specific routes are matched first for fine-grained module colors.
 */
export function getAccentForPath(path: string): string {
  // ── Hugin Lab ──
  if (path.startsWith('/lab')) return HUGIN_PRIMARY;

  // ── Munin Atlas ──
  if (path.startsWith('/atlas')) return MUNIN_PRIMARY;

  // ── System pages & fallback — use Munin violet as brand default ──
  // Note: we use a concrete color (not var(--color-primary)) to avoid
  // a flash when switching tabs between modules that override --color-primary.
  return MUNIN_PRIMARY;
}
