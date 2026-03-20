'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  FlaskConical,
  Lock,
  Loader2,
  PanelTop,
  PanelLeft,
  PanelRight,
  PanelBottom,
  LayoutGrid,
  LayoutList,
  Maximize,
  Navigation as NavigationIcon,
  Keyboard,
  LifeBuoy,
  Info,
  Check,
  Download,
  GitCompareArrows,
  Columns2,
  Rows2,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { useWorkspaceStore, useAuthStore, useThemeStore, useViewStore, useTabsStore } from '@/stores';
import { useActivityBarStore } from '@/stores';
import { getAccentForPath } from '@/lib/accent-colors';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useModulesByType } from '@/hooks';
import { useKeybindingsStore, formatKeyCombo } from '@/stores/keybindings-store';
import { getModuleIcon } from '@/lib/module-icons';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import type { ModuleType } from '@/api';
import { BarContextMenu, useBarContextMenuState, MenuItem as BarMenuItem } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// MENU BAR - Top-level navigation bar à la VS Code
//
// Horizontal bar above everything:
//   Munin Atlas ▾  │  Hugin Lab ▾  │  View ▾  │  Help ▾
//
// Desktop only. Hidden in focus mode and minimal shell pages.
// Each menu opens a dropdown panel on click.
// ═══════════════════════════════════════════════════════════════════════════

type MenuId = 'atlas' | 'lab' | 'module' | 'module-split' | 'view' | 'help';

