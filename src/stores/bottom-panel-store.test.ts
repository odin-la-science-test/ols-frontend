import { describe, it, expect, beforeEach } from 'vitest';
import { useBottomPanelStore } from './bottom-panel-store';

// Dummy component for dynamic tab tests
const DummyPanel = () => null;

describe('useBottomPanelStore', () => {
  beforeEach(() => {
    useBottomPanelStore.setState({
      visible: false,
      activeTab: 'activity',
      panelHeight: 200,
      activityLog: [],
      maxEntries: 200,
      dynamicTabs: [],
    });
  });

  describe('visibility', () => {
    it('should initialize with visible=false', () => {
      expect(useBottomPanelStore.getState().visible).toBe(false);
    });

    it('should set visible', () => {
      useBottomPanelStore.getState().setVisible(true);
      expect(useBottomPanelStore.getState().visible).toBe(true);
    });

    it('should toggle visible', () => {
      useBottomPanelStore.getState().toggleVisible();
      expect(useBottomPanelStore.getState().visible).toBe(true);
      useBottomPanelStore.getState().toggleVisible();
      expect(useBottomPanelStore.getState().visible).toBe(false);
    });
  });

  describe('activeTab', () => {
    it('should initialize with activity tab', () => {
      expect(useBottomPanelStore.getState().activeTab).toBe('activity');
    });

    it('should set active tab', () => {
      useBottomPanelStore.getState().setActiveTab('activity');
      expect(useBottomPanelStore.getState().activeTab).toBe('activity');
    });
  });

  describe('panelHeight', () => {
    it('should initialize with 200', () => {
      expect(useBottomPanelStore.getState().panelHeight).toBe(200);
    });

    it('should set panel height', () => {
      useBottomPanelStore.getState().setPanelHeight(350);
      expect(useBottomPanelStore.getState().panelHeight).toBe(350);
    });
  });

  describe('activity log', () => {
    it('should add log entry', () => {
      useBottomPanelStore.getState().addLogEntry({
        type: 'navigation',
        message: 'Navigated to Bacteriology',
      });
      const log = useBottomPanelStore.getState().activityLog;
      expect(log).toHaveLength(1);
      expect(log[0].type).toBe('navigation');
      expect(log[0].message).toBe('Navigated to Bacteriology');
      expect(log[0].id).toBeDefined();
      expect(log[0].timestamp).toBeDefined();
    });

    it('should prepend new entries', () => {
      useBottomPanelStore.getState().addLogEntry({ type: 'navigation', message: 'First' });
      useBottomPanelStore.getState().addLogEntry({ type: 'action', message: 'Second' });
      const log = useBottomPanelStore.getState().activityLog;
      expect(log).toHaveLength(2);
      expect(log[0].message).toBe('Second');
      expect(log[1].message).toBe('First');
    });

    it('should respect maxEntries', () => {
      useBottomPanelStore.setState({ maxEntries: 3 });
      for (let i = 0; i < 5; i++) {
        useBottomPanelStore.getState().addLogEntry({ type: 'system', message: `Entry ${i}` });
      }
      const log = useBottomPanelStore.getState().activityLog;
      expect(log).toHaveLength(3);
      expect(log[0].message).toBe('Entry 4');
    });

    it('should clear log', () => {
      useBottomPanelStore.getState().addLogEntry({ type: 'system', message: 'Test' });
      useBottomPanelStore.getState().clearLog();
      expect(useBottomPanelStore.getState().activityLog).toHaveLength(0);
    });
  });

  describe('dynamic tabs', () => {
    it('should register a dynamic tab', () => {
      useBottomPanelStore.getState().registerTab({
        id: 'test-tab',
        labelKey: 'test.label',
        icon: 'bug',
        moduleKey: 'test-module',
        component: DummyPanel,
      });
      const tabs = useBottomPanelStore.getState().dynamicTabs;
      expect(tabs).toHaveLength(1);
      expect(tabs[0].id).toBe('test-tab');
      expect(tabs[0].moduleKey).toBe('test-module');
    });

    it('should not register duplicate tabs', () => {
      const tab = {
        id: 'test-tab',
        labelKey: 'test.label',
        icon: 'bug',
        moduleKey: 'test-module',
        component: DummyPanel,
      };
      useBottomPanelStore.getState().registerTab(tab);
      useBottomPanelStore.getState().registerTab(tab);
      expect(useBottomPanelStore.getState().dynamicTabs).toHaveLength(1);
    });

    it('should sort tabs by priority', () => {
      useBottomPanelStore.getState().registerTab({
        id: 'tab-b', labelKey: 'b', icon: 'b', moduleKey: 'm', component: DummyPanel, priority: 10,
      });
      useBottomPanelStore.getState().registerTab({
        id: 'tab-a', labelKey: 'a', icon: 'a', moduleKey: 'm', component: DummyPanel, priority: 1,
      });
      const tabs = useBottomPanelStore.getState().dynamicTabs;
      expect(tabs[0].id).toBe('tab-a');
      expect(tabs[1].id).toBe('tab-b');
    });

    it('should unregister a tab by id', () => {
      useBottomPanelStore.getState().registerTab({
        id: 'test-tab', labelKey: 'test', icon: 'x', moduleKey: 'm', component: DummyPanel,
      });
      useBottomPanelStore.getState().unregisterTab('test-tab');
      expect(useBottomPanelStore.getState().dynamicTabs).toHaveLength(0);
    });

    it('should fall back to activity tab when active dynamic tab is removed', () => {
      useBottomPanelStore.getState().registerTab({
        id: 'test-tab', labelKey: 'test', icon: 'x', moduleKey: 'm', component: DummyPanel,
      });
      useBottomPanelStore.getState().setActiveTab('test-tab');
      expect(useBottomPanelStore.getState().activeTab).toBe('test-tab');

      useBottomPanelStore.getState().unregisterTab('test-tab');
      expect(useBottomPanelStore.getState().activeTab).toBe('activity');
    });

    it('should unregister all tabs for a module', () => {
      useBottomPanelStore.getState().registerTab({
        id: 'tab-1', labelKey: 't1', icon: 'x', moduleKey: 'bacteriology', component: DummyPanel,
      });
      useBottomPanelStore.getState().registerTab({
        id: 'tab-2', labelKey: 't2', icon: 'x', moduleKey: 'bacteriology', component: DummyPanel,
      });
      useBottomPanelStore.getState().registerTab({
        id: 'tab-3', labelKey: 't3', icon: 'x', moduleKey: 'mycology', component: DummyPanel,
      });
      expect(useBottomPanelStore.getState().dynamicTabs).toHaveLength(3);

      useBottomPanelStore.getState().unregisterModule('bacteriology');
      const tabs = useBottomPanelStore.getState().dynamicTabs;
      expect(tabs).toHaveLength(1);
      expect(tabs[0].moduleKey).toBe('mycology');
    });

    it('should fall back to activity when active tab belongs to unregistered module', () => {
      useBottomPanelStore.getState().registerTab({
        id: 'bact-tab', labelKey: 'test', icon: 'x', moduleKey: 'bacteriology', component: DummyPanel,
      });
      useBottomPanelStore.getState().setActiveTab('bact-tab');
      useBottomPanelStore.getState().unregisterModule('bacteriology');
      expect(useBottomPanelStore.getState().activeTab).toBe('activity');
    });
  });
});
