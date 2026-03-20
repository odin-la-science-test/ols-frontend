'use client';

import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Sun, Moon, Globe, LogOut, User, Check, UserCircle, Settings, Keyboard, Rows3, Rows4, Rows2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useActivityBarStore,
  type ActivityBarItem,
  type SidebarPanelId,
  type ActivityBarPosition,
} from '@/stores/activity-bar-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useThemeStore, useLanguageStore, useAuthStore, LANGUAGES, useProfilesStore, applySnapshot } from '@/stores';
import { useLogout, toast } from '@/hooks';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator, SubMenu } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY BAR - Barre verticale d'icônes style VS Code
// Ultra-compacte (44px), à gauche de la GlobalSidebar
// Desktop only - Contrôle les panneaux de la sidebar
//
// Deux types d'items :
//   panel    → ouvre/ferme un panneau dans la sidebar
//   navigate → navigation directe vers une route
// ═══════════════════════════════════════════════════════════════════════════

/** Traduction key mapping pour chaque item */
const ITEM_LABEL_KEYS: Record<string, string> = {
  explorer: 'activityBar.explorer',
  notes: 'notes.title',
  notifications: 'notifications.title',
  settings: 'settings.title',
};

// ─── Shared Tooltip + Badge wrapper ─────────────────────────────────────

function ItemTooltip({ label, position = 'left' }: { label: string; position?: ActivityBarPosition }) {
  return (
    <div
      className={cn(
        'absolute px-2 py-1 rounded-md',
        'bg-popover text-popover-foreground text-xs font-medium',
        'border border-border/50 shadow-lg',
        'opacity-0 group-hover:opacity-100 pointer-events-none',
        'transition-opacity duration-150 whitespace-nowrap z-50',
        position === 'top'
          ? 'top-full mt-2 left-1/2 -translate-x-1/2'
          : position === 'bottom'
            ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
            : position === 'right'
              ? 'right-full mr-2'
              : 'left-full ml-2'
      )}
    >
      {label}
    </div>
  );
}

function ItemBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={cn(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center',
            'min-w-[16px] h-4 px-1 rounded-full',
            'bg-primary text-primary-foreground',
            'text-[9px] font-bold leading-none'
          )}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ─── Density-aware sizing for activity bar ──────────────────────────────

function useActivityBarDensity() {
  const density = useThemeStore((s) => s.density);
  if (density === 'compact') {
    return { btnSize: 'w-7 h-7', iconSize: 'h-3.5 w-3.5', avatarSize: 'h-5 w-5' };
  }
  // normal & comfortable share the same activity bar sizing
  return { btnSize: 'w-10 h-10', iconSize: 'h-[18px] w-[18px]', avatarSize: 'h-6 w-6' };
}

// ─── Panel Icon (toggle sidebar panel) ──────────────────────────────────

interface PanelIconProps {
  item: ActivityBarItem;
  isActive: boolean;
  /** Whether this panel is part of a multi-panel stack */
  isStacked?: boolean;
  badge?: number;
  onToggle: (e?: React.MouseEvent) => void;
  /** Side of the active indicator bar. Default: 'left' (panels gauche). Use 'right' for secondary sidebar. */
  indicatorSide?: 'left' | 'right';
  /** Position of the activity bar for tooltip direction */
  barPosition?: ActivityBarPosition;
}