export function MenuBar() {
  const [openMenu, setOpenMenu] = React.useState<MenuId | null>(null);
  const barRef = React.useRef<HTMLDivElement>(null);
  const toolbar = useModuleToolbarStore((s) => s.registration);
  const density = useThemeStore((s) => s.density);
  const isCompact = density === 'compact';
  const { t } = useTranslation();
  const location = useLocation();
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();

  // ─── Resolve module label from toolbar or route ───
  const splitActive = useEditorGroupsStore((s) => s.splitActive);
  const splitGroup = useEditorGroupsStore((s) => s.groups.find(g => g.id === 'split'));
  const allTabs = useTabsStore((s) => s.tabs);

  const resolveModuleLabel = React.useCallback((pathname: string | null): string | null => {
    if (!pathname) return null;
    const ROUTE_MODULE_LABELS: Record<string, string> = {
      '/atlas/bacteriology': 'bacteriology.title',
      '/atlas/mycology': 'mycology.title',
      '/lab/quickshare': 'quickshare.title',
      '/lab/notes': 'notes.title',
      '/lab/contacts': 'contacts.title',
      '/lab/notifications': 'notifications.title',
    };
    const match = Object.entries(ROUTE_MODULE_LABELS).find(([route]) =>
      pathname === route || pathname.startsWith(route + '/')
    );
    return match ? t(match[1]) : null;
  }, [t]);

  // Main module label from current route
  const mainModuleLabel = React.useMemo(
    () => resolveModuleLabel(location.pathname) || (toolbar ? t(`${toolbar.moduleKey}.title`) : null),
    [location.pathname, resolveModuleLabel, toolbar, t],
  );

  // Split module: resolve from split group's active tab
  const splitTabPath = React.useMemo(() => {
    if (!splitActive || !splitGroup?.activeTabId) return null;
    const tab = allTabs.find(tt => tt.id === splitGroup.activeTabId);
    return tab?.path ?? null;
  }, [splitActive, splitGroup?.activeTabId, allTabs]);

  const splitModuleLabel = React.useMemo(
    () => splitTabPath ? resolveModuleLabel(splitTabPath) : null,
    [splitTabPath, resolveModuleLabel],
  );

  // Accent colors per module
  const mainAccentColor = React.useMemo(() => getAccentForPath(location.pathname), [location.pathname]);
  const splitAccentColor = React.useMemo(
    () => splitTabPath ? getAccentForPath(splitTabPath) : mainAccentColor,
    [splitTabPath, mainAccentColor],
  );

  // Show two separate module triggers in split mode?
  const showSplitModuleTrigger = splitActive && splitModuleLabel && splitModuleLabel !== mainModuleLabel;

  // Close on click outside (bar + portalled dropdown)
  React.useEffect(() => {
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
  React.useEffect(() => {
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

      {/* Module menu(s) — one per module, two in split mode */}
      {toolbar && (
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
        {openMenu === 'module' && toolbar && (
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

// ─── Home button (leftmost) ─────────────────────────────────────────────

function HomeButton({ isCompact, onClose }: { isCompact: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => { navigate('/'); onClose(); }}
      className={cn(
        'flex items-center justify-center rounded-sm transition-colors',
        'hover:bg-muted/40',
        isCompact ? 'h-5 w-5' : 'h-6 w-6'
      )}
      title={t('common.home')}
    >
      <Logo size={isCompact ? 14 : 16} animate={false} className="drop-shadow-none" />
    </button>
  );
}

// ─── Menu trigger button ────────────────────────────────────────────────

const MENU_LABELS: Record<MenuId, string> = {
  atlas: 'atlas.title',
  lab: 'lab.title',
  module: 'menuBar.module',
  'module-split': 'menuBar.module',
  view: 'menuBar.view',
  help: 'menuBar.help',
};

interface MenuTriggerProps {
  id: MenuId;
  icon?: React.ReactNode;
  /** Override the default i18n label */
  label?: string;
  accentColor?: string;
  isOpen: boolean;
  isCompact: boolean;
  onToggle: (id: MenuId) => void;
  onHover: (id: MenuId) => void;
}

function MenuTrigger({ id, icon, label: labelOverride, accentColor, isOpen, isCompact, onToggle, onHover }: MenuTriggerProps) {
  const { t } = useTranslation();
  const displayLabel = labelOverride ?? t(MENU_LABELS[id]);

  return (
    <button
      data-menu-trigger={id}
      onClick={() => onToggle(id)}
      onMouseEnter={() => onHover(id)}
      className={cn(
        'relative flex items-center gap-1.5 rounded-sm transition-colors',
        isCompact ? 'px-1.5 h-5 text-[11px]' : 'px-2 h-6 text-xs',
        isOpen
          ? 'bg-muted/60 text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
      )}
      style={isOpen && accentColor ? { color: accentColor } : undefined}
    >
      {icon}
      <span className="font-medium">{displayLabel}</span>
    </button>
  );
}

// ─── Dropdown wrapper (positioned below trigger) ─────────────────────────

function MenuDropdown({ anchorId, children }: { anchorId: MenuId; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useLayoutEffect(() => {
    const trigger = document.querySelector(`[data-menu-trigger="${anchorId}"]`);
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setPos({ top: rect.bottom, left: rect.left });
    }
  }, [anchorId]);

  // Portal to <body> so backdrop-filter is not blocked by a parent's
  // own backdrop-filter (which creates an isolated stacking context).
  return createPortal(
    <motion.div
      ref={ref}
      data-menu-dropdown
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={cn(
        'fixed z-[100] mt-0',
        'min-w-[220px] max-w-[320px]',
        'rounded-lg border border-border/50',
        'bg-card/80 backdrop-blur-xl shadow-2xl',
        'py-1'
      )}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </motion.div>,
    document.body
  );
}

// ─── Platform menu content (Atlas / Lab modules) ─────────────────────────

interface PlatformMenuContentProps {
  type: ModuleType;
  accentColor: string;
  onClose: () => void;
}

function PlatformMenuContent({ type, accentColor, onClose }: PlatformMenuContentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = useAuthStore((s) => s.user?.role === 'GUEST');
  const { data: modules, isLoading } = useModulesByType(type);

  const platformPath = type === 'MUNIN_ATLAS' ? '/atlas' : '/lab';
  const platformTitle = type === 'MUNIN_ATLAS' ? t('atlas.title') : t('lab.title');

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Platform header — navigates to platform page */}
      <MenuItem
        onClick={() => handleNav(platformPath)}
        isActive={location.pathname === platformPath}
        className="font-medium"
        accentColor={accentColor}
      >
        <span style={{ color: accentColor }}>{platformTitle}</span>
        <span className="ml-auto text-[10px] text-muted-foreground/50">{t('menuBar.viewAll')}</span>
      </MenuItem>

      <MenuSeparator />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
          <span className="text-xs">{t('common.loading')}</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!modules || modules.length === 0) && (
        <div className="text-center py-4 text-muted-foreground/60 text-xs">
          {t('megaMenu.noModules')}
        </div>
      )}

      {/* Module list */}
      {!isLoading && modules?.map((mod) => {
        const isLocked = mod.locked || !!isGuest;
        const isCurrent = location.pathname === mod.routePath || location.pathname.startsWith(mod.routePath + '/');
        const IconComp = getModuleIcon(mod.icon);

        return (
          <MenuItem
            key={mod.moduleKey}
            onClick={() => !isLocked && handleNav(mod.routePath)}
            isActive={isCurrent}
            disabled={isLocked}
          >
            <IconComp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{mod.title}</span>
            {isLocked && <Lock className="h-3 w-3 text-muted-foreground/40 ml-auto shrink-0" />}
            {isCurrent && !isLocked && <Check className="h-3 w-3 text-primary ml-auto shrink-0" />}
          </MenuItem>
        );
      })}

    </>
  );
}

// ─── Module menu content (contextual actions) ────────────────────────────

function ModuleMenuContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const toolbar = useModuleToolbarStore((s) => s.registration);
  const viewMode = useViewStore((s) => s.viewMode);

  if (!toolbar) return null;

  return (
    <>
      {/* View mode toggle (table / cards) */}
      {toolbar.hasCardView && (
        <MenuItem onClick={() => { toolbar.onToggleViewMode(); }}>
          {viewMode === 'table'
            ? <LayoutList className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            : <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          }
          <span className="flex-1">
            {viewMode === 'table' ? t('common.viewTable') : t('common.viewCards')}
          </span>
        </MenuItem>
      )}

      {/* Compare */}
      {toolbar.hasCompare && (
        <MenuItem onClick={() => { toolbar.onToggleCompareMode(); onClose(); }}>
          <GitCompareArrows className={cn('h-3.5 w-3.5 shrink-0', toolbar.isCompareMode ? 'text-primary' : 'text-muted-foreground')} />
          <span className="flex-1">
            {toolbar.isCompareMode ? t('modules.comparison.exitMode') : t('modules.compare')}
          </span>
          {toolbar.isCompareMode && <Check className="h-3 w-3 text-primary shrink-0" />}
        </MenuItem>
      )}

      {/* Separator before export if we had items above */}
      {(toolbar.hasCardView || toolbar.hasCompare) && toolbar.hasExport && <MenuSeparator />}

      {/* Export */}
      {toolbar.hasExport && (
        <MenuItem
          onClick={() => { toolbar.onExport(); onClose(); }}
          disabled={!toolbar.canExport}
        >
          <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="flex-1">{t('common.export')}</span>
        </MenuItem>
      )}
    </>
  );
}

// ─── View menu content (layout toggles) ──────────────────────────────────

function ViewMenuContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const {
    tabBarVisible, toggleTabBar,
    globalSidebarOpen, toggleGlobalSidebar,
    showBreadcrumbs, toggleBreadcrumbs,
    statusBarVisible, toggleStatusBar,
    menuBarVisible, toggleMenuBar,
    focusMode, toggleFocusMode,
  } = useWorkspaceStore();
  const { activityBarVisible, toggleActivityBar, position: activityBarPosition, setPosition: setActivityBarPosition } = useActivityBarStore();
  const { getEffectiveCombo } = useKeybindingsStore();
  const { visible: bottomPanelVisible, toggleVisible: toggleBottomPanel, alignment: panelAlignment, setAlignment: setPanelAlignment } = useBottomPanelStore();
  const { primaryMode, secondaryMode, togglePrimaryMode, toggleSecondaryMode, activityMode, toggleActivityMode, setActivityMode, setPrimaryMode, setSecondaryMode, primarySide, secondarySide, setPrimarySide, setSecondarySide } = useSidebarModeStore();
  const { splitActive, toggleSplit } = useEditorGroupsStore();
  const toggleViewMode = usePanelRegistryStore((s) => s.toggleViewMode);
  const activityPanelViewMode = usePanelRegistryStore((s) => (s.zones['activity-panel'] ?? { viewMode: 'tabs' }).viewMode);
  const primaryViewMode = usePanelRegistryStore((s) => (s.zones.primary ?? { viewMode: 'tabs' }).viewMode);
  const secondaryViewMode = usePanelRegistryStore((s) => (s.zones.secondary ?? { viewMode: 'tabs' }).viewMode);

  const viewItems = [
    {
      icon: PanelLeft,
      label: t('menuBar.sidebar'),
      checked: globalSidebarOpen,
      onToggle: toggleGlobalSidebar,
      shortcut: formatKeyCombo(getEffectiveCombo('toggleSidebar')),
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
      <MenuSubMenu
        icon={<PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('activityBar.title', 'Explorateur')}
      >
        <MenuSubMenu
          icon={<Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarModeLabel', 'Mode')}
        >
          <MenuItem onClick={() => { setActivityMode('dock'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModeDock', 'Ancré')}</span>
            {activityMode === 'dock' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setActivityMode('overlay'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModeOverlay', 'Superposé')}</span>
            {activityMode === 'overlay' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setActivityMode('pinned'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModePinned', 'Épinglé')}</span>
            {activityMode === 'pinned' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
        <MenuSubMenu
          icon={<Rows2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarViewLabel', 'Vue')}
        >
          <MenuItem onClick={() => { toggleViewMode('activity-panel'); onClose(); }}>
            <span className="flex-1">{t('workspace.sidebarLayoutTabs', 'Onglets')}</span>
            {activityPanelViewMode === 'tabs' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { toggleViewMode('activity-panel'); onClose(); }}>
            <span className="flex-1">{t('workspace.sidebarLayoutStacked', 'Empilé')}</span>
            {activityPanelViewMode === 'stacked' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
      </MenuSubMenu>

      {/* ── Primary Sidebar ── */}
      <MenuSubMenu
        icon={<PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('settingsPage.primarySidebarMode')}
      >
        <MenuSubMenu
          icon={<Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarModeLabel', 'Mode')}
        >
          <MenuItem onClick={() => { setPrimaryMode('dock'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModeDock', 'Ancré')}</span>
            {primaryMode === 'dock' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setPrimaryMode('overlay'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModeOverlay', 'Superposé')}</span>
            {primaryMode === 'overlay' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setPrimaryMode('pinned'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModePinned', 'Épinglé')}</span>
            {primaryMode === 'pinned' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
        <MenuSubMenu
          icon={<Rows2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarViewLabel', 'Vue')}
        >
          <MenuItem onClick={() => { toggleViewMode('primary'); onClose(); }}>
            <span className="flex-1">{t('workspace.sidebarLayoutTabs', 'Onglets')}</span>
            {primaryViewMode === 'tabs' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { toggleViewMode('primary'); onClose(); }}>
            <span className="flex-1">{t('workspace.sidebarLayoutStacked', 'Empilé')}</span>
            {primaryViewMode === 'stacked' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
        <MenuSubMenu
          icon={primarySide === 'left' ? <PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarSideLabel', 'Côté')}
        >
          <MenuItem onClick={() => { setPrimarySide('left'); onClose(); }}>
            <PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{t('activityBar.positionLeft', 'Gauche')}</span>
            {primarySide === 'left' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setPrimarySide('right'); onClose(); }}>
            <PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{t('activityBar.positionRight', 'Droite')}</span>
            {primarySide === 'right' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
      </MenuSubMenu>

      {/* ── Secondary Sidebar ── */}
      <MenuSubMenu
        icon={<PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('settingsPage.secondarySidebarMode')}
      >
        <MenuSubMenu
          icon={<Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarModeLabel', 'Mode')}
        >
          <MenuItem onClick={() => { setSecondaryMode('dock'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModeDock', 'Ancré')}</span>
            {secondaryMode === 'dock' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setSecondaryMode('overlay'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModeOverlay', 'Superposé')}</span>
            {secondaryMode === 'overlay' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setSecondaryMode('pinned'); onClose(); }}>
            <span className="flex-1">{t('settingsPage.sidebarModePinned', 'Épinglé')}</span>
            {secondaryMode === 'pinned' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
        <MenuSubMenu
          icon={<Rows2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarViewLabel', 'Vue')}
        >
          <MenuItem onClick={() => { toggleViewMode('secondary'); onClose(); }}>
            <span className="flex-1">{t('workspace.sidebarLayoutTabs', 'Onglets')}</span>
            {secondaryViewMode === 'tabs' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { toggleViewMode('secondary'); onClose(); }}>
            <span className="flex-1">{t('workspace.sidebarLayoutStacked', 'Empilé')}</span>
            {secondaryViewMode === 'stacked' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
        <MenuSubMenu
          icon={secondarySide === 'left' ? <PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarSideLabel', 'Côté')}
        >
          <MenuItem onClick={() => { setSecondarySide('left'); onClose(); }}>
            <PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{t('activityBar.positionLeft', 'Gauche')}</span>
            {secondarySide === 'left' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { setSecondarySide('right'); onClose(); }}>
            <PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{t('activityBar.positionRight', 'Droite')}</span>
            {secondarySide === 'right' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
      </MenuSubMenu>

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

// ─── Help menu content ───────────────────────────────────────────────────

function HelpMenuContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <MenuItem onClick={() => { navigate('/lab/support'); onClose(); }}>
        <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>{t('menuBar.support')}</span>
      </MenuItem>
      <MenuItem onClick={() => { navigate('/settings'); onClose(); }}>
        <Keyboard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>{t('menuBar.keyboardShortcuts')}</span>
      </MenuItem>
      <MenuSeparator />
      <MenuItem onClick={onClose} disabled>
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>{t('menuBar.about')}</span>
        <span className="ml-auto text-[10px] text-muted-foreground/50">v0.1.0</span>
      </MenuItem>
    </>
  );
}

// ─── SubMenu for MenuBar dropdowns ───────────────────────────────────────

interface MenuSubMenuProps {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function MenuSubMenu({ icon, label, children }: MenuSubMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [openLeft, setOpenLeft] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOpenLeft(rect.right + 200 > window.innerWidth);
    }
    setOpen(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors duration-75 hover:bg-muted/40 cursor-pointer">
        {icon}
        <span className="flex-1 truncate">{label}</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: openLeft ? 4 : -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: openLeft ? 4 : -4 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute top-0 min-w-[200px] py-1 rounded-lg',
              'bg-popover border border-border/50 shadow-xl backdrop-blur-xl z-[60]',
              openLeft ? 'right-full mr-1' : 'left-full ml-1',
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Reusable menu item ──────────────────────────────────────────────────

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  accentColor?: string;
}

function MenuItem({ children, onClick, isActive, disabled, className, accentColor }: MenuItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left',
        'transition-colors duration-75',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-muted/40 cursor-pointer',
        isActive && 'bg-muted/30',
        className
      )}
      style={isActive && accentColor ? { borderLeft: `2px solid ${accentColor}` } : undefined}
    >
      {children}
    </button>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────

function MenuSeparator() {
  return <div className="h-px bg-border/30 my-1 mx-2" />;
}
