'use client';

import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  Layout,
  LayoutDashboard,
  UserCircle,
  Columns2,
  Activity,
  Layers,
} from 'lucide-react';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useWorkspaceStore } from '@/stores';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import type { WorkspaceProfile } from '@/stores/profiles-store';
import type { RecentModule } from '@/stores/workspace-store';

import { CommandItem } from './command-item';
import { CommandGroup } from './command-item';
import { useCommandKeywords } from './use-command-keywords';

// ═══════════════════════════════════════════════════════════════════════════
// Actions layout (panel, sidebar modes, split editor) + Profiles
// ═══════════════════════════════════════════════════════════════════════════

export interface CommandLayoutActionsProps {
  profiles: WorkspaceProfile[];
  activeProfileId: string | null;
  handleNavigate: (path: string, recentInfo?: { title: string; icon: string }) => void;
  handleSwitchProfile: (profileId: string) => void;
  addRecent: (module: Omit<RecentModule, 'timestamp'>) => void;
  close: () => void;
}

export function CommandLayoutActions({
  profiles,
  activeProfileId,
  handleNavigate,
  handleSwitchProfile,
  addRecent,
  close,
}: CommandLayoutActionsProps) {
  const { t } = useTranslation();
  const { keywordKeybindings } = useCommandKeywords();
  const isIde = useWorkspaceStore.getState().layoutMode === 'ide';

  return (
    <>
      <CommandGroup heading={t('commandPalette.actions')}>
        {/* IDE-only layout actions (bottom panel, sidebar modes, split editor) */}
        {isIde && (
          <>
            <CommandItem
              icon={<Activity className="h-4 w-4" />}
              onSelect={() => {
                useBottomPanelStore.getState().toggleVisible();
                const nowVisible = useBottomPanelStore.getState().visible;
                addRecent({ path: '__action:bottompanel', title: nowVisible ? 'Show Panel' : 'Hide Panel', icon: 'activity', type: 'action' });
                close();
              }}
              keywords={['panel', 'bottom', 'activity', 'log', 'output', 'terminal', 'panneau', 'activité']}
            >
              {useBottomPanelStore.getState().visible ? t('bottomPanel.hide') : t('bottomPanel.show')}
            </CommandItem>
            <CommandItem
              icon={<Activity className="h-4 w-4" />}
              onSelect={() => {
                useBottomPanelStore.getState().setAlignment('center');
                addRecent({ path: '__action:panelalign-center', title: 'Panel: Center', icon: 'activity', type: 'action' });
                close();
              }}
              keywords={['panel', 'alignment', 'center', 'centre', 'alignement', 'panneau']}
            >
              {t('bottomPanel.alignment')}: {t('bottomPanel.alignCenter')}
            </CommandItem>
            <CommandItem
              icon={<Activity className="h-4 w-4" />}
              onSelect={() => {
                useBottomPanelStore.getState().setAlignment('left');
                addRecent({ path: '__action:panelalign-left', title: 'Panel: Left', icon: 'activity', type: 'action' });
                close();
              }}
              keywords={['panel', 'alignment', 'left', 'gauche', 'alignement', 'panneau']}
            >
              {t('bottomPanel.alignment')}: {t('bottomPanel.alignLeft')}
            </CommandItem>
            <CommandItem
              icon={<Activity className="h-4 w-4" />}
              onSelect={() => {
                useBottomPanelStore.getState().setAlignment('right');
                addRecent({ path: '__action:panelalign-right', title: 'Panel: Right', icon: 'activity', type: 'action' });
                close();
              }}
              keywords={['panel', 'alignment', 'right', 'droite', 'alignement', 'panneau']}
            >
              {t('bottomPanel.alignment')}: {t('bottomPanel.alignRight')}
            </CommandItem>
            <CommandItem
              icon={<Activity className="h-4 w-4" />}
              onSelect={() => {
                useBottomPanelStore.getState().setAlignment('justify');
                addRecent({ path: '__action:panelalign-justify', title: 'Panel: Justify', icon: 'activity', type: 'action' });
                close();
              }}
              keywords={['panel', 'alignment', 'justify', 'justifier', 'alignement', 'panneau', 'both', 'sidebar']}
            >
              {t('bottomPanel.alignment')}: {t('bottomPanel.alignJustify')}
            </CommandItem>
            <CommandItem
              icon={<Layers className="h-4 w-4" />}
              onSelect={() => {
                useSidebarModeStore.getState().togglePrimaryMode();
                const mode = useSidebarModeStore.getState().primaryMode;
                addRecent({ path: '__action:sidebar-mode-primary', title: `Primary Sidebar: ${mode}`, icon: 'layers', type: 'action' });
                close();
              }}
              keywords={['sidebar', 'primary', 'mode', 'dock', 'overlay', 'float', 'barre', 'latérale', 'superposer', 'ancrer', 'principale']}
            >
              {t('settingsPage.primarySidebarMode')}: {useSidebarModeStore.getState().primaryMode === 'dock' ? t('settingsPage.sidebarModeDock') : t('settingsPage.sidebarModeOverlay')}
            </CommandItem>
            <CommandItem
              icon={<Layers className="h-4 w-4" />}
              onSelect={() => {
                useSidebarModeStore.getState().toggleSecondaryMode();
                const mode = useSidebarModeStore.getState().secondaryMode;
                addRecent({ path: '__action:sidebar-mode-secondary', title: `Secondary Sidebar: ${mode}`, icon: 'layers', type: 'action' });
                close();
              }}
              keywords={['sidebar', 'secondary', 'mode', 'dock', 'overlay', 'float', 'barre', 'latérale', 'superposer', 'ancrer', 'secondaire', 'detail', 'détail']}
            >
              {t('settingsPage.secondarySidebarMode')}: {useSidebarModeStore.getState().secondaryMode === 'dock' ? t('settingsPage.sidebarModeDock') : t('settingsPage.sidebarModeOverlay')}
            </CommandItem>
            <CommandItem
              icon={<Columns2 className="h-4 w-4" />}
              onSelect={() => {
                useEditorGroupsStore.getState().toggleSplit();
                const nowSplit = useEditorGroupsStore.getState().splitActive;
                addRecent({ path: '__action:split', title: nowSplit ? 'Split Editor' : 'Close Split', icon: 'columns-2', type: 'action' });
                close();
              }}
              keywords={['split', 'diviser', 'editor', 'group', 'side by side', 'côte à côte', 'multi']}
            >
              {useEditorGroupsStore.getState().splitActive ? t('editorGroups.closeSplit') : t('editorGroups.splitHorizontal')}
            </CommandItem>
          </>
        )}

        {/* Universal actions (available in both modes) */}
        <CommandItem
          icon={<Layout className="h-4 w-4" />}
          onSelect={() => {
            const current = useWorkspaceStore.getState().layoutMode;
            const next = current === 'classic' ? 'ide' : 'classic';
            useWorkspaceStore.getState().setLayoutMode(next);
            addRecent({ path: '__action:layout-mode', title: `Layout: ${next}`, icon: 'layout', type: 'action' });
            close();
          }}
          keywords={['layout', 'classic', 'classique', 'ide', 'simple', 'mode', 'navigation', 'sidebar', t('commandPalette.keywords.layoutClassic'), t('commandPalette.keywords.ide')]}
        >
          {useWorkspaceStore.getState().layoutMode === 'classic' ? t('commandPalette.switchToIde') : t('commandPalette.switchToClassic')}
        </CommandItem>
        <CommandItem
          icon={<Keyboard className="h-4 w-4" />}
          onSelect={() => handleNavigate('/settings', { title: t('settingsPage.keybindings'), icon: 'keyboard' })}
          keywords={keywordKeybindings}
        >
          {t('settingsPage.keybindings')}
        </CommandItem>
        <CommandItem
          icon={<LayoutDashboard className="h-4 w-4" />}
          onSelect={() => handleNavigate('/', { title: t('common.home'), icon: 'layout-dashboard' })}
          keywords={['dashboard', 'customize', 'widget', 'tableau de bord', 'personnaliser', 'accueil']}
        >
          {t('common.home')}
        </CommandItem>
      </CommandGroup>

      {/* Profiles — only in command mode with > prefix or mixed */}
      {profiles.length > 1 && (
        <CommandGroup heading={t('profiles.switchProfile')}>
          {profiles.map((profile) => {
            const displayName = profile.isDefault ? t(profile.name) : profile.name;
            const isActive = activeProfileId === profile.id;
            return (
              <CommandItem
                key={profile.id}
                icon={<UserCircle className="h-4 w-4" />}
                onSelect={() => handleSwitchProfile(profile.id)}
                keywords={['profile', 'profil', 'switch', 'changer', displayName]}
              >
                <span className="flex items-center gap-2">
                  <DynamicIcon name={profile.icon} className="h-4 w-4" />
                  {displayName}
                  {isActive && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({t('profiles.active')})
                    </span>
                  )}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
    </>
  );
}
