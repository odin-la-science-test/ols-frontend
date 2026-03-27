'use client';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, LogOut, User, Check, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ActivityBarPosition } from '@/stores/activity-bar-store';
import { useThemeStore, useLanguageStore, useAuthStore, LANGUAGES, useProfilesStore, applySnapshot } from '@/stores';
import { getAvatarUrl } from '@/stores/auth-store';
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

import { useActivityBarDensity } from './utils';
import { ItemTooltip } from './item-tooltip';

// ─── User Avatar (VS Code style, bottom of activity bar) ────────────────

export function ActivityBarUserAvatar({ barPosition = 'left' }: { barPosition?: ActivityBarPosition }) {
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
        >
          <Avatar className={avatarSize}>
            <AvatarImage src={getAvatarUrl(user?.avatarId)} />
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
        className="w-60 ml-1 glass-overlay border-border/50 shadow-2xl"
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
