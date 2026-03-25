// ═══════════════════════════════════════════════════════════════════════════
// THEME PRESETS - OLS Design System
// Colors are defined in index.css via :root[data-theme="xxx"] selectors.
// This file holds metadata (id, mode, preview) used by the Settings UI
// and the theme-store to switch themes via the data-theme attribute.
// ═══════════════════════════════════════════════════════════════════════════

export type ThemePresetId =
  | 'odin-dark'
  | 'odin-light'
  | 'nord'
  | 'nord-light'
  | 'dracula'
  | 'dracula-light'
  | 'solarized'
  | 'solarized-light'
  | 'monokai'
  | 'monokai-light'
  | 'github'
  | 'github-dark'
  | 'catppuccin'
  | 'catppuccin-light'
  | 'rose-pine'
  | 'rose-pine-light'
  | 'tokyo-night'
  | 'tokyo-night-light'
  | 'one-dark'
  | 'one-light'
  | 'cyberpunk'
  | 'cyberpunk-light'
  | 'synthwave'
  | 'synthwave-light';

export interface ThemePreset {
  id: ThemePresetId;
  labelKey: string;
  mode: 'dark' | 'light';
  pairId: ThemePresetId;
  preview: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
}

// ─── Odin Dark (Default) ───
const odinDark: ThemePreset = {
  id: 'odin-dark',
  labelKey: 'settingsPage.presetOdinDark',
  mode: 'dark',
  pairId: 'odin-light',
  preview: { bg: '#1e1e2e', surface: '#2a2a3c', accent: '#7c3aed', text: '#fafafa' },
};

// ─── Odin Light ───
const odinLight: ThemePreset = {
  id: 'odin-light',
  labelKey: 'settingsPage.presetOdinLight',
  mode: 'light',
  pairId: 'odin-dark',
  preview: { bg: '#f5f5f7', surface: '#ffffff', accent: '#7c3aed', text: '#1a1a2e' },
};

// ─── Nord ───
const nord: ThemePreset = {
  id: 'nord',
  labelKey: 'settingsPage.presetNord',
  mode: 'dark',
  pairId: 'nord-light',
  preview: { bg: '#2e3440', surface: '#3b4252', accent: '#88c0d0', text: '#eceff4' },
};

// ─── Dracula ───
const dracula: ThemePreset = {
  id: 'dracula',
  labelKey: 'settingsPage.presetDracula',
  mode: 'dark',
  pairId: 'dracula-light',
  preview: { bg: '#282a36', surface: '#44475a', accent: '#bd93f9', text: '#f8f8f2' },
};

// ─── Solarized Dark ───
const solarized: ThemePreset = {
  id: 'solarized',
  labelKey: 'settingsPage.presetSolarized',
  mode: 'dark',
  pairId: 'solarized-light',
  preview: { bg: '#002b36', surface: '#073642', accent: '#268bd2', text: '#839496' },
};

// ─── Monokai ───
const monokai: ThemePreset = {
  id: 'monokai',
  labelKey: 'settingsPage.presetMonokai',
  mode: 'dark',
  pairId: 'monokai-light',
  preview: { bg: '#272822', surface: '#3e3d32', accent: '#f92672', text: '#f8f8f2' },
};

// ─── GitHub Light ───
const github: ThemePreset = {
  id: 'github',
  labelKey: 'settingsPage.presetGitHub',
  mode: 'light',
  pairId: 'github-dark',
  preview: { bg: '#ffffff', surface: '#f6f8fa', accent: '#0969da', text: '#1f2328' },
};

// ─── Nord Light ───
const nordLight: ThemePreset = {
  id: 'nord-light',
  labelKey: 'settingsPage.presetNordLight',
  mode: 'light',
  pairId: 'nord',
  preview: { bg: '#eceff4', surface: '#e5e9f0', accent: '#5e81ac', text: '#2e3440' },
};

// ─── Dracula Light (Soft) ───
const draculaLight: ThemePreset = {
  id: 'dracula-light',
  labelKey: 'settingsPage.presetDraculaLight',
  mode: 'light',
  pairId: 'dracula',
  preview: { bg: '#f8f8f2', surface: '#f0f0ec', accent: '#7c3aed', text: '#282a36' },
};

// ─── Solarized Light ───
const solarizedLight: ThemePreset = {
  id: 'solarized-light',
  labelKey: 'settingsPage.presetSolarizedLight',
  mode: 'light',
  pairId: 'solarized',
  preview: { bg: '#fdf6e3', surface: '#eee8d5', accent: '#268bd2', text: '#657b83' },
};

// ─── Monokai Light (Pro Light) ───
const monokaiLight: ThemePreset = {
  id: 'monokai-light',
  labelKey: 'settingsPage.presetMonokaiLight',
  mode: 'light',
  pairId: 'monokai',
  preview: { bg: '#fafafa', surface: '#f0f0f0', accent: '#d33682', text: '#272822' },
};

// ─── GitHub Dark ───
const githubDark: ThemePreset = {
  id: 'github-dark',
  labelKey: 'settingsPage.presetGitHubDark',
  mode: 'dark',
  pairId: 'github',
  preview: { bg: '#0d1117', surface: '#161b22', accent: '#58a6ff', text: '#c9d1d9' },
};

// ─── Catppuccin Mocha (Dark) ───
const catppuccin: ThemePreset = {
  id: 'catppuccin',
  labelKey: 'settingsPage.presetCatppuccin',
  mode: 'dark',
  pairId: 'catppuccin-light',
  preview: { bg: '#1e1e2e', surface: '#313244', accent: '#cba6f7', text: '#cdd6f4' },
};

