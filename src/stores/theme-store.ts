import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type ThemePresetId,
  type ThemeMode,
  getPreset,
  getFamilyPreset,
  applyPresetColors,
} from '@/lib/theme-presets';

type Theme = 'dark' | 'dim' | 'light' | 'onyx';

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
  intensity: 'vivid' | 'subtle' | 'neutral';
  _lastDarkMode: ThemeMode;
  _lastModified: number;

  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  setFamily: (familyId: string) => void;
  setThemePreset: (preset: ThemePresetId) => void;
  setDensity: (density: Density) => void;
  setFontSize: (size: number) => void;
  setIntensity: (intensity: 'vivid' | 'subtle' | 'neutral') => void;
  initTheme: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'dim', 'light', 'onyx');
  root.classList.add(theme === 'light' ? 'light' : 'dark');
  if (theme === 'dim') root.classList.add('dim');
  if (theme === 'onyx') root.classList.add('onyx');
  updateFavicon(theme);
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

function updateFavicon(theme: Theme) {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!favicon) return;
  // logo.png for dark modes (dark/dim/onyx), logo2.png for light mode
  favicon.href = theme === 'light' ? '/logo2.png' : '/logo.png';
}

/** Detect OS color scheme preference for first-time users */
function getSystemPreferredPreset(): { theme: Theme; preset: ThemePresetId } {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return { theme: 'light', preset: 'odin-light' };
  }
  return { theme: 'dim', preset: 'odin-dim' };
}

const systemDefaults = getSystemPreferredPreset();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: systemDefaults.theme,
      themePreset: systemDefaults.preset,
      density: 'normal',
      fontSize: 14,
      intensity: 'subtle',
      _lastDarkMode: systemDefaults.theme === 'light' ? 'dim' : systemDefaults.theme,
      _lastModified: 0,

      toggleTheme: () => {
        const current = getPreset(get().themePreset);
        if (current.mode === 'light') {
          // Light → retour au dernier mode sombre mémorisé
          const darkMode = get()._lastDarkMode;
          const newPreset = getFamilyPreset(current.familyId, darkMode);
          set({ theme: newPreset.mode, themePreset: newPreset.id, _lastModified: Date.now() });
          applyFullTheme(newPreset.id);
        } else {
          // Dark/dim/onyx → mémoriser puis passer en light
          const newPreset = getFamilyPreset(current.familyId, 'light');
          set({ theme: newPreset.mode, themePreset: newPreset.id, _lastDarkMode: current.mode, _lastModified: Date.now() });
          applyFullTheme(newPreset.id);
        }
      },

      setMode: (mode: ThemeMode) => {
        const current = getPreset(get().themePreset);
        const newPreset = getFamilyPreset(current.familyId, mode);
        const updates: Partial<ThemeState> = { theme: newPreset.mode, themePreset: newPreset.id, _lastModified: Date.now() };
        if (mode !== 'light') updates._lastDarkMode = mode;
        set(updates as ThemeState);
        applyFullTheme(newPreset.id);
      },

      setFamily: (familyId: string) => {
        const currentMode = getPreset(get().themePreset).mode;
        const newPreset = getFamilyPreset(familyId, currentMode);
        set({ theme: newPreset.mode, themePreset: newPreset.id, _lastModified: Date.now() });
        applyFullTheme(newPreset.id);
      },

      setThemePreset: (presetId) => {
        const preset = getPreset(presetId);
        set({ themePreset: presetId, theme: preset.mode, _lastModified: Date.now() });
        applyFullTheme(presetId);
      },

      setDensity: (density) => {
        set({ density, _lastModified: Date.now() });
        applyDensity(density, get().fontSize);
      },

      setFontSize: (fontSize) => {
        const clamped = Math.min(18, Math.max(12, fontSize));
        set({ fontSize: clamped, _lastModified: Date.now() });
        applyDensity(get().density, clamped);
      },

      setIntensity: (intensity) => {
        set({ intensity, _lastModified: Date.now() });
        const root = document.documentElement;
        if (intensity === 'vivid') {
          root.removeAttribute('data-intensity');
        } else {
          root.setAttribute('data-intensity', intensity);
        }
      },

      initTheme: () => {
        const { themePreset, density, fontSize, intensity } = get();
        applyFullTheme(themePreset);
        applyDensity(density, fontSize);
        updateFavicon(get().theme);
        // Apply intensity
        if (intensity !== 'vivid') {
          document.documentElement.setAttribute('data-intensity', intensity);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
