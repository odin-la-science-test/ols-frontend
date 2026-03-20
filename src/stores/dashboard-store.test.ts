import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore, DEFAULT_SHORTCUTS } from './dashboard-store';

describe('dashboard-store', () => {
  beforeEach(() => {
    // Reset to default state
    useDashboardStore.setState({
      widgets: [
        { id: 'quick-shortcuts', visible: true },
        { id: 'recent-activity', visible: true },
        { id: 'latest-notes', visible: true },
        { id: 'notifications', visible: true },
      ],
      editMode: false,
      customShortcuts: DEFAULT_SHORTCUTS,
    });
  });

  it('should have default widgets', () => {
    const { widgets } = useDashboardStore.getState();
    expect(widgets).toHaveLength(4);
    expect(widgets[0].id).toBe('quick-shortcuts');
    expect(widgets.every((w) => w.visible)).toBe(true);
  });

  it('should add a custom shortcut', () => {
    useDashboardStore.getState().addShortcut({ path: '/atlas/bacteriology', label: 'bacteriology.title', icon: 'bug' });
    const { customShortcuts } = useDashboardStore.getState();
    expect(customShortcuts).toHaveLength(DEFAULT_SHORTCUTS.length + 1);
    expect(customShortcuts.some((s) => s.path === '/atlas/bacteriology')).toBe(true);
  });

  it('should not add duplicate shortcuts', () => {
    useDashboardStore.getState().addShortcut({ path: '/lab/notes', label: 'notes.title', icon: 'sticky-note' });
    useDashboardStore.getState().addShortcut({ path: '/lab/notes', label: 'notes.title', icon: 'sticky-note' });
    // /lab/notes is already in DEFAULT_SHORTCUTS, so length should stay at DEFAULT_SHORTCUTS.length
    expect(useDashboardStore.getState().customShortcuts).toHaveLength(DEFAULT_SHORTCUTS.length);
  });

  it('should remove a custom shortcut', () => {
    // DEFAULT_SHORTCUTS has /lab/notes; remove it
    useDashboardStore.getState().removeShortcut('/lab/notes');
    const { customShortcuts } = useDashboardStore.getState();
    expect(customShortcuts).toHaveLength(DEFAULT_SHORTCUTS.length - 1);
    expect(customShortcuts.some((s) => s.path === '/lab/notes')).toBe(false);
  });

  it('should toggle widget visibility', () => {
    useDashboardStore.getState().setWidgetVisible('notifications', false);
    const { widgets } = useDashboardStore.getState();
    const notifWidget = widgets.find((w) => w.id === 'notifications');
    expect(notifWidget?.visible).toBe(false);
  });

  it('should move widget up', () => {
    useDashboardStore.getState().moveWidget('recent-activity', 'up');
    const { widgets } = useDashboardStore.getState();
    expect(widgets[0].id).toBe('recent-activity');
    expect(widgets[1].id).toBe('quick-shortcuts');
  });

  it('should move widget down', () => {
    useDashboardStore.getState().moveWidget('quick-shortcuts', 'down');
    const { widgets } = useDashboardStore.getState();
    expect(widgets[0].id).toBe('recent-activity');
    expect(widgets[1].id).toBe('quick-shortcuts');
  });

  it('should not move first widget up', () => {
    useDashboardStore.getState().moveWidget('quick-shortcuts', 'up');
    const { widgets } = useDashboardStore.getState();
    expect(widgets[0].id).toBe('quick-shortcuts');
  });

  it('should not move last widget down', () => {
    useDashboardStore.getState().moveWidget('notifications', 'down');
    const { widgets } = useDashboardStore.getState();
    expect(widgets[3].id).toBe('notifications');
  });

  it('should toggle edit mode', () => {
    expect(useDashboardStore.getState().editMode).toBe(false);
    useDashboardStore.getState().toggleEditMode();
    expect(useDashboardStore.getState().editMode).toBe(true);
    useDashboardStore.getState().toggleEditMode();
    expect(useDashboardStore.getState().editMode).toBe(false);
  });

  it('should reset to defaults', () => {
    // Modify state
    useDashboardStore.getState().setWidgetVisible('quick-shortcuts', false);
    useDashboardStore.getState().removeShortcut('/lab/notes');

    // Reset
    useDashboardStore.getState().resetToDefaults();
    const state = useDashboardStore.getState();
    expect(state.widgets.every((w) => w.visible)).toBe(true);
    expect(state.widgets).toHaveLength(4);
    expect(state.customShortcuts).toHaveLength(DEFAULT_SHORTCUTS.length);
  });
});
