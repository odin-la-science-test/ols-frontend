'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore, useThemeStore, useTabsStore, useAuthStore } from '@/stores';
import { getAccentForPath, MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { registry } from '@/lib/module-registry';
import { BarContextMenu, useBarContextMenuState, MenuItem as BarMenuItem } from '@/components/common/bar-context-menu';
import { HomeButton } from './home-button';
import { MenuTrigger } from './menu-trigger';
import { MenuDropdown } from './menu-dropdown';
import { PlatformMenuContent } from './platform-menu-content';
import { ModuleMenuContent } from './module-menu-content';
import { ViewMenuContent } from './view-menu-content';
import { HelpMenuContent } from './help-menu-content';
import type { MenuId } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// MENU BAR - Top-level navigation bar à la VS Code
//
// Horizontal bar above everything:
//   Munin Atlas ▾  │  Hugin Lab ▾  │  View ▾  │  Help ▾
//
// Desktop only. Hidden in focus mode and minimal shell pages.
// Each menu opens a dropdown panel on click.
// ═══════════════════════════════════════════════════════════════════════════

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const toolbar = useModuleToolbarStore((s) => s.registration);
  const hasModuleMenuActions = useModuleToolbarStore((s) => {
    const reg = s.registration;
    if (!reg) return false;
    return reg.actions.some((a) => a.placement === 'menu' || a.placement === 'both');
  });
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const density = useThemeStore((s) => s.density);
  const isCompact = density === 'compact';
  const { t } = useTranslation();
  const location = useLocation();
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();

  // ─── Resolve module label from toolbar or route ───
  const splitActive = useEditorGroupsStore((s) => s.splitActive);
  const splitGroup = useEditorGroupsStore((s) => s.groups.find(g => g.id === 'split'));
  const allTabs = useTabsStore((s) => s.tabs);

  const resolveModuleLabel = useCallback((pathname: string | null): string | null => {
    if (!pathname) return null;
    const moduleDef = registry.getByRoute(pathname);
    return moduleDef ? t(moduleDef.translationKey) : null;
  }, [t]);

  // Main module label from current route
  const mainModuleLabel = useMemo(
    () => resolveModuleLabel(location.pathname) || (toolbar ? t(registry.getById(toolbar.moduleKey)?.translationKey ?? '') : null),
    [location.pathname, resolveModuleLabel, toolbar, t],
  );

  // Split module: resolve from split group's active tab
  const splitTabPath = useMemo(() => {
    if (!splitActive || !splitGroup?.activeTabId) return null;
    const tab = allTabs.find(tt => tt.id === splitGroup.activeTabId);
    return tab?.path ?? null;
  }, [splitActive, splitGroup?.activeTabId, allTabs]);

  const splitModuleLabel = useMemo(
    () => splitTabPath ? resolveModuleLabel(splitTabPath) : null,
    [splitTabPath, resolveModuleLabel],
  );

  // Accent colors per module
  const mainAccentColor = useMemo(() => getAccentForPath(location.pathname), [location.pathname]);
  const splitAccentColor = useMemo(
    () => splitTabPath ? getAccentForPath(splitTabPath) : mainAccentColor,
    [splitTabPath, mainAccentColor],
  );

  // Show two separate module triggers in split mode?
  const showSplitModuleTrigger = splitActive && splitModuleLabel && splitModuleLabel !== mainModuleLabel;

  // Show module menu if current module has admin view toggle
  const hasAdminViewToggle = isAdmin && !!registry.getByRoute(location.pathname)?.adminView;

  // Close on click outside (bar + portalled dropdown)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if clicking inside the menu bar itself
      if (barRef.current?.contains(target)) return;
      // Don't close if clicking inside a portalled dropdown
      const dropdown = document.querySelector('[data-menu-dropdown]');
      if (dropdown?.contains(target)) return;
      setOpenMenu(null);
    };
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    if (openMenu) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [openMenu]);

  const handleToggle = (id: MenuId) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  // When a menu is open, hovering another trigger switches to it
  const handleHover = (id: MenuId) => {
    if (openMenu && openMenu !== id) setOpenMenu(id);
  };

  return (
    <div
      ref={barRef}
      className={cn(
        'hidden lg:flex items-center w-full',
        'bg-card/80 backdrop-blur-sm border-b border-border/30',
        'select-none shrink-0 z-40',
        isCompact ? 'h-7 px-2 gap-0' : 'h-8 px-2 gap-0'
      )}
      onContextMenu={handleContextMenu}
    >
      {/* Home button */}
      <HomeButton isCompact={isCompact} onClose={() => setOpenMenu(null)} />

      <div className="w-px h-3.5 bg-border/30 mx-1" />

      {/* Platform menus */}
      <MenuTrigger
        id="atlas"
        icon={<BookOpen className={isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
        accentColor={MUNIN_PRIMARY}
        isOpen={openMenu === 'atlas'}
        isCompact={isCompact}
        onToggle={handleToggle}
        onHover={handleHover}
      />
      <MenuTrigger
        id="lab"
        icon={<FlaskConical className={isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
        accentColor={HUGIN_PRIMARY}
        isOpen={openMenu === 'lab'}
        isCompact={isCompact}
        onToggle={handleToggle}
        onHover={handleHover}
      />

      {/* Module menu(s) — shown if module has actions OR admin view toggle */}
      {(hasModuleMenuActions || hasAdminViewToggle) && (
        <>
          <div className="w-px h-3.5 bg-border/30 mx-1" />
          <MenuTrigger
            id="module"
            label={mainModuleLabel ?? undefined}
            accentColor={mainAccentColor}
            isOpen={openMenu === 'module'}
            isCompact={isCompact}
            onToggle={handleToggle}
            onHover={handleHover}
          />
          {showSplitModuleTrigger && (
            <MenuTrigger
              id="module-split"
              label={splitModuleLabel ?? undefined}
              accentColor={splitAccentColor}
              isOpen={openMenu === 'module-split'}
              isCompact={isCompact}
              onToggle={handleToggle}
              onHover={handleHover}
            />
          )}
        </>
      )}

      <div className="w-px h-3.5 bg-border/30 mx-1" />

      {/* Utility menus */}
      <MenuTrigger
        id="view"
        isOpen={openMenu === 'view'}
        isCompact={isCompact}
        onToggle={handleToggle}
        onHover={handleHover}
      />
      <MenuTrigger
        id="help"
        isOpen={openMenu === 'help'}
        isCompact={isCompact}
        onToggle={handleToggle}
        onHover={handleHover}
      />

      {/* Dropdown panels */}
      <AnimatePresence>
        {openMenu === 'atlas' && (
          <MenuDropdown anchorId="atlas">
            <PlatformMenuContent
              type="MUNIN_ATLAS"
              accentColor={MUNIN_PRIMARY}
              onClose={() => setOpenMenu(null)}
            />
          </MenuDropdown>
        )}
        {openMenu === 'lab' && (
          <MenuDropdown anchorId="lab">
            <PlatformMenuContent
              type="HUGIN_LAB"
              accentColor={HUGIN_PRIMARY}
              onClose={() => setOpenMenu(null)}
            />
          </MenuDropdown>
        )}
        {openMenu === 'module' && (toolbar || hasAdminViewToggle) && (
          <MenuDropdown anchorId="module">
            <ModuleMenuContent onClose={() => setOpenMenu(null)} />
          </MenuDropdown>
        )}
        {openMenu === 'module-split' && toolbar && (
          <MenuDropdown anchorId="module-split">
            <ModuleMenuContent onClose={() => setOpenMenu(null)} />
          </MenuDropdown>
        )}
        {openMenu === 'view' && (
          <MenuDropdown anchorId="view">
            <ViewMenuContent onClose={() => setOpenMenu(null)} />
          </MenuDropdown>
        )}
        {openMenu === 'help' && (
          <MenuDropdown anchorId="help">
            <HelpMenuContent onClose={() => setOpenMenu(null)} />
          </MenuDropdown>
        )}
      </AnimatePresence>

      {/* Context menu — hide self */}
      {menuPosition && (
        <BarContextMenu position={menuPosition} onClose={closeMenu} estimatedHeight={60}>
          <BarMenuItem
            label={t('menuBar.hide')}
            onClick={() => { useWorkspaceStore.getState().toggleMenuBar(); closeMenu(); }}
          />
        </BarContextMenu>
      )}
    </div>
  );
}
