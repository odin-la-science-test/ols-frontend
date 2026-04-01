// ═══════════════════════════════════════════════════════════════════════════
// THEME PRESETS - OLS Design System
// 10 families × 4 modes = 40 presets
// Source: Material Design 3 (generated palettes)
// ═══════════════════════════════════════════════════════════════════════════

export type ThemeMode = 'dark' | 'dim' | 'light' | 'onyx';

export type ThemePresetId =
  | 'odin-dark' | 'odin-dim' | 'odin-light' | 'odin-onyx'
  | 'rose-dark' | 'rose-dim' | 'rose-light' | 'rose-onyx'
  | 'jade-dark' | 'jade-dim' | 'jade-light' | 'jade-onyx'
  | 'ocean-dark' | 'ocean-dim' | 'ocean-light' | 'ocean-onyx'
  | 'amber-dark' | 'amber-dim' | 'amber-light' | 'amber-onyx'
  | 'coral-dark' | 'coral-dim' | 'coral-light' | 'coral-onyx'
  | 'slate-dark' | 'slate-dim' | 'slate-light' | 'slate-onyx'
  | 'forest-dark' | 'forest-dim' | 'forest-light' | 'forest-onyx'
  | 'berry-dark' | 'berry-dim' | 'berry-light' | 'berry-onyx'
  | 'sand-dark' | 'sand-dim' | 'sand-light' | 'sand-onyx';

export interface ThemePreset {
  id: ThemePresetId;
  labelKey: string;
  familyId: string;
  mode: ThemeMode;
  preview: { bg: string; surface: string; accent: string; text: string };
}

