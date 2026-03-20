import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type ThemePresetId,
  getPreset,
  applyPresetColors,
} from '@/lib/theme-presets';

type Theme = 'dark' | 'light';

export type Density = 'compact' | 'normal' | 'comfortable';

// ─── Density Presets ───
const DENSITY_CONFIG: Record<Density, { rowHeight: number; gap: number; padding: number; defaultFontSize: number }> = {
  compact:     { rowHeight: 32, gap: 8,  padding: 8,  defaultFontSize: 12 },
  normal:      { rowHeight: 40, gap: 12, padding: 12, defaultFontSize: 14 },
  comfortable: { rowHeight: 48, gap: 16, padding: 16, defaultFontSize: 15 },
};

interface ThemeState {
  theme: Theme;
  themePreset: ThemePresetId;
  density: Density;
  fontSize: number; // 12–18
  iconOnlyButtons: boolean; // hide button text labels, show only icons with tooltips
  accentedUI: boolean; // use module accent color for header icon, toggles, sidebar highlights
  
  toggleTheme: () => void;
  setThemePreset: (preset: ThemePresetId) => void;
  setDensity: (density: Density) => void;
  setFontSize: (size: number) => void;
  setIconOnlyButtons: (value: boolean) => void;
  setAccentedUI: (value: boolean) => void;
  initTheme: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
}

/** Apply preset colors + dark/light mode */
function applyFullTheme(presetId: ThemePresetId) {
  const preset = getPreset(presetId);
  applyPresetColors(preset);
  applyTheme(preset.mode);
}

function applyDensity(density: Density, fontSize: number) {
  const root = document.documentElement;
  const config = DENSITY_CONFIG[density];

  root.style.setProperty('--density-row-height', `${config.rowHeight}px`);
  root.style.setProperty('--density-gap', `${config.gap}px`);
  root.style.setProperty('--density-padding', `${config.padding}px`);
  root.style.setProperty('--font-size-base', `${fontSize}px`);

  // Scale html font-size as percentage of 16px browser default.
  // This makes all rem-based Tailwind classes (text-sm, text-xs, p-4, etc.) scale.
  // fontSize 14 → 100% (default), 12 → 87.5%, 16 → 112.5%, 18 → 125%
  const scalePercent = (fontSize / 14) * 100;
  root.style.setProperty('font-size', `${scalePercent}%`);

  // Apply density class for Tailwind selectors
  root.classList.remove('density-compact', 'density-normal', 'density-comfortable');
  root.classList.add(`density-${density}`);
}

function updateFaviconBasedOnBrowserTheme() {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!favicon) return;

  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const updateIcon = (e: MediaQueryList | MediaQueryListEvent) => {
    // logo.png for dark browser theme, logo2.png for light browser theme
    favicon.href = e.matches ? '/logo.png' : '/logo2.png';
  };

  // Apply initial favicon
  updateIcon(darkModeMediaQuery);

  // Listen for changes in browser theme
  darkModeMediaQuery.addEventListener('change', updateIcon);
}

/** Detect OS color scheme preference for first-time users */
function getSystemPreferredPreset(): { theme: Theme; preset: ThemePresetId } {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return { theme: 'light', preset: 'odin-light' };
  }
  return { theme: 'dark', preset: 'odin-dark' };
}

const systemDefaults = getSystemPreferredPreset();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: systemDefaults.theme,
      themePreset: systemDefaults.preset,
      density: 'normal',
      fontSize: 14,
      iconOnlyButtons: false,
      accentedUI: true,

      toggleTheme: () => {
        const current = getPreset(get().themePreset);
        const newPreset = getPreset(current.pairId);
        set({ theme: newPreset.mode, themePreset: newPreset.id });
        applyFullTheme(newPreset.id);
      },

      setThemePreset: (presetId) => {
        const preset = getPreset(presetId);
        set({ themePreset: presetId, theme: preset.mode });
        applyFullTheme(presetId);
      },

      setDensity: (density) => {
        set({ density });
        applyDensity(density, get().fontSize);
      },

      setFontSize: (fontSize) => {
        const clamped = Math.min(18, Math.max(12, fontSize));
        set({ fontSize: clamped });
        applyDensity(get().density, clamped);
      },

      setIconOnlyButtons: (value) => set({ iconOnlyButtons: value }),

      setAccentedUI: (value) => set({ accentedUI: value }),

      initTheme: () => {
        const { themePreset, density, fontSize } = get();
        applyFullTheme(themePreset);
        applyDensity(density, fontSize);
        updateFaviconBasedOnBrowserTheme();
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
