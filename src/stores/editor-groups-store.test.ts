import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorGroupsStore } from './editor-groups-store';

describe('useEditorGroupsStore', () => {
  beforeEach(() => {
    useEditorGroupsStore.setState({
      splitActive: false,
      splitDirection: 'horizontal',
      groups: [{ id: 'main', activeTabId: null, tabIds: [] }],
      focusedGroupId: 'main',
      panelSizes: [100],
    });
  });

  describe('split toggle', () => {
    it('should initialize with split disabled', () => {
      expect(useEditorGroupsStore.getState().splitActive).toBe(false);
    });

    it('should enable split', () => {
      useEditorGroupsStore.getState().enableSplit();
      const state = useEditorGroupsStore.getState();
      expect(state.splitActive).toBe(true);
      expect(state.groups).toHaveLength(2);
      expect(state.groups[1].id).toBe('split');
    });

    it('should disable split', () => {
      useEditorGroupsStore.getState().enableSplit();
      useEditorGroupsStore.getState().disableSplit();
      const state = useEditorGroupsStore.getState();
      expect(state.splitActive).toBe(false);
      expect(state.groups).toHaveLength(1);
      expect(state.panelSizes).toEqual([100]);
    });

    it('should toggle split', () => {
      useEditorGroupsStore.getState().toggleSplit();
      expect(useEditorGroupsStore.getState().splitActive).toBe(true);
      useEditorGroupsStore.getState().toggleSplit();
      expect(useEditorGroupsStore.getState().splitActive).toBe(false);
    });
  });

  describe('split direction', () => {
    it('should default to horizontal', () => {
      expect(useEditorGroupsStore.getState().splitDirection).toBe('horizontal');
    });

    it('should set direction to vertical', () => {
      useEditorGroupsStore.getState().setSplitDirection('vertical');
      expect(useEditorGroupsStore.getState().splitDirection).toBe('vertical');
    });
  });

  describe('focus', () => {
    it('should set focused group', () => {
      useEditorGroupsStore.getState().enableSplit();
      useEditorGroupsStore.getState().setFocusedGroup('split');
      expect(useEditorGroupsStore.getState().focusedGroupId).toBe('split');
    });
  });

  describe('tab management', () => {
    it('should add tab to group', () => {
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-1');
      const mainGroup = useEditorGroupsStore.getState().groups.find((g) => g.id === 'main');
      expect(mainGroup?.tabIds).toContain('tab-1');
      expect(mainGroup?.activeTabId).toBe('tab-1');
    });

    it('should not duplicate tab in group', () => {
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-1');
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-1');
      const mainGroup = useEditorGroupsStore.getState().groups.find((g) => g.id === 'main');
      expect(mainGroup?.tabIds.filter((id) => id === 'tab-1')).toHaveLength(1);
    });

    it('should remove tab from group', () => {
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-1');
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-2');
      useEditorGroupsStore.getState().removeTabFromGroup('main', 'tab-1');
      const mainGroup = useEditorGroupsStore.getState().groups.find((g) => g.id === 'main');
      expect(mainGroup?.tabIds).not.toContain('tab-1');
      expect(mainGroup?.activeTabId).toBe('tab-2');
    });

    it('should move tab to another group', () => {
      useEditorGroupsStore.getState().enableSplit();
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-1');
      useEditorGroupsStore.getState().moveTabToGroup('tab-1', 'split');
      const mainGroup = useEditorGroupsStore.getState().groups.find((g) => g.id === 'main');
      const splitGroup = useEditorGroupsStore.getState().groups.find((g) => g.id === 'split');
      expect(mainGroup?.tabIds).not.toContain('tab-1');
      expect(splitGroup?.tabIds).toContain('tab-1');
    });

    it('should set group active tab', () => {
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-1');
      useEditorGroupsStore.getState().addTabToGroup('main', 'tab-2');
      useEditorGroupsStore.getState().setGroupActiveTab('main', 'tab-1');
      const mainGroup = useEditorGroupsStore.getState().groups.find((g) => g.id === 'main');
      expect(mainGroup?.activeTabId).toBe('tab-1');
    });
  });

  describe('panel sizes', () => {
    it('should set panel sizes', () => {
      useEditorGroupsStore.getState().enableSplit();
      useEditorGroupsStore.getState().setPanelSizes([60, 40]);
      expect(useEditorGroupsStore.getState().panelSizes).toEqual([60, 40]);
    });
  });
});
