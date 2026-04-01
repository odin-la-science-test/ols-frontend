import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Settings, Bell, LogOut, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { registry, type ModuleDefinition } from '@/lib/module-registry';
import { filterAccessibleModules } from '@/lib/module-registry/registry';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { Button, Avatar, AvatarFallback, AvatarImage, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useAuthStore, useModuleAccessStore } from '@/stores';
import { useCommandPaletteStore } from '@/stores/command-palette-store';
import { getAvatarUrl } from '@/stores/auth-store';
import { useLogout } from '@/hooks';
import { useUnreadCount } from '@/features/notifications';
import { Logo } from '@/components/common/logo';
import { BetaBadge } from '@/components/common/beta-badge';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIC SIDEBAR — Navigation SaaS classique (Notion/Linear style)
//
// Sidebar gauche avec modules groupes par plateforme, liens systeme,
// et avatar utilisateur. Alternative au shell IDE (activity bar + tabs).
// ═══════════════════════════════════════════════════════════════════════════

// ─── Reusable nav item (icon + optional label + tooltip when collapsed) ───

interface NavItemProps {
  icon: React.ReactNode;
  label?: string;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onClick: () => void;
}

function NavItem({ icon, label, active, collapsed, badge, onClick }: NavItemProps) {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-sm transition-colors duration-200 relative',
        collapsed && 'justify-center',
        active
          ? 'bg-primary/10 text-foreground font-medium'
          : 'text-foreground/70 hover:bg-muted/50 hover:text-foreground',
      )}
    >
      {icon}
      {!collapsed && label && <span className="truncate">{label}</span>}
      {badge != null && badge > 0 && (
        <span className={cn(
          'flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none',
          collapsed ? 'absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5' : 'ml-auto min-w-[16px] h-4 px-1',
        )}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );

  if (collapsed && label) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// ─── Module section (Atlas / Lab) ───

interface SidebarSectionProps {
  label: string;
  modules: ModuleDefinition[];
  accentColor: string;
  sectionOpen: boolean;
  collapsed: boolean;
  currentPath: string;
  onToggle: () => void;
  onNavigate: (path: string) => void;
}

function SidebarSection({ label, modules, sectionOpen, collapsed, currentPath, onToggle, onNavigate }: SidebarSectionProps) {
  if (modules.length === 0) return null;
  const { t } = useTranslation();

  return (
    <div>
      {/* Section header — text when expanded, colored dot when collapsed */}
      {collapsed ? (
        <div className="flex justify-center py-1">
          <div className="w-4 h-0.5 rounded-full bg-border" />
        </div>
      ) : (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/50 hover:text-foreground/60 transition-colors duration-200"
        >
          {sectionOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {label}
        </button>
      )}

      {/* Module list — always visible when collapsed, toggleable when expanded */}
      {(collapsed || sectionOpen) && (
        <div className={cn('space-y-0.5', collapsed ? 'px-1' : 'px-2')}>
          {modules.map((mod) => {
            const path = `/${mod.route.path}`;
            const isActive = currentPath === path || currentPath.startsWith(`${path}/`);
            return (
              <NavItem
                key={mod.id}
                icon={<DynamicIcon name={mod.icon} className="h-4 w-4 shrink-0" />}
                label={t(mod.translationKey)}
                active={isActive}
                collapsed={collapsed}
                onClick={() => onNavigate(path)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main sidebar ───

export function ClassicSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canAccess = useModuleAccessStore((s) => s.canAccess);
  const openPalette = useCommandPaletteStore((s) => s.open);
  const { logout } = useLogout();

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const notificationsPath = registry.getRoutePath('notifications') ?? '/lab/notifications';

  const [collapsed, setCollapsed] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(true);
  const [labOpen, setLabOpen] = useState(true);

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  };

  const atlasModules = filterAccessibleModules(registry.getByPlatform('atlas'), canAccess);
  const labModules = filterAccessibleModules(registry.getByPlatform('lab'), canAccess);

  return (
    <div
      data-tour="classic-sidebar"
      className={cn(
        'hidden lg:flex flex-col surface-low transition-[width] duration-300 ease-out',
        collapsed ? 'w-12' : 'w-60',
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center h-10 shrink-0', collapsed ? 'justify-center px-1' : 'justify-between px-3')}>
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button onClick={() => navigate('/')} className="flex items-center justify-center shrink-0 rounded-md hover:bg-muted/50 transition-colors duration-200 h-7 w-7">
                  <Logo size={22} animate={false} className="drop-shadow-none" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t('common.home')}</TooltipContent>
            </Tooltip>
            <BetaBadge />
          </div>
        )}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? t('workspace.expand') : t('workspace.collapse')}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Search */}
      <div data-tour="classic-sidebar-search" className={cn('shrink-0', collapsed ? 'px-1 py-1.5' : 'px-2 py-2')}>
        {collapsed ? (
          <NavItem
            icon={<Search className="h-4 w-4 shrink-0" />}
            label={t('settingsPage.classicSidebarSearch')}
            active={false}
            collapsed
            onClick={() => openPalette()}
          />
        ) : (
          <button
            onClick={() => openPalette()}
            className="flex items-center gap-2 w-full h-8 px-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-sm">{t('settingsPage.classicSidebarSearch')}</span>
            <kbd className="ml-auto text-[10px] text-foreground/40 font-mono">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1 space-y-2">
        <SidebarSection
          label={t('settingsPage.classicSidebarAtlas')}
          modules={atlasModules}
          accentColor={MUNIN_PRIMARY}
          sectionOpen={atlasOpen}
          collapsed={collapsed}
          currentPath={location.pathname}
          onToggle={() => setAtlasOpen(!atlasOpen)}
          onNavigate={(path) => navigate(path)}
        />
        <SidebarSection
          label={t('settingsPage.classicSidebarLab')}
          modules={labModules}
          accentColor={HUGIN_PRIMARY}
          sectionOpen={labOpen}
          collapsed={collapsed}
          currentPath={location.pathname}
          onToggle={() => setLabOpen(!labOpen)}
          onNavigate={(path) => navigate(path)}
        />
      </nav>

      {/* Footer */}
      <div className={cn('shrink-0 py-1.5', collapsed ? 'px-1' : 'px-2', 'space-y-0.5')}>
        <NavItem
          icon={<Bell className="h-4 w-4 shrink-0" />}
          label={t('notifications.title')}
          active={location.pathname.startsWith(notificationsPath)}
          collapsed={collapsed}
          badge={unreadCount}
          onClick={() => navigate(notificationsPath)}
        />
        <NavItem
          icon={<Settings className="h-4 w-4 shrink-0" />}
          label={t('settingsPage.classicSidebarSettings')}
          active={location.pathname.startsWith('/settings')}
          collapsed={collapsed}
          onClick={() => navigate('/settings')}
        />
        <NavItem
          icon={
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage src={user ? getAvatarUrl(user.avatarId) : undefined} />
              <AvatarFallback className="text-[9px]">{getInitials()}</AvatarFallback>
            </Avatar>
          }
          label={user ? `${user.firstName} ${user.lastName}` : undefined}
          active={location.pathname.startsWith('/profile')}
          collapsed={collapsed}
          onClick={() => navigate('/profile')}
        />
        <NavItem
          icon={<LogOut className="h-4 w-4 shrink-0" />}
          label={t('common.logout')}
          active={false}
          collapsed={collapsed}
          onClick={logout}
        />

      </div>
    </div>
  );
}
