'use client';

import { useTranslation } from 'react-i18next';
import {
  Pin,
  Clock,
  Home,
  BookOpen,
  FlaskConical,
  User,
  Settings,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import type { RecentModule } from '@/stores/workspace-store';
import type { PanelZone } from '@/stores/panel-registry-store';

import { CommandItem } from './command-item';
import { CommandGroup } from './command-item';
import { useCommandKeywords } from './use-command-keywords';

// ═══════════════════════════════════════════════════════════════════════════
// Sections de navigation : Pinned, Recent, Recent Actions, Navigation, Modules
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleInfo {
  moduleKey: string;
  title: string;
  icon: string;
  description: string;
  routePath: string;
}

interface PinnedInfo {
  path: string;
  module?: ModuleInfo;
  recent?: RecentModule;
}

export interface CommandNavigationProps {
  showNavigation: boolean;
  pinnedWithInfo: PinnedInfo[];
  recentModules: RecentModule[];
  modules: ModuleInfo[];
  pinnedModules: string[];
  language: string;
  handleNavigate: (path: string, recentInfo?: { title: string; icon: string }) => void;
  handleToggleTheme: () => void;
  handleLanguageChange: (lang: string) => void;
  toggleTabBar: () => void;
  toggleZone: (zone: PanelZone) => void;
  toggleActivityBar: () => void;
  toggleActivityPanel: (panelId: string) => void;
  toggleFocusMode: () => void;
  close: () => void;
}

export function CommandNavigation({
  showNavigation,
  pinnedWithInfo,
  recentModules,
  modules,
  pinnedModules,
  language,
  handleNavigate,
  handleToggleTheme,
  handleLanguageChange,
  toggleTabBar,
  toggleZone,
  toggleActivityBar,
  toggleActivityPanel,
  toggleFocusMode,
  close,
}: CommandNavigationProps) {
  const { t } = useTranslation();
  const { keywordHome, keywordAtlas, keywordLab, keywordProfile, keywordSettings } = useCommandKeywords();

  return (
    <>
      {/* Pinned Modules */}
      {showNavigation && pinnedWithInfo.length > 0 && (
        <CommandGroup heading={t('commandPalette.pinned')}>
          {pinnedWithInfo.map(({ path, module, recent }) => (
            <CommandItem
              key={path}
              icon={<Pin className="h-4 w-4" />}
              onSelect={() => handleNavigate(path)}
              keywords={[
                module?.title || recent?.title || '',
                t('commandPalette.keywords.pinned'),
              ]}
            >
              <span className="flex items-center gap-2">
                {module?.icon && <DynamicIcon name={module.icon} className="h-4 w-4" />}
                {module?.title || recent?.title || path}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {/* Recent (navigation + actions) */}
      {showNavigation && recentModules.filter(r => r.type !== 'action').length > 0 && (
        <CommandGroup heading={t('commandPalette.recent')}>
          {recentModules.filter(r => r.type !== 'action').slice(0, 5).map((recent) => (
            <CommandItem
              key={recent.path}
              icon={<Clock className="h-4 w-4" />}
              onSelect={() => handleNavigate(recent.path)}
              keywords={[recent.title, t('commandPalette.keywords.recent')]}
            >
              <span className="flex items-center gap-2">
                <DynamicIcon name={recent.icon} className="h-4 w-4" />
                {recent.title}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {/* Recent actions — visible in mixed AND command mode */}
      {recentModules.filter(r => r.type === 'action').length > 0 && (
        <CommandGroup heading={t('commandPalette.recentActions')}>
          {recentModules.filter(r => r.type === 'action').slice(0, 5).map((recent) => (
            <CommandItem
              key={recent.path}
              icon={<Clock className="h-4 w-4" />}
              onSelect={() => {
                if (recent.path === '__action:theme') { handleToggleTheme(); return; }
                if (recent.path === '__action:language') { handleLanguageChange(language === 'fr' ? 'en' : 'fr'); return; }
                if (recent.path === '__action:tabbar') { toggleTabBar(); close(); return; }
                if (recent.path === '__action:sidebar') { toggleZone('activity-panel'); close(); return; }
                if (recent.path === '__action:activitybar') { toggleActivityBar(); close(); return; }
                if (recent.path === '__action:filters-panel') { toggleActivityPanel('tools'); close(); return; }
                if (recent.path === '__action:notes-panel') { toggleActivityPanel('notes'); close(); return; }
                if (recent.path === '__action:focusmode') { toggleFocusMode(); close(); return; }
                close();
              }}
              keywords={[recent.title, t('commandPalette.keywords.recent')]}
            >
              <span className="flex items-center gap-2">
                <DynamicIcon name={recent.icon} className="h-4 w-4" />
                {recent.title}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {/* Navigation */}
      {showNavigation && (
      <CommandGroup heading={t('commandPalette.navigation')}>
        <CommandItem
          icon={<Home className="h-4 w-4" />}
          onSelect={() => handleNavigate('/')}
          keywords={keywordHome}
        >
          {t('common.home')}
        </CommandItem>
        <CommandItem
          icon={<BookOpen className="h-4 w-4" />}
          onSelect={() => handleNavigate('/atlas')}
          keywords={keywordAtlas}
        >
          {t('atlas.title')}
        </CommandItem>
        <CommandItem
          icon={<FlaskConical className="h-4 w-4" />}
          onSelect={() => handleNavigate('/lab')}
          keywords={keywordLab}
        >
          {t('home.huginLab')}
        </CommandItem>
        <CommandItem
          icon={<User className="h-4 w-4" />}
          onSelect={() => handleNavigate('/profile', { title: t('profile.title'), icon: 'user' })}
          keywords={keywordProfile}
        >
          {t('profile.title')}
        </CommandItem>
        <CommandItem
          icon={<Settings className="h-4 w-4" />}
          onSelect={() => handleNavigate('/settings', { title: t('settingsPage.title'), icon: 'settings' })}
          keywords={keywordSettings}
        >
          {t('settingsPage.title')}
        </CommandItem>
      </CommandGroup>
      )}

      {/* All Modules (excluding pinned & recent to avoid duplicates) */}
      {showNavigation && modules.length > 0 && (() => {
        const pinnedPaths = new Set(pinnedModules);
        const recentPaths = new Set(recentModules.slice(0, 5).map((r) => r.path));
        const filtered = modules.filter((module) => {
          const path = module.routePath.startsWith('/') ? module.routePath : `/${module.routePath}`;
          return !pinnedPaths.has(path) && !recentPaths.has(path);
        });
        return filtered.length > 0 ? (
          <CommandGroup heading={t('commandPalette.modules')}>
            {filtered.map((module) => (
              <CommandItem
                key={module.moduleKey}
                icon={<DynamicIcon name={module.icon} className="h-4 w-4" />}
                onSelect={() => handleNavigate(module.routePath.startsWith('/') ? module.routePath : `/${module.routePath}`)}
                keywords={[module.title, module.moduleKey, module.description || '']}
              >
                {module.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null;
      })()}
    </>
  );
}
