import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE SETTINGS STORE — Persisted storage for dynamic module settings
//
// Modules contribute settings via the registry (ModuleSettingsSection).
// Values are stored here with localStorage persistence under
// 'ols-module-settings'.
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleSettingsState {
  /** Setting values keyed by field key */
  values: Record<string, unknown>;
  /** Set a single setting value */
  setValue: (key: string, value: unknown) => void;
  /** Get a setting value, falling back to the provided default */
  getValue: <T>(key: string, defaultValue: T) => T;
}

export const useModuleSettingsStore = create<ModuleSettingsState>()(
  persist(
    (set, get) => ({
      values: {},

      setValue: (key, value) =>
        set((state) => ({
          values: { ...state.values, [key]: value },
        })),

      getValue: <T,>(key: string, defaultValue: T): T => {
        const stored = get().values[key];
        return stored !== undefined ? (stored as T) : defaultValue;
      },
    }),
    { name: 'ols-module-settings' },
  ),
);