export interface ThemeFamily {
  id: string;
  labelKey: string;
  gradientPreview: [string, string];
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME FAMILIES
// ═══════════════════════════════════════════════════════════════════════════

export const THEME_FAMILIES: ThemeFamily[] = [
  { id: 'odin', labelKey: 'settingsPage.familyOdin', gradientPreview: ['#c3c0ff', '#eab9d2'] },
  { id: 'rose', labelKey: 'settingsPage.familyRose', gradientPreview: ['#ffb1c6', '#eebd93'] },
  { id: 'jade', labelKey: 'settingsPage.familyJade', gradientPreview: ['#62dbb6', '#a8cbe1'] },
  { id: 'ocean', labelKey: 'settingsPage.familyOcean', gradientPreview: ['#92ccff', '#d1bfe7'] },
  { id: 'amber', labelKey: 'settingsPage.familyAmber', gradientPreview: ['#ffb95f', '#bbcd9e'] },
  { id: 'coral', labelKey: 'settingsPage.familyCoral', gradientPreview: ['#ffb4a4', '#dbc48c'] },
  { id: 'slate', labelKey: 'settingsPage.familySlate', gradientPreview: ['#a1c9ff', '#d8bde4'] },
  { id: 'forest', labelKey: 'settingsPage.familyForest', gradientPreview: ['#7dda9b', '#a2ceda'] },
  { id: 'berry', labelKey: 'settingsPage.familyBerry', gradientPreview: ['#ffabf0', '#f5b8a6'] },
  { id: 'sand', labelKey: 'settingsPage.familySand', gradientPreview: ['#e5c44a', '#abd0b1'] },
];

// ═══════════════════════════════════════════════════════════════════════════
// THEME PRESETS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Odin ───
const odinDark: ThemePreset = { id: 'odin-dark', labelKey: 'settingsPage.presetOdinDark', familyId: 'odin', mode: 'dark', preview: { bg: '#1c1b1f', surface: '#2a292d', accent: '#c3c0ff', text: '#e5e1e6' } };
const odinDim: ThemePreset = { id: 'odin-dim', labelKey: 'settingsPage.presetOdinDim', familyId: 'odin', mode: 'dim', preview: { bg: '#353438', surface: '#3c3b3f', accent: '#c3c0ff', text: '#e5e1e6' } };
const odinLight: ThemePreset = { id: 'odin-light', labelKey: 'settingsPage.presetOdinLight', familyId: 'odin', mode: 'light', preview: { bg: '#fffbff', surface: '#e4e1ec', accent: '#5654a8', text: '#1c1b1f' } };
const odinOnyx: ThemePreset = { id: 'odin-onyx', labelKey: 'settingsPage.presetOdinOnyx', familyId: 'odin', mode: 'onyx', preview: { bg: '#000000', surface: '#0e0e11', accent: '#c3c0ff', text: '#e5e1e6' } };

// ─── Rose ───
const roseDark: ThemePreset = { id: 'rose-dark', labelKey: 'settingsPage.presetRoseDark', familyId: 'rose', mode: 'dark', preview: { bg: '#201a1b', surface: '#2f282a', accent: '#ffb1c6', text: '#ece0e1' } };
const roseDim: ThemePreset = { id: 'rose-dim', labelKey: 'settingsPage.presetRoseDim', familyId: 'rose', mode: 'dim', preview: { bg: '#3a3334', surface: '#413a3b', accent: '#ffb1c6', text: '#ece0e1' } };
const roseLight: ThemePreset = { id: 'rose-light', labelKey: 'settingsPage.presetRoseLight', familyId: 'rose', mode: 'light', preview: { bg: '#fffbff', surface: '#f2dde1', accent: '#b80b5e', text: '#201a1b' } };
const roseOnyx: ThemePreset = { id: 'rose-onyx', labelKey: 'settingsPage.presetRoseOnyx', familyId: 'rose', mode: 'onyx', preview: { bg: '#000000', surface: '#171213', accent: '#ffb1c6', text: '#ece0e1' } };

// ─── Jade ───
const jadeDark: ThemePreset = { id: 'jade-dark', labelKey: 'settingsPage.presetJadeDark', familyId: 'jade', mode: 'dark', preview: { bg: '#191c1b', surface: '#272b29', accent: '#62dbb6', text: '#e1e3e0' } };
const jadeDim: ThemePreset = { id: 'jade-dim', labelKey: 'settingsPage.presetJadeDim', familyId: 'jade', mode: 'dim', preview: { bg: '#323634', surface: '#393c3a', accent: '#62dbb6', text: '#e1e3e0' } };
const jadeLight: ThemePreset = { id: 'jade-light', labelKey: 'settingsPage.presetJadeLight', familyId: 'jade', mode: 'light', preview: { bg: '#fbfdf9', surface: '#dbe5df', accent: '#006b54', text: '#191c1b' } };
const jadeOnyx: ThemePreset = { id: 'jade-onyx', labelKey: 'settingsPage.presetJadeOnyx', familyId: 'jade', mode: 'onyx', preview: { bg: '#000000', surface: '#111413', accent: '#62dbb6', text: '#e1e3e0' } };

// ─── Ocean ───
const oceanDark: ThemePreset = { id: 'ocean-dark', labelKey: 'settingsPage.presetOceanDark', familyId: 'ocean', mode: 'dark', preview: { bg: '#1a1c1e', surface: '#282a2d', accent: '#92ccff', text: '#e2e2e5' } };
const oceanDim: ThemePreset = { id: 'ocean-dim', labelKey: 'settingsPage.presetOceanDim', familyId: 'ocean', mode: 'dim', preview: { bg: '#333537', surface: '#3a3b3e', accent: '#92ccff', text: '#e2e2e5' } };
const oceanLight: ThemePreset = { id: 'ocean-light', labelKey: 'settingsPage.presetOceanLight', familyId: 'ocean', mode: 'light', preview: { bg: '#fcfcff', surface: '#dee3eb', accent: '#006497', text: '#1a1c1e' } };
const oceanOnyx: ThemePreset = { id: 'ocean-onyx', labelKey: 'settingsPage.presetOceanOnyx', familyId: 'ocean', mode: 'onyx', preview: { bg: '#000000', surface: '#111416', accent: '#92ccff', text: '#e2e2e5' } };

// ─── Amber ───
const amberDark: ThemePreset = { id: 'amber-dark', labelKey: 'settingsPage.presetAmberDark', familyId: 'amber', mode: 'dark', preview: { bg: '#1f1b16', surface: '#2e2924', accent: '#ffb95f', text: '#ebe1d9' } };
const amberDim: ThemePreset = { id: 'amber-dim', labelKey: 'settingsPage.presetAmberDim', familyId: 'amber', mode: 'dim', preview: { bg: '#39342f', surface: '#403a35', accent: '#ffb95f', text: '#ebe1d9' } };
const amberLight: ThemePreset = { id: 'amber-light', labelKey: 'settingsPage.presetAmberLight', familyId: 'amber', mode: 'light', preview: { bg: '#fffbff', surface: '#f1e0d0', accent: '#855300', text: '#1f1b16' } };
const amberOnyx: ThemePreset = { id: 'amber-onyx', labelKey: 'settingsPage.presetAmberOnyx', familyId: 'amber', mode: 'onyx', preview: { bg: '#000000', surface: '#17130e', accent: '#ffb95f', text: '#ebe1d9' } };

// ─── Coral ───
const coralDark: ThemePreset = { id: 'coral-dark', labelKey: 'settingsPage.presetCoralDark', familyId: 'coral', mode: 'dark', preview: { bg: '#201a19', surface: '#2f2827', accent: '#ffb4a4', text: '#ede0dd' } };
const coralDim: ThemePreset = { id: 'coral-dim', labelKey: 'settingsPage.presetCoralDim', familyId: 'coral', mode: 'dim', preview: { bg: '#3b3332', surface: '#413a38', accent: '#ffb4a4', text: '#ede0dd' } };
const coralLight: ThemePreset = { id: 'coral-light', labelKey: 'settingsPage.presetCoralLight', familyId: 'coral', mode: 'light', preview: { bg: '#fffbff', surface: '#f5ddd9', accent: '#b32a0d', text: '#201a19' } };
const coralOnyx: ThemePreset = { id: 'coral-onyx', labelKey: 'settingsPage.presetCoralOnyx', familyId: 'coral', mode: 'onyx', preview: { bg: '#000000', surface: '#181211', accent: '#ffb4a4', text: '#ede0dd' } };

// ─── Slate ───
const slateDark: ThemePreset = { id: 'slate-dark', labelKey: 'settingsPage.presetSlateDark', familyId: 'slate', mode: 'dark', preview: { bg: '#1a1c1e', surface: '#292a2d', accent: '#a1c9ff', text: '#e3e2e6' } };
const slateDim: ThemePreset = { id: 'slate-dim', labelKey: 'settingsPage.presetSlateDim', familyId: 'slate', mode: 'dim', preview: { bg: '#333538', surface: '#3a3b3e', accent: '#a1c9ff', text: '#e3e2e6' } };
const slateLight: ThemePreset = { id: 'slate-light', labelKey: 'settingsPage.presetSlateLight', familyId: 'slate', mode: 'light', preview: { bg: '#fdfcff', surface: '#dfe2eb', accent: '#1160a4', text: '#1a1c1e' } };
const slateOnyx: ThemePreset = { id: 'slate-onyx', labelKey: 'settingsPage.presetSlateOnyx', familyId: 'slate', mode: 'onyx', preview: { bg: '#000000', surface: '#121316', accent: '#a1c9ff', text: '#e3e2e6' } };

// ─── Forest ───
const forestDark: ThemePreset = { id: 'forest-dark', labelKey: 'settingsPage.presetForestDark', familyId: 'forest', mode: 'dark', preview: { bg: '#191c19', surface: '#282b28', accent: '#7dda9b', text: '#e1e3de' } };
const forestDim: ThemePreset = { id: 'forest-dim', labelKey: 'settingsPage.presetForestDim', familyId: 'forest', mode: 'dim', preview: { bg: '#333532', surface: '#393c39', accent: '#7dda9b', text: '#e1e3de' } };
const forestLight: ThemePreset = { id: 'forest-light', labelKey: 'settingsPage.presetForestLight', familyId: 'forest', mode: 'light', preview: { bg: '#fbfdf8', surface: '#dde5db', accent: '#006d3b', text: '#191c19' } };
const forestOnyx: ThemePreset = { id: 'forest-onyx', labelKey: 'settingsPage.presetForestOnyx', familyId: 'forest', mode: 'onyx', preview: { bg: '#000000', surface: '#111411', accent: '#7dda9b', text: '#e1e3de' } };

// ─── Berry ───
const berryDark: ThemePreset = { id: 'berry-dark', labelKey: 'settingsPage.presetBerryDark', familyId: 'berry', mode: 'dark', preview: { bg: '#1f1a1d', surface: '#2d292b', accent: '#ffabf0', text: '#e9e0e4' } };
const berryDim: ThemePreset = { id: 'berry-dim', labelKey: 'settingsPage.presetBerryDim', familyId: 'berry', mode: 'dim', preview: { bg: '#383336', surface: '#3f3a3d', accent: '#ffabf0', text: '#e9e0e4' } };
const berryLight: ThemePreset = { id: 'berry-light', labelKey: 'settingsPage.presetBerryLight', familyId: 'berry', mode: 'light', preview: { bg: '#fffbff', surface: '#eedee7', accent: '#8c4383', text: '#1f1a1d' } };
const berryOnyx: ThemePreset = { id: 'berry-onyx', labelKey: 'settingsPage.presetBerryOnyx', familyId: 'berry', mode: 'onyx', preview: { bg: '#000000', surface: '#161215', accent: '#ffabf0', text: '#e9e0e4' } };

// ─── Sand ───
const sandDark: ThemePreset = { id: 'sand-dark', labelKey: 'settingsPage.presetSandDark', familyId: 'sand', mode: 'dark', preview: { bg: '#1d1b16', surface: '#2c2a24', accent: '#e5c44a', text: '#e8e2d9' } };
const sandDim: ThemePreset = { id: 'sand-dim', labelKey: 'settingsPage.presetSandDim', familyId: 'sand', mode: 'dim', preview: { bg: '#37342e', surface: '#3e3b35', accent: '#e5c44a', text: '#e8e2d9' } };
const sandLight: ThemePreset = { id: 'sand-light', labelKey: 'settingsPage.presetSandLight', familyId: 'sand', mode: 'light', preview: { bg: '#fffbff', surface: '#eae2cf', accent: '#715d00', text: '#1d1b16' } };
const sandOnyx: ThemePreset = { id: 'sand-onyx', labelKey: 'settingsPage.presetSandOnyx', familyId: 'sand', mode: 'onyx', preview: { bg: '#000000', surface: '#15130e', accent: '#e5c44a', text: '#e8e2d9' } };

// All 40 presets — 100% Material Design 3
export const THEME_PRESETS: ThemePreset[] = [
  odinDark, odinDim, odinLight, odinOnyx,
  roseDark, roseDim, roseLight, roseOnyx,
  jadeDark, jadeDim, jadeLight, jadeOnyx,
  oceanDark, oceanDim, oceanLight, oceanOnyx,
  amberDark, amberDim, amberLight, amberOnyx,
  coralDark, coralDim, coralLight, coralOnyx,
  slateDark, slateDim, slateLight, slateOnyx,
  forestDark, forestDim, forestLight, forestOnyx,
  berryDark, berryDim, berryLight, berryOnyx,
  sandDark, sandDim, sandLight, sandOnyx,
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getPreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? odinDark;
}

export function getFamily(familyId: string): ThemeFamily {
  return THEME_FAMILIES.find((f) => f.id === familyId) ?? THEME_FAMILIES[0];
}

export function getFamilyPreset(familyId: string, mode: ThemeMode): ThemePreset {
  const match = THEME_PRESETS.find((p) => p.familyId === familyId && p.mode === mode);
  if (match) return match;
  // Fallback to dark preset of that family
  return THEME_PRESETS.find((p) => p.familyId === familyId && p.mode === 'dark') ?? odinDark;
}

export function getFamilies(): ThemeFamily[] {
  return THEME_FAMILIES;
}

export function getCurrentFamily(presetId: ThemePresetId): ThemeFamily {
  const preset = getPreset(presetId);
  return getFamily(preset.familyId);
}

/**
 * Apply a theme preset via the `data-theme` attribute on <html>.
 * - odin-dark: Remove data-theme -> use default @theme CSS.
 * - All other themes (including odin-light): Set data-theme="{id}" -> :root[data-theme="{id}"] CSS overrides.
 */
export function applyPresetColors(preset: ThemePreset): void {
  const root = document.documentElement;

  // 1. Remove leftover inline color overrides (from accent or legacy)
  clearInlineColors();

  // 2. Set or remove data-theme attribute
  // odin-dim is the @theme default — no data-theme needed (avoids override)
  if (preset.id === 'odin-dim') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', preset.id);
  }
}

