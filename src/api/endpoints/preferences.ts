import api from '../axios';
import type { KeyCombo } from '@/stores/keybindings-store';
import type { WidgetConfig, ShortcutConfig, WidgetSettings } from '@/stores/dashboard-store';
import type { WorkspaceProfile } from '@/stores/profiles-store';

export interface SyncablePreferences {
  theme: {
    theme: string;
    themePreset: string;
    density: string;
    fontSize: number;
  };
  language: {
    language: string;
  };
  keybindings: {
    bindings: Array<{ id: string; userCombo: KeyCombo | null }>;
  };
  dashboard: {
    widgets: WidgetConfig[];
    customShortcuts: ShortcutConfig[];
    widgetSettings: WidgetSettings;
  };
  profiles: {
    profiles: WorkspaceProfile[];
    activeProfileId: string | null;
  };
  tour: {
    completedTours: string[];
    dismissedTips: string[];
  };
}

export interface PreferencesPayload {
  preferencesJson: string;
  lastModified: string;
  version: number;
}

export const preferencesApi = {
  get: () => api.get<PreferencesPayload>('/users/me/preferences', { skipAuthRedirect: true }),
  update: (payload: PreferencesPayload) =>
    api.put<PreferencesPayload>('/users/me/preferences', payload, { skipAuthRedirect: true }),
};
