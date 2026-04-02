import { logger } from '@/lib/logger';
import { isGuestUser } from '@/lib/guest-access';
import type { ThemePresetId } from '@/lib/theme-presets';
import { preferencesApi } from '@/api';
import type { SyncablePreferences, PreferencesPayload } from '@/api';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useLanguageStore } from '@/stores/language-store';
import { useKeybindingsStore } from '@/stores/keybindings-store';
import { useDashboardStore } from '@/stores/dashboard-store';
import { useProfilesStore } from '@/stores/profiles-store';
import { useTourStore } from '@/stores/tour-store';
import type { Density } from '@/stores/theme-store';
import type { AxiosError } from 'axios';

const log = logger.tagged('preferences-sync');

const SYNC_VERSION = 1;
const DEBOUNCE_MS = 3000;

let _saveTimer: ReturnType<typeof setTimeout> | null = null;
let _unsubscribers: Array<() => void> = [];
let _applyingFromServer = false;

// ─── Collect ───

export function collectPreferences(): SyncablePreferences {
  const theme = useThemeStore.getState();
  const language = useLanguageStore.getState();
  const keybindings = useKeybindingsStore.getState();
  const dashboard = useDashboardStore.getState();
  const profiles = useProfilesStore.getState();

  return {
    theme: {
      theme: theme.theme,
      themePreset: theme.themePreset,
      density: theme.density,
      fontSize: theme.fontSize,
    },
    language: {
      language: language.language,
    },
    keybindings: {
      bindings: keybindings.bindings
        .filter((b) => b.userCombo !== null)
        .map((b) => ({ id: b.id, userCombo: b.userCombo })),
    },
    dashboard: {
      widgets: dashboard.widgets,
      customShortcuts: dashboard.customShortcuts,
      widgetSettings: dashboard.widgetSettings,
    },
    profiles: {
      profiles: profiles.profiles,
      activeProfileId: profiles.activeProfileId,
    },
    tour: {
      completedTours: useTourStore.getState().completedTours,
      dismissedTips: useTourStore.getState().dismissedTips,
    },
  };
}

// ─── Apply ───

export function applyPreferences(prefs: SyncablePreferences): void {
  _applyingFromServer = true;
  try {
    // Theme
    const ts = useThemeStore.getState();
    ts.setThemePreset(prefs.theme.themePreset as ThemePresetId);
    ts.setDensity(prefs.theme.density as Density);
    ts.setFontSize(prefs.theme.fontSize);

    // Language
    useLanguageStore.getState().changeLanguage(prefs.language.language);

    // Keybindings — merge user overrides into current bindings
    const kb = useKeybindingsStore.getState();
    for (const override of prefs.keybindings.bindings) {
      if (override.userCombo) {
        kb.setKeybinding(override.id as Parameters<typeof kb.setKeybinding>[0], override.userCombo);
      }
    }

    // Dashboard
    useDashboardStore.setState({
      widgets: prefs.dashboard.widgets,
      customShortcuts: prefs.dashboard.customShortcuts,
      widgetSettings: prefs.dashboard.widgetSettings,
    });

    // Profiles
    useProfilesStore.setState({
      profiles: prefs.profiles.profiles,
      activeProfileId: prefs.profiles.activeProfileId,
    });

    // Tour
    if (prefs.tour) {
      useTourStore.setState({
        completedTours: prefs.tour.completedTours,
        dismissedTips: prefs.tour.dismissedTips,
      });
    }
  } finally {
    setTimeout(() => { _applyingFromServer = false; }, 50);
  }
}

// ─── Timestamp helpers ───

function getLocalLastModified(): number {
  return Math.max(
    useThemeStore.getState()._lastModified,
    useLanguageStore.getState()._lastModified,
    useKeybindingsStore.getState()._lastModified,
    useDashboardStore.getState()._lastModified,
    useProfilesStore.getState()._lastModified,
    useTourStore.getState()._lastModified,
  );
}

function buildPayload(): PreferencesPayload {
  return {
    preferencesJson: JSON.stringify(collectPreferences()),
    lastModified: new Date(getLocalLastModified() || Date.now()).toISOString(),
    version: SYNC_VERSION,
  };
}

// ─── Sync on login ───

export async function syncOnLogin(): Promise<void> {
  try {
    const response = await preferencesApi.get();

    // 204 No Content = no server prefs yet → push local
    if (response.status === 204 || !response.data?.preferencesJson) {
      log.info('Aucune preference serveur, push local');
      await preferencesApi.update(buildPayload());
      return;
    }

    const serverPayload = response.data;
    const serverTime = new Date(serverPayload.lastModified).getTime();
    const localTime = getLocalLastModified();

    if (serverTime > localTime) {
      log.info('Preferences serveur plus recentes, application');
      const prefs: SyncablePreferences = JSON.parse(serverPayload.preferencesJson);
      applyPreferences(prefs);
    } else if (localTime > serverTime) {
      log.info('Preferences locales plus recentes, push vers serveur');
      await preferencesApi.update(buildPayload());
    } else {
      log.debug('Preferences synchronisees');
    }
  } catch (err) {
    log.error('Erreur lors de la synchronisation des preferences', err);
  }
}

// ─── Debounced save ───

async function saveToServer(): Promise<void> {
  if (_applyingFromServer) return;

  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || isGuestUser()) return;

  try {
    await preferencesApi.update(buildPayload());
    log.debug('Preferences sauvegardees');
  } catch (err) {
    const axiosErr = err as AxiosError<PreferencesPayload>;
    if (axiosErr.response?.status === 409 && axiosErr.response.data?.preferencesJson) {
      log.info('Conflit detecte, application des preferences serveur');
      const prefs: SyncablePreferences = JSON.parse(axiosErr.response.data.preferencesJson);
      applyPreferences(prefs);
    } else {
      log.error('Erreur lors de la sauvegarde des preferences', err);
    }
  }
}

function scheduleSave(): void {
  if (_applyingFromServer) return;
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => { saveToServer(); }, DEBOUNCE_MS);
}

// ─── Subscribe / Unsubscribe ───

export function initPreferencesSync(): void {
  stopPreferencesSync();

  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || isGuestUser()) return;

  // Skip first emission from each store (hydration)
  const stores = [useThemeStore, useLanguageStore, useKeybindingsStore, useDashboardStore, useProfilesStore, useTourStore];
  for (const store of stores) {
    let hydrated = false;
    const unsub = store.subscribe(() => {
      if (!hydrated) { hydrated = true; return; }
      scheduleSave();
    });
    _unsubscribers.push(unsub);
  }

  log.debug('Sync des preferences activee');
}

export function stopPreferencesSync(): void {
  if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
  for (const unsub of _unsubscribers) unsub();
  _unsubscribers = [];
  log.debug('Sync des preferences desactivee');
}