/** Remove only inline style color properties */
// Called during theme switch to ensure no stale inline overrides remain.
// ModuleLayout will re-apply its own --color-primary/--color-ring as inline styles.
function clearInlineColors(): void {
  const root = document.documentElement;
  const props = [
    '--color-background', '--color-foreground',
    '--color-card', '--color-card-foreground',
    '--color-popover', '--color-popover-foreground',
    '--color-primary', '--color-primary-foreground',
    '--color-secondary', '--color-secondary-foreground',
    '--color-muted', '--color-muted-foreground',
    '--color-accent', '--color-accent-foreground',
    '--color-destructive', '--color-destructive-foreground',
    '--color-border', '--color-input', '--color-ring',
    '--color-surface', '--color-chrome',
    '--color-surface-low-from', '--color-surface-low-to',
    '--color-surface-high-from', '--color-surface-high-to',
    '--color-gradient-from', '--color-gradient-mid', '--color-gradient-to',
    '--color-gradient-n-from', '--color-gradient-n-mid', '--color-gradient-n-to',
    '--color-surface-n-low-from', '--color-surface-n-low-to',
    '--color-surface-n-high-from', '--color-surface-n-high-to',
    '--color-gradient-s-from', '--color-gradient-s-mid', '--color-gradient-s-to',
    '--color-surface-s-low-from', '--color-surface-s-low-to',
    '--color-surface-s-high-from', '--color-surface-s-high-to',
    '--color-chart-1', '--color-chart-2',
  ];
  for (const prop of props) {
    root.style.removeProperty(prop);
  }
}