function PanelIcon({ item, isActive, isStacked, badge, onToggle, indicatorSide = 'left', barPosition = 'left' }: PanelIconProps) {
  const { t } = useTranslation();
  const { btnSize, iconSize } = useActivityBarDensity();
  const label = t(ITEM_LABEL_KEYS[item.id] || item.id);
  const isHorizontal = barPosition === 'top' || barPosition === 'bottom';
  const indicatorOnTop = barPosition === 'bottom';

  // When both panels are active (stacked mode), don't use layoutId
  // to avoid framer-motion conflicts with duplicate layoutIds.
  const useAnimatedIndicator = isActive && !isStacked;

  return (
    <button
      onClick={(e) => onToggle(e)}
      className={cn(
        'relative flex items-center justify-center rounded-lg',
        btnSize,
        'transition-all duration-200 group',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
      title={label}
    >
      {/* Animated indicator (single active panel — normal/tabs mode) */}
      {useAnimatedIndicator && (
        <motion.div
          layoutId={`activity-bar-indicator-${indicatorSide}`}
          className={cn(
            'absolute rounded-full bg-primary',
            isHorizontal
              ? cn('left-1.5 right-1.5 h-[2px]', indicatorOnTop ? 'top-0' : 'bottom-0')
              : cn(
                  'top-1.5 bottom-1.5 w-[2px]',
                  indicatorSide === 'right' ? 'right-0' : 'left-0'
                )
          )}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      {/* Static indicator (both active in stacked mode) */}
      {isActive && isStacked && (
        <div
          className={cn(
            'absolute rounded-full bg-primary',
            isHorizontal
              ? cn('left-1.5 right-1.5 h-[2px]', indicatorOnTop ? 'top-0' : 'bottom-0')
              : cn(
                  'top-1.5 bottom-1.5 w-[2px]',
                  indicatorSide === 'right' ? 'right-0' : 'left-0'
                )
          )}
        />
      )}
      {/* Stacked dot: in stack but not the visible tab (tabs mode) */}
      {isStacked && !isActive && (
        <div
          className={cn(
            'absolute w-1 h-1 rounded-full bg-primary/60',
            isHorizontal
              ? cn('left-1/2 -translate-x-1/2', indicatorOnTop ? 'top-0.5' : 'bottom-0.5')
              : cn(
                  indicatorSide === 'right' ? 'right-1' : 'left-1',
                  'top-1/2 -translate-y-1/2'
                )
          )}
        />
      )}
      {getIconComponent(item.icon, cn(iconSize, isActive && 'text-foreground'))}
      <ItemBadge count={badge ?? 0} />
      <ItemTooltip label={label} position={barPosition} />
    </button>
  );
}

// ─── Draggable item wrapper ──────────────────────────────────────────────

interface DraggableItemProps {
  item: ActivityBarItem;
  children: React.ReactNode;
  axis?: 'x' | 'y';
}

function DraggableItem({ item, children }: DraggableItemProps) {
  return (
    <Reorder.Item
      value={item}
      id={item.id}
      className="flex items-center justify-center cursor-grab active:cursor-grabbing"
      whileDrag={{ scale: 1.1, opacity: 0.8 }}
      transition={{ duration: 0.15 }}
      style={{ touchAction: 'none' }}
    >
      {children}
    </Reorder.Item>
  );
}

// ─── User Avatar (VS Code style, bottom of activity bar) ────────────────

function ActivityBarUserAvatar({ barPosition = 'left' }: { barPosition?: ActivityBarPosition }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { language, changeLanguage } = useLanguageStore();
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();
  const { btnSize, avatarSize } = useActivityBarDensity();
  const { profiles, activeProfileId, setActiveProfileId } = useProfilesStore();

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const activeProfileName = activeProfile
    ? activeProfile.isDefault ? t(activeProfile.name) : activeProfile.name
    : null;

  const handleSwitchProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    applySnapshot(profile.snapshot);
    setActiveProfileId(profileId);
    const displayName = profile.isDefault ? t(profile.name) : profile.name;
    toast({ title: t('profiles.activated', { name: displayName }) });
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    const map: Record<string, string> = {
      GUEST: t('settings.roles.guest'),
      STUDENT: t('settings.roles.student'),
      PROFESSIONAL: t('settings.roles.professional'),
      ADMIN: t('settings.roles.admin'),
    };
    return user?.role ? (map[user.role] ?? '') : '';
  };

  const getLanguageLabel = (code: string) => {
    if (code === 'fr') return t('settings.languages.french');
    if (code === 'en') return t('settings.languages.english');
    return code.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn('relative flex items-center justify-center rounded-lg transition-all duration-200 group hover:bg-muted/50', btnSize)}
          title={user ? `${user.firstName} ${user.lastName}` : t('settings.profile')}
        >
          <Avatar className={avatarSize}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-[10px] font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <ItemTooltip label={user ? `${user.firstName} ${user.lastName}` : t('settings.profile')} position={barPosition} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={barPosition === 'top' ? 'bottom' : barPosition === 'bottom' ? 'top' : barPosition === 'right' ? 'left' : 'right'}
        sideOffset={4}
        className="w-60 ml-1 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl"
      >
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-primary font-medium">{getRoleLabel()}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />

        {/* Profile */}
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('settings.profile')}
        </DropdownMenuItem>

        {/* ── Workspace Profiles ── */}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuLabel className="flex items-center justify-between text-xs text-muted-foreground font-normal py-1.5">
          <span className="flex items-center gap-1.5">
            <UserCircle className="h-3 w-3" />
            {t('profiles.title')}
          </span>
          {activeProfileName && (
            <span className="text-[10px] text-primary font-medium truncate max-w-[80px]">
              {activeProfileName}
            </span>
          )}
        </DropdownMenuLabel>
        {profiles.map((profile) => {
          const isActive = activeProfileId === profile.id;
          const displayName = profile.isDefault ? t(profile.name) : profile.name;
          return (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleSwitchProfile(profile.id)}
              className="cursor-pointer gap-2"
            >
              <span className="text-muted-foreground shrink-0">
                {getIconComponent(profile.icon, 'h-3.5 w-3.5')}
              </span>
              <span className="flex-1 truncate">{displayName}</span>
              {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="cursor-pointer text-muted-foreground"
        >
          <span className="ml-5 text-xs">{t('profiles.create')} →</span>
        </DropdownMenuItem>

        {/* Theme Toggle */}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === 'dark' ? (
            <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          {theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
        </DropdownMenuItem>

        {/* Language Selection */}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuLabel className="flex items-center text-xs text-muted-foreground font-normal">
          <Globe className="mr-2 h-3 w-3" />
          {t('settings.language')}
        </DropdownMenuLabel>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{lang.flag}</span>
            {getLanguageLabel(lang.code)}
            {language === lang.code && <Check className="ml-auto h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}

        {/* Logout */}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Settings Quick Menu (dropdown, not navigation) ─────────────────────

function SettingsQuickMenu({ barPosition = 'left' }: { barPosition?: ActivityBarPosition }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { btnSize, iconSize } = useActivityBarDensity();
  const { density, setDensity } = useThemeStore();
  const label = t(ITEM_LABEL_KEYS.settings);
  const isActive = location.pathname === '/settings' || location.pathname.startsWith('/settings/');

  const densityOptions: { value: 'compact' | 'normal' | 'comfortable'; label: string; icon: React.ReactNode }[] = [
    { value: 'compact', label: t('settingsPage.densityCompact'), icon: <Rows4 className="h-3.5 w-3.5" /> },
    { value: 'normal', label: t('settingsPage.densityNormal'), icon: <Rows3 className="h-3.5 w-3.5" /> },
    { value: 'comfortable', label: t('settingsPage.densityComfortable'), icon: <Rows2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative flex items-center justify-center rounded-lg transition-all duration-200 group hover:bg-muted/50',
            btnSize,
            isActive ? 'text-foreground' : 'text-muted-foreground',
          )}
          title={label}
        >
          {getIconComponent('settings', cn(iconSize, isActive && 'text-foreground'))}
          <ItemTooltip label={label} position={barPosition} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={barPosition === 'top' ? 'bottom' : barPosition === 'bottom' ? 'top' : barPosition === 'right' ? 'left' : 'right'}
        sideOffset={4}
        className="w-52 ml-1 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl"
      >
        {/* Density */}
        <DropdownMenuLabel className="flex items-center text-xs text-muted-foreground font-normal">
          <Rows3 className="mr-2 h-3 w-3" />
          {t('settingsPage.density')}
        </DropdownMenuLabel>
        {densityOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setDensity(opt.value)}
            className="cursor-pointer"
          >
            <span className="mr-2 text-muted-foreground">{opt.icon}</span>
            {opt.label}
            {density === opt.value && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-border/50" />

        {/* Keyboard shortcuts */}
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Keyboard className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('menuBar.keyboardShortcuts')}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50" />

        {/* All settings */}
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('settings.title')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Activity Bar ───────────────────────────────────────────────────────

interface ActivityBarProps {
  className?: string;
}

export function ActivityBar({ className }: ActivityBarProps) {
  const { t } = useTranslation();
  const { items, badges, togglePanel, stackPanel, reorderItems, setItemVisible, position, setPosition } = useActivityBarStore();
  const density = useThemeStore((s) => s.density);
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();
  const primaryZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activePanel = primaryZone.isOpen ? primaryZone.activeTab : null;
  const leftStack = primaryZone.stack;
  const leftLayout = primaryZone.viewMode;

  const isHorizontal = position === 'top' || position === 'bottom';
  const indicatorSide = position === 'right' ? 'right' : 'left';

  // Visible items split by type (settings always anchored at bottom)
  const visibleItems = React.useMemo(
    () => items.filter((item) => item.visible),
    [items]
  );

  const panelItems = React.useMemo(
    () => visibleItems.filter((item) => item.type === 'panel'),
    [visibleItems]
  );

  const settingsItem = React.useMemo(
    () => visibleItems.find((item) => item.id === 'settings'),
    [visibleItems]
  );

  const handleSectionReorder = React.useCallback(
    (newSection: ActivityBarItem[], sectionItems: ActivityBarItem[]) => {
      // Find what moved
      for (let i = 0; i < newSection.length; i++) {
        if (newSection[i].id !== sectionItems[i]?.id) {
          const fromId = sectionItems.find((x) => !newSection.slice(0, i + 1).find((y) => y.id === x.id))?.id;
          const toId = newSection[i].id;
          if (fromId && toId) {
            const fromIdx = items.findIndex((x) => x.id === fromId);
            const toIdx = items.findIndex((x) => x.id === toId);
            if (fromIdx !== -1 && toIdx !== -1) reorderItems(fromIdx, toIdx);
          }
          break;
        }
      }
    },
    [items, reorderItems]
  );

  // All panel items are global (no more contextual module-specific items)
  const globalPanelItems = panelItems;

  // Position labels for context menu
  const positionLabels: { value: ActivityBarPosition; label: string }[] = [
    { value: 'left', label: t('activityBar.positionLeft') },
    { value: 'top', label: t('activityBar.positionTop') },
    { value: 'right', label: t('activityBar.positionRight') },
    { value: 'bottom', label: t('activityBar.positionBottom') },
  ];

  return (
    <div
      className={cn(
        'hidden lg:flex flex-shrink-0 z-30',
        'bg-card/80',
        'overflow-hidden',
        // ── Vertical layout (left/right) ──
        !isHorizontal && cn(
          'flex-col items-center',
          'overflow-y-auto overflow-x-hidden',
          position === 'right' ? 'border-l border-border/50' : 'border-r border-border/50',
          density === 'compact' ? 'w-9 py-1 gap-0.5' : 'w-11 py-2',
        ),
        // ── Horizontal layout (top/bottom) ──
        isHorizontal && cn(
          'flex-row items-center',
          position === 'bottom' ? 'border-t border-border/50' : 'border-b border-border/50',
          'overflow-x-auto overflow-y-hidden',
          density === 'compact' ? 'h-9 px-1 gap-0.5' : 'h-11 px-2',
        ),
        className
      )}
      style={{ fontSize: '16px' }}
      onContextMenu={handleContextMenu}
    >
      {/* ── Panel items (draggable) ── */}
      <Reorder.Group
        axis={isHorizontal ? 'x' : 'y'}
        values={globalPanelItems}
        onReorder={(newOrder) => handleSectionReorder(newOrder, globalPanelItems)}
        className={cn(
          'flex items-center gap-1',
          isHorizontal ? 'flex-row' : 'flex-col',
        )}
      >
        {globalPanelItems.map((item) => {
          const inStack = leftStack.includes(item.id);
          const isStacked = leftStack.length > 1 && inStack;
          const isActive = leftLayout === 'stacked' && isStacked
            ? true
            : activePanel === item.id as string;

          return (
          <DraggableItem key={item.id} item={item} axis={isHorizontal ? 'x' : 'y'}>
            <PanelIcon
              item={item}
              isActive={isActive}
              isStacked={isStacked}
              badge={badges[item.id]}
              indicatorSide={indicatorSide}
              barPosition={position}
              onToggle={(e) => {
                if (e?.ctrlKey || e?.metaKey) {
                  stackPanel(item.id as SidebarPanelId);
                } else {
                  togglePanel(item.id as SidebarPanelId);
                }
              }}
            />
          </DraggableItem>
          );
        })}
      </Reorder.Group>

      {/* ── Bottom/End: Avatar + Settings ── */}
      <div className={cn(
        'flex-shrink-0 flex items-center',
        isHorizontal
          ? cn('flex-row border-l border-border/30 ml-auto', density === 'compact' ? 'pl-1 gap-0.5' : 'pl-2 gap-1')
          : cn('flex-col border-t border-border/30 mt-auto', density === 'compact' ? 'pt-1 gap-0.5' : 'pt-2 gap-1'),
      )}>
        <ActivityBarUserAvatar barPosition={position} />
        {settingsItem && <SettingsQuickMenu barPosition={position} />}
      </div>

      {/* Context menu — toggle own items + position submenu */}
      {menuPosition && (
        <BarContextMenu position={menuPosition} onClose={closeMenu} estimatedHeight={280}>
          {items.map((item) => (
            <MenuItem
              key={item.id}
              label={t(ITEM_LABEL_KEYS[item.id] || item.id)}
              onClick={() => { setItemVisible(item.id, !item.visible); closeMenu(); }}
              checked={item.visible}
            />
          ))}
          <MenuSeparator />
          {/* Position submenu */}
          <SubMenu label={t('activityBar.position')}>
            {positionLabels.map((opt) => (
              <MenuItem
                key={opt.value}
                label={opt.label}
                onClick={() => { setPosition(opt.value); closeMenu(); }}
                checked={position === opt.value}
              />
            ))}
          </SubMenu>
          <MenuSeparator />
          <MenuItem
            label={t('settingsPage.resetDefaults')}
            onClick={() => { useActivityBarStore.getState().resetToDefaults(); closeMenu(); }}
          />
          <MenuSeparator />
          <MenuItem
            label={t('activityBar.hide')}
            onClick={() => { useActivityBarStore.getState().toggleActivityBar(); closeMenu(); }}
          />
        </BarContextMenu>
      )}
    </div>
  );
}
