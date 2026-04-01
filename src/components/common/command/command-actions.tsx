'use client';

import { useTranslation } from 'react-i18next';
import {
  Moon,
  Sun,
  Languages,
  PanelTop,
  PanelLeft,
  PanelRight,
  PanelBottom,
  LayoutGrid,
  Maximize,
  Minimize2,
  NotebookPen,
  SlidersHorizontal,
  GitCompareArrows,
  Newspaper,
} from 'lucide-react';
import { useKeybindingsStore, formatKeyCombo } from '@/stores/keybindings-store';
import type { PanelZone } from '@/stores/panel-registry-store';
import type { ActivityBarPosition } from '@/stores';
import type { RecentModule } from '@/stores/workspace-store';
import { eventBus } from '@/lib/event-bus';
import { useWhatsNewStore } from '@/stores/whats-new-store';

import { CommandItem } from './command-item';
import { CommandGroup } from './command-item';
import { useCommandKeywords } from './use-command-keywords';

// ═══════════════════════════════════════════════════════════════════════════
// Actions de workspace UI (theme, langue, barres, panneaux, focus)
// ═══════════════════════════════════════════════════════════════════════════

export interface CommandActionsProps {
  theme: string;
  language: string;
  tabBarVisible: boolean;
  statusBarVisible: boolean;
  menuBarVisible: boolean;
  activityBarVisible: boolean;
  activityPanelOpen: boolean;
  activeActivityPanel: string | null;
  focusMode: boolean;
  handleToggleTheme: () => void;
  handleLanguageChange: (lang: string) => void;
  getLanguageLabel: (code: string) => string;
  toggleTabBar: () => void;
  toggleZone: (zone: PanelZone) => void;
  toggleActivityBar: () => void;
  setActivityBarPosition: (position: ActivityBarPosition) => void;
  toggleStatusBar: () => void;
  toggleMenuBar: () => void;
  toggleActivityPanel: (panelId: string) => void;
  toggleFocusMode: () => void;
  addRecent: (module: Omit<RecentModule, 'timestamp'>) => void;
  close: () => void;
}