// ─── Catppuccin Latte (Light) ───
const catppuccinLight: ThemePreset = {
  id: 'catppuccin-light',
  labelKey: 'settingsPage.presetCatppuccinLight',
  mode: 'light',
  pairId: 'catppuccin',
  preview: { bg: '#eff1f5', surface: '#e6e9ef', accent: '#8839ef', text: '#4c4f69' },
};

// ─── Rosé Pine (Dark) ───
const rosePine: ThemePreset = {
  id: 'rose-pine',
  labelKey: 'settingsPage.presetRosePine',
  mode: 'dark',
  pairId: 'rose-pine-light',
  preview: { bg: '#191724', surface: '#26233a', accent: '#31748f', text: '#e0def4' },
};

// ─── Rosé Pine Dawn (Light) ───
const rosePineLight: ThemePreset = {
  id: 'rose-pine-light',
  labelKey: 'settingsPage.presetRosePineLight',
  mode: 'light',
  pairId: 'rose-pine',
  preview: { bg: '#faf4ed', surface: '#f2e9de', accent: '#286983', text: '#575279' },
};

// ─── Tokyo Night (Dark) ───
const tokyoNight: ThemePreset = {
  id: 'tokyo-night',
  labelKey: 'settingsPage.presetTokyoNight',
  mode: 'dark',
  pairId: 'tokyo-night-light',
  preview: { bg: '#1a1b26', surface: '#24283b', accent: '#7aa2f7', text: '#a9b1d6' },
};

// ─── Tokyo Night Light ───
const tokyoNightLight: ThemePreset = {
  id: 'tokyo-night-light',
  labelKey: 'settingsPage.presetTokyoNightLight',
  mode: 'light',
  pairId: 'tokyo-night',
  preview: { bg: '#d5d6db', surface: '#c8c9ce', accent: '#34548a', text: '#343b58' },
};

// ─── One Dark (Atom) ───
const oneDark: ThemePreset = {
  id: 'one-dark',
  labelKey: 'settingsPage.presetOneDark',
  mode: 'dark',
  pairId: 'one-light',
  preview: { bg: '#282c34', surface: '#21252b', accent: '#61afef', text: '#abb2bf' },
};

// ─── One Light (Atom) ───
const oneLight: ThemePreset = {
  id: 'one-light',
  labelKey: 'settingsPage.presetOneLight',
  mode: 'light',
  pairId: 'one-dark',
  preview: { bg: '#fafafa', surface: '#eaeaeb', accent: '#4078f2', text: '#383a42' },
};

// ─── Cyberpunk ───
const cyberpunk: ThemePreset = {
  id: 'cyberpunk',
  labelKey: 'settingsPage.presetCyberpunk',
  mode: 'dark',
  pairId: 'cyberpunk-light',
  preview: { bg: '#0a0a1a', surface: '#141428', accent: '#ff2a6d', text: '#05d9e8' },
};

// ─── Cyberpunk Light ───
const cyberpunkLight: ThemePreset = {
  id: 'cyberpunk-light',
  labelKey: 'settingsPage.presetCyberpunkLight',
  mode: 'light',
  pairId: 'cyberpunk',
  preview: { bg: '#f0eef5', surface: '#e2dff0', accent: '#d6145f', text: '#1a1a2e' },
};

// ─── Synthwave ───
const synthwave: ThemePreset = {
  id: 'synthwave',
  labelKey: 'settingsPage.presetSynthwave',
  mode: 'dark',
  pairId: 'synthwave-light',
  preview: { bg: '#1a1025', surface: '#241b35', accent: '#f97eff', text: '#e2b1ff' },
};

// ─── Synthwave Light ───
const synthwaveLight: ThemePreset = {
  id: 'synthwave-light',
  labelKey: 'settingsPage.presetSynthwaveLight',
  mode: 'light',
  pairId: 'synthwave',
  preview: { bg: '#f5eefa', surface: '#ecdff5', accent: '#9b30ff', text: '#2d1b4e' },
};

// ─── All Presets ───
// Grouped by family: dark first, then light pair. All 24 presets.
export const THEME_PRESETS: ThemePreset[] = [
  odinDark,
  odinLight,
  nord,
  nordLight,
  dracula,
  draculaLight,
  solarized,
  solarizedLight,
  monokai,
  monokaiLight,
  githubDark,
  github,
  catppuccin,
  catppuccinLight,
  rosePine,
  rosePineLight,
  tokyoNight,
  tokyoNightLight,
  oneDark,
  oneLight,
  cyberpunk,
  cyberpunkLight,
  synthwave,
  synthwaveLight,
];

export function getPreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? odinDark;
}

/**
 * Apply a theme preset via the `data-theme` attribute on <html>.
 * - odin-dark / odin-light: Remove data-theme → use default @theme / @variant light CSS.
 * - All other themes: Set data-theme="{id}" → :root[data-theme="{id}"] CSS overrides.
 */
export function applyPresetColors(preset: ThemePreset): void {
  const root = document.documentElement;

  // 1. Remove leftover inline color overrides (from accent or legacy)
  clearInlineColors();

  // 2. Set or remove data-theme attribute
  if (preset.id === 'odin-dark' || preset.id === 'odin-light') {
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
    '--color-chart-1', '--color-chart-2',
  ];
  for (const prop of props) {
    root.style.removeProperty(prop);
  }
}
