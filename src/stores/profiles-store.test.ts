import { describe, it, expect, beforeEach } from 'vitest';
import { useProfilesStore, type ProfileSnapshot } from './profiles-store';

// ═══════════════════════════════════════════════════════════════════════════
// PROFILES STORE TESTS
// ═══════════════════════════════════════════════════════════════════════════

const makeSnapshot = (overrides?: Partial<ProfileSnapshot>): ProfileSnapshot => ({
  themePreset: 'odin-dark',
  density: 'normal',
  fontSize: 14,
  iconOnlyButtons: false,
  globalSidebarOpen: true,
  tabBarVisible: true,
  showBreadcrumbs: true,
  activityBarVisible: true,
  statusBarVisible: true,
  menuBarVisible: true,
  activityBarItems: [],
  dashboardWidgets: [
    { id: 'quick-shortcuts', visible: true },
    { id: 'recent-activity', visible: true },
    { id: 'latest-notes', visible: true },
    { id: 'notifications', visible: true },
  ],
  dashboardShortcuts: [],
  bottomPanelVisible: false,
  bottomPanelAlignment: 'center',
  openTabs: [],
  activeTabId: null,
  ...overrides,
});

describe('profilesStore', () => {
  beforeEach(() => {
    useProfilesStore.getState().resetToDefaults();
  });

  it('initializes with a default profile', () => {
    const { profiles, activeProfileId } = useProfilesStore.getState();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].isDefault).toBe(true);
    expect(profiles[0].id).toBe('default');
    expect(activeProfileId).toBe('default');
  });

  it('creates a new profile and sets it as active', () => {
    const snapshot = makeSnapshot({ themePreset: 'nord' });
    const id = useProfilesStore.getState().createProfile('Research', 'microscope', 'For research work', snapshot);

    const { profiles, activeProfileId } = useProfilesStore.getState();
    expect(profiles).toHaveLength(2);
    expect(activeProfileId).toBe(id);

    const created = profiles.find((p) => p.id === id)!;
    expect(created.name).toBe('Research');
    expect(created.icon).toBe('microscope');
    expect(created.description).toBe('For research work');
    expect(created.snapshot.themePreset).toBe('nord');
    expect(created.isDefault).toBe(false);
  });

  it('renames a profile', () => {
    const id = useProfilesStore.getState().createProfile('Old Name', 'zap', '', makeSnapshot());
    useProfilesStore.getState().renameProfile(id, 'New Name');

    const profile = useProfilesStore.getState().profiles.find((p) => p.id === id)!;
    expect(profile.name).toBe('New Name');
  });

  it('updates profile metadata', () => {
    const id = useProfilesStore.getState().createProfile('Test', 'zap', 'old desc', makeSnapshot());
    useProfilesStore.getState().updateProfileMeta(id, { icon: 'coffee', description: 'new desc' });

    const profile = useProfilesStore.getState().profiles.find((p) => p.id === id)!;
    expect(profile.icon).toBe('coffee');
    expect(profile.description).toBe('new desc');
  });

  it('updates profile snapshot', () => {
    const id = useProfilesStore.getState().createProfile('Test', 'zap', '', makeSnapshot());
    const newSnapshot = makeSnapshot({ themePreset: 'dracula', density: 'compact' });
    useProfilesStore.getState().updateProfileSnapshot(id, newSnapshot);

    const profile = useProfilesStore.getState().profiles.find((p) => p.id === id)!;
    expect(profile.snapshot.themePreset).toBe('dracula');
    expect(profile.snapshot.density).toBe('compact');
  });

  it('deletes a non-default profile', () => {
    const id = useProfilesStore.getState().createProfile('ToDelete', 'zap', '', makeSnapshot());
    expect(useProfilesStore.getState().profiles).toHaveLength(2);

    useProfilesStore.getState().deleteProfile(id);
    expect(useProfilesStore.getState().profiles).toHaveLength(1);
    expect(useProfilesStore.getState().activeProfileId).toBe('default');
  });

  it('cannot delete the default profile', () => {
    useProfilesStore.getState().deleteProfile('default');
    expect(useProfilesStore.getState().profiles).toHaveLength(1);
    expect(useProfilesStore.getState().profiles[0].id).toBe('default');
  });

  it('exports and imports a profile', () => {
    const snapshot = makeSnapshot({ themePreset: 'monokai', density: 'comfortable' });
    const id = useProfilesStore.getState().createProfile('Exported', 'sparkles', 'test desc', snapshot);

    const json = useProfilesStore.getState().exportProfile(id);
    expect(json).toBeTruthy();

    // Reset and re-import
    useProfilesStore.getState().resetToDefaults();
    expect(useProfilesStore.getState().profiles).toHaveLength(1);

    const importedId = useProfilesStore.getState().importProfile(json!);
    expect(importedId).toBeTruthy();

    const imported = useProfilesStore.getState().profiles.find((p) => p.id === importedId)!;
    expect(imported.name).toBe('Exported');
    expect(imported.snapshot.themePreset).toBe('monokai');
    expect(imported.snapshot.density).toBe('comfortable');
    expect(imported.description).toBe('test desc');
  });

  it('returns null for invalid JSON import', () => {
    const result = useProfilesStore.getState().importProfile('not valid json');
    expect(result).toBeNull();
  });

  it('returns null for import with missing required fields', () => {
    const result = useProfilesStore.getState().importProfile(JSON.stringify({ foo: 'bar' }));
    expect(result).toBeNull();
  });

  it('sets active profile ID', () => {
    const id = useProfilesStore.getState().createProfile('Test', 'zap', '', makeSnapshot());
    useProfilesStore.getState().setActiveProfileId('default');
    expect(useProfilesStore.getState().activeProfileId).toBe('default');
    useProfilesStore.getState().setActiveProfileId(id);
    expect(useProfilesStore.getState().activeProfileId).toBe(id);
  });

  it('resets to defaults', () => {
    useProfilesStore.getState().createProfile('A', 'zap', '', makeSnapshot());
    useProfilesStore.getState().createProfile('B', 'coffee', '', makeSnapshot());
    expect(useProfilesStore.getState().profiles).toHaveLength(3);

    useProfilesStore.getState().resetToDefaults();
    expect(useProfilesStore.getState().profiles).toHaveLength(1);
    expect(useProfilesStore.getState().activeProfileId).toBe('default');
  });

  it('falls back to default profile when deleting the active profile', () => {
    const id = useProfilesStore.getState().createProfile('Active', 'zap', '', makeSnapshot());
    expect(useProfilesStore.getState().activeProfileId).toBe(id);

    useProfilesStore.getState().deleteProfile(id);
    expect(useProfilesStore.getState().activeProfileId).toBe('default');
  });

  it('saves open tabs in profile snapshot', () => {
    const tabs = [
      { id: 'tab-1', path: '/lab/notes', title: 'Notes', icon: 'sticky-note' },
      { id: 'tab-2', path: '/lab/contacts', title: 'Contacts', icon: 'users' },
    ];
    const snapshot = makeSnapshot({ openTabs: tabs, activeTabId: 'tab-1' });
    const id = useProfilesStore.getState().createProfile('With Tabs', 'monitor', '', snapshot);

    const profile = useProfilesStore.getState().profiles.find((p) => p.id === id)!;
    expect(profile.snapshot.openTabs).toHaveLength(2);
    expect(profile.snapshot.openTabs[0].path).toBe('/lab/notes');
    expect(profile.snapshot.activeTabId).toBe('tab-1');
  });
});
