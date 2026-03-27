'use client';

import { useTranslation } from 'react-i18next';
import {
  PanelTop,
  PanelLeft,
  PanelRight,
  PanelBottom,
  LayoutGrid,
  Maximize,
  Navigation as NavigationIcon,
  Check,
  Columns2,
  Rows2,
  Activity,
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores';
import { useActivityBarStore } from '@/stores';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useKeybindingsStore, formatKeyCombo } from '@/stores/keybindings-store';
import { MenuItem, MenuSeparator, MenuSubMenu } from './menu-primitives';
import { SidebarZoneSubMenu } from './view-sidebar-submenus';
import type { OnCloseProps } from './types';

export function ViewMenuContent({ onClose }: OnCloseProps) {
  const { t } = useTranslation();
  const {
    tabBarVisible, toggleTabBar,
    showBreadcrumbs, toggleBreadcrumbs,
    statusBarVisible, toggleStatusBar,
    menuBarVisible, toggleMenuBar,
    focusMode, toggleFocusMode,
  } = useWorkspaceStore();
  const { activityBarVisible, toggleActivityBar, position: activityBarPosition, setPosition: setActivityBarPosition } = useActivityBarStore();
  const { getEffectiveCombo } = useKeybindingsStore();
  const { visible: bottomPanelVisible, toggleVisible: toggleBottomPanel, alignment: panelAlignment, setAlignment: setPanelAlignment } = useBottomPanelStore();
  const { primaryMode, secondaryMode, activityMode, setActivityMode, setPrimaryMode, setSecondaryMode, primarySide, secondarySide, setPrimarySide, setSecondarySide } = useSidebarModeStore();
  const { splitActive, toggleSplit } = useEditorGroupsStore();
  const toggleViewMode = usePanelRegistryStore((s) => s.toggleViewMode);
  const toggleZone = usePanelRegistryStore((s) => s.toggleZone);
  const activityPanelZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], isOpen: false, viewMode: 'tabs' as const });
  const primaryZone = usePanelRegistryStore((s) => s.zones.primary ?? { stack: [], isOpen: false, viewMode: 'tabs' as const });
  const secondaryZone = usePanelRegistryStore((s) => s.zones.secondary ?? { stack: [], isOpen: false, viewMode: 'tabs' as const });
  const activityPanelViewMode = activityPanelZone.viewMode;
  const primaryViewMode = primaryZone.viewMode;
  const secondaryViewMode = secondaryZone.viewMode;

  const viewItems = [
    {
      icon: PanelLeft,
      label: t('menuBar.explorerPanel'),
      checked: activityPanelZone.isOpen && activityPanelZone.stack.length > 0,
      onToggle: () => toggleZone('activity-panel'),
      shortcut: formatKeyCombo(getEffectiveCombo('toggleSidebar')),
    },
    {
      icon: PanelLeft,
      label: t('menuBar.primarySidebar'),
      checked: primaryZone.isOpen && primaryZone.stack.length > 0,
      onToggle: () => toggleZone('primary'),
    },
    {
      icon: PanelRight,
      label: t('menuBar.secondarySidebar'),
      checked: secondaryZone.isOpen && secondaryZone.stack.length > 0,
      onToggle: () => toggleZone('secondary'),
    },
    {
      icon: PanelTop,
      label: t('menuBar.tabBar'),
      checked: tabBarVisible,
      onToggle: toggleTabBar,
      shortcut: formatKeyCombo(getEffectiveCombo('toggleTabBar')),
    },
    {
      icon: LayoutGrid,
      label: t('menuBar.activityBar'),
      checked: activityBarVisible,
      onToggle: toggleActivityBar,
      shortcut: formatKeyCombo(getEffectiveCombo('toggleActivityBar')),
    },
    {
      icon: NavigationIcon,
      label: t('menuBar.breadcrumbs'),
      checked: showBreadcrumbs,
      onToggle: toggleBreadcrumbs,
    },
    {
      icon: PanelBottom,
      label: t('menuBar.statusBar'),
      checked: statusBarVisible,
      onToggle: toggleStatusBar,
    },
    {
      icon: PanelTop,
      label: t('menuBar.menuBar'),
      checked: menuBarVisible,
      onToggle: () => { toggleMenuBar(); onClose(); },
    },
    {
      icon: Activity,
      label: t('bottomPanel.title', 'Panel'),
      checked: bottomPanelVisible,
      onToggle: toggleBottomPanel,
      shortcut: formatKeyCombo(getEffectiveCombo('toggleBottomPanel')),
    },
  ];

  const { splitDirection, setSplitDirection } = useEditorGroupsStore();

  const handleSplitSelect = (direction: 'horizontal' | 'vertical') => {
    if (!splitActive) {
      // Activate split in the chosen direction
      useEditorGroupsStore.getState().enableSplit(direction);
    } else if (splitDirection === direction) {
      // Already in this direction — toggle off
      toggleSplit();
    } else {
      // Switch direction
      setSplitDirection(direction);
    }
    onClose();
  };

  return (
    <>
      {/* ── Visibility toggles (flat) ── */}
      {viewItems.map((item) => {
        const Icon = item.icon;
        return (
          <MenuItem
            key={item.label}
            onClick={item.onToggle}
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.checked && <Check className="h-3 w-3 text-primary shrink-0" />}
            {item.shortcut && (
              <span className="text-[10px] text-muted-foreground/50 ml-2 shrink-0">{item.shortcut}</span>
            )}
          </MenuItem>
        );
      })}

      <MenuSeparator />

      {/* ── Activity Bar Position (sub-menu) ── */}
      <MenuSubMenu
        icon={<LayoutGrid className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('activityBar.position')}
      >
        {([
          { value: 'left' as const, icon: PanelLeft, label: t('activityBar.positionLeft') },
          { value: 'top' as const, icon: PanelTop, label: t('activityBar.positionTop') },
          { value: 'right' as const, icon: PanelRight, label: t('activityBar.positionRight') },
          { value: 'bottom' as const, icon: PanelBottom, label: t('activityBar.positionBottom') },
        ]).map((opt) => {
          const Icon = opt.icon;
          return (
            <MenuItem
              key={opt.value}
              onClick={() => { setActivityBarPosition(opt.value); onClose(); }}
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1">{opt.label}</span>
              {activityBarPosition === opt.value && <Check className="h-3 w-3 text-primary shrink-0" />}
            </MenuItem>
          );
        })}
      </MenuSubMenu>

      {/* ── Panel Alignment (sub-menu) ── */}
      <MenuSubMenu
        icon={<Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('bottomPanel.alignment')}
      >
        {([
          { value: 'center' as const, icon: PanelBottom, label: t('bottomPanel.alignCenter') },
          { value: 'left' as const, icon: PanelLeft, label: t('bottomPanel.alignLeft') },
          { value: 'right' as const, icon: PanelRight, label: t('bottomPanel.alignRight') },
          { value: 'justify' as const, icon: PanelBottom, label: t('bottomPanel.alignJustify') },
        ]).map((opt) => {
          const Icon = opt.icon;
          return (
            <MenuItem
              key={opt.value}
              onClick={() => { setPanelAlignment(opt.value); onClose(); }}
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1">{opt.label}</span>
              {panelAlignment === opt.value && <Check className="h-3 w-3 text-primary shrink-0" />}
            </MenuItem>
          );
        })}
      </MenuSubMenu>

      <MenuSeparator />

      {/* ── Panneaux : mode + vue par zone ── */}
      {/* ── Activity Bar ── */}
      <SidebarZoneSubMenu
        icon={<PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('menuBar.explorerPanel')}
        currentMode={activityMode}
        onSetMode={setActivityMode}
        currentViewMode={activityPanelViewMode}
        onToggleViewMode={() => toggleViewMode('activity-panel')}
        onClose={onClose}
      />

      {/* ── Primary Sidebar ── */}
      <SidebarZoneSubMenu
        icon={<PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('settingsPage.primarySidebarMode')}
        currentMode={primaryMode}
        onSetMode={setPrimaryMode}
        currentViewMode={primaryViewMode}
        onToggleViewMode={() => toggleViewMode('primary')}
        onClose={onClose}
        sideConfig={{ currentSide: primarySide, onSetSide: setPrimarySide }}
      />

      {/* ── Secondary Sidebar ── */}
      <SidebarZoneSubMenu
        icon={<PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('settingsPage.secondarySidebarMode')}
        currentMode={secondaryMode}
        onSetMode={setSecondaryMode}
        currentViewMode={secondaryViewMode}
        onToggleViewMode={() => toggleViewMode('secondary')}
        onClose={onClose}
        sideConfig={{ currentSide: secondarySide, onSetSide: setSecondarySide }}
      />

      <MenuSeparator />

      {/* ── Split — two mutually exclusive options ── */}
      <MenuItem onClick={() => handleSplitSelect('horizontal')}>
        <Columns2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1">{t('editorGroups.splitHorizontal', 'Diviser à droite')}</span>
        {splitActive && splitDirection === 'horizontal' && <Check className="h-3 w-3 text-primary shrink-0" />}
        <span className="text-[10px] text-muted-foreground/50 ml-2 shrink-0">
          {formatKeyCombo(getEffectiveCombo('toggleSplit'))}
        </span>
      </MenuItem>
      <MenuItem onClick={() => handleSplitSelect('vertical')}>
        <Rows2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1">{t('editorGroups.splitVertical', 'Diviser en bas')}</span>
        {splitActive && splitDirection === 'vertical' && <Check className="h-3 w-3 text-primary shrink-0" />}
      </MenuItem>

      <MenuSeparator />

      {/* Focus Mode */}
      <MenuItem onClick={() => { toggleFocusMode(); onClose(); }}>
        <Maximize className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1">{t('menuBar.focusMode')}</span>
        {focusMode && <Check className="h-3 w-3 text-primary shrink-0" />}
        <span className="text-[10px] text-muted-foreground/50 ml-2 shrink-0">
          {formatKeyCombo(getEffectiveCombo('toggleFocusMode'))}
        </span>
      </MenuItem>

    </>
  );
}