export function CommandActions({
  theme,
  language,
  tabBarVisible,
  statusBarVisible,
  menuBarVisible,
  activityBarVisible,
  activityPanelOpen,
  activeActivityPanel,
  focusMode,
  handleToggleTheme,
  handleLanguageChange,
  getLanguageLabel,
  toggleTabBar,
  toggleZone,
  toggleActivityBar,
  setActivityBarPosition,
  toggleStatusBar,
  toggleMenuBar,
  toggleActivityPanel,
  toggleFocusMode,
  addRecent,
  close,
}: CommandActionsProps) {
  const { t } = useTranslation();
  const { getEffectiveCombo } = useKeybindingsStore();
  const {
    keywordTheme,
    keywordLanguage,
    keywordTabs,
    keywordSidebar,
    keywordActivityBar,
    keywordStatusBar,
    keywordMenuBar,
    keywordFiltersPanel,
    keywordNotesPanel,
    keywordFocus,
  } = useCommandKeywords();
  const openWhatsNew = useWhatsNewStore((s) => s.open);

  return (
    <CommandGroup heading={t('commandPalette.actions')}>
      <CommandItem
        icon={theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        onSelect={handleToggleTheme}
        keywords={keywordTheme}
      >
        {theme === 'light' ? t('settings.darkMode') : t('settings.lightMode')}
      </CommandItem>
      <CommandItem
        icon={<Languages className="h-4 w-4" />}
        onSelect={() => handleLanguageChange(language === 'fr' ? 'en' : 'fr')}
        keywords={keywordLanguage}
      >
        {t('settings.language')}: {getLanguageLabel(language === 'fr' ? 'en' : 'fr')}
      </CommandItem>
      <CommandItem
        icon={<PanelTop className="h-4 w-4" />}
        shortcut={formatKeyCombo(getEffectiveCombo('toggleTabBar'))}
        onSelect={() => { toggleTabBar(); addRecent({ path: '__action:tabbar', title: tabBarVisible ? 'Hide Tabs' : 'Show Tabs', icon: 'panel-top', type: 'action' }); close(); }}
        keywords={keywordTabs}
      >
        {tabBarVisible ? t('workspace.hideTabs') : t('workspace.showTabs')}
      </CommandItem>
      <CommandItem
        icon={<PanelLeft className="h-4 w-4" />}
        shortcut={formatKeyCombo(getEffectiveCombo('toggleSidebar'))}
        onSelect={() => { toggleZone('activity-panel'); addRecent({ path: '__action:sidebar', title: activityPanelOpen ? 'Collapse sidebar' : 'Expand sidebar', icon: 'panel-left', type: 'action' }); close(); }}
        keywords={keywordSidebar}
      >
        {activityPanelOpen ? t('workspace.collapse') : t('workspace.expand')}
      </CommandItem>
      <CommandItem
        icon={<LayoutGrid className="h-4 w-4" />}
        shortcut={formatKeyCombo(getEffectiveCombo('toggleActivityBar'))}
        onSelect={() => { toggleActivityBar(); addRecent({ path: '__action:activitybar', title: activityBarVisible ? 'Hide Activity Bar' : 'Show Activity Bar', icon: 'layout-grid', type: 'action' }); close(); }}
        keywords={keywordActivityBar}
      >
        {activityBarVisible ? t('activityBar.hide') : t('activityBar.show')}
      </CommandItem>
      <CommandItem
        icon={<PanelLeft className="h-4 w-4" />}
        onSelect={() => { setActivityBarPosition('left'); addRecent({ path: '__action:activitybar-left', title: 'Move Activity Bar to Left', icon: 'panel-left', type: 'action' }); close(); }}
        keywords={['activity', 'bar', 'move', 'left', 'position', 'gauche', 'déplacer']}
      >
        {t('activityBar.moveToLeft')}
      </CommandItem>
      <CommandItem
        icon={<PanelTop className="h-4 w-4" />}
        onSelect={() => { setActivityBarPosition('top'); addRecent({ path: '__action:activitybar-top', title: 'Move Activity Bar to Top', icon: 'panel-top', type: 'action' }); close(); }}
        keywords={['activity', 'bar', 'move', 'top', 'position', 'haut', 'déplacer']}
      >
        {t('activityBar.moveToTop')}
      </CommandItem>
      <CommandItem
        icon={<PanelRight className="h-4 w-4" />}
        onSelect={() => { setActivityBarPosition('right'); addRecent({ path: '__action:activitybar-right', title: 'Move Activity Bar to Right', icon: 'panel-right', type: 'action' }); close(); }}
        keywords={['activity', 'bar', 'move', 'right', 'position', 'droite', 'déplacer']}
      >
        {t('activityBar.moveToRight')}
      </CommandItem>
      <CommandItem
        icon={<PanelBottom className="h-4 w-4" />}
        onSelect={() => { setActivityBarPosition('bottom'); addRecent({ path: '__action:activitybar-bottom', title: 'Move Activity Bar to Bottom', icon: 'panel-bottom', type: 'action' }); close(); }}
        keywords={['activity', 'bar', 'move', 'bottom', 'position', 'bas', 'déplacer']}
      >
        {t('activityBar.moveToBottom')}
      </CommandItem>
      <CommandItem
        icon={<PanelBottom className="h-4 w-4" />}
        onSelect={() => { toggleStatusBar(); addRecent({ path: '__action:statusbar', title: statusBarVisible ? 'Hide Status Bar' : 'Show Status Bar', icon: 'panel-bottom', type: 'action' }); close(); }}
        keywords={keywordStatusBar}
      >
        {statusBarVisible ? t('statusBar.hide') : t('statusBar.show')}
      </CommandItem>
      <CommandItem
        icon={<PanelTop className="h-4 w-4" />}
        onSelect={() => { toggleMenuBar(); addRecent({ path: '__action:menubar', title: menuBarVisible ? 'Hide Menu Bar' : 'Show Menu Bar', icon: 'panel-top', type: 'action' }); close(); }}
        keywords={keywordMenuBar}
      >
        {menuBarVisible ? t('menuBar.hide') : t('menuBar.show')}
      </CommandItem>
      <CommandItem
        icon={<SlidersHorizontal className="h-4 w-4" />}
        onSelect={() => { toggleActivityPanel('tools'); addRecent({ path: '__action:filters-panel', title: activeActivityPanel === 'tools' ? 'Hide Tools' : 'Show Tools', icon: 'sliders-horizontal', type: 'action' }); close(); }}
        keywords={keywordFiltersPanel}
      >
        {activeActivityPanel === 'tools' ? t('commandPalette.hideFilters') : t('commandPalette.showFilters')}
      </CommandItem>
      <CommandItem
        icon={<NotebookPen className="h-4 w-4" />}
        onSelect={() => { toggleActivityPanel('notes'); addRecent({ path: '__action:notes-panel', title: activeActivityPanel === 'notes' ? 'Hide Notes' : 'Show Notes', icon: 'notebook-pen', type: 'action' }); close(); }}
        keywords={keywordNotesPanel}
      >
        {activeActivityPanel === 'notes' ? t('commandPalette.hideNotes') : t('commandPalette.showNotes')}
      </CommandItem>
      <CommandItem
        icon={focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        shortcut={formatKeyCombo(getEffectiveCombo('toggleFocusMode'))}
        onSelect={() => { toggleFocusMode(); addRecent({ path: '__action:focusmode', title: focusMode ? 'Exit Focus' : 'Focus Mode', icon: 'maximize', type: 'action' }); close(); }}
        keywords={keywordFocus}
      >
        {focusMode ? t('focusMode.exit') : t('focusMode.enter')}
      </CommandItem>
      <CommandItem
        icon={<GitCompareArrows className="h-4 w-4" />}
        onSelect={() => { eventBus.emit('platform:toggleSelection', undefined); close(); }}
        keywords={[t('commandPalette.keywords.select'), t('commandPalette.keywords.compare'), t('commandPalette.keywords.comparison'), t('commandPalette.keywords.toggle')]}
      >
        {t('commandPalette.toggleSelection')}
      </CommandItem>
      <CommandItem
        icon={<Newspaper className="h-4 w-4" />}
        onSelect={() => { openWhatsNew(); close(); }}
        keywords={['changelog', 'nouveautés', 'new', 'version', 'release']}
      >
        {t('whatsNew.viewAgain')}
      </CommandItem>
    </CommandGroup>
  );
}
