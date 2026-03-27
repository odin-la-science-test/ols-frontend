import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, LogOut, User, Settings, Check, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui';
import { useThemeStore, useLanguageStore, useAuthStore, useProfilesStore, applySnapshot, LANGUAGES } from '@/stores';
import { getAvatarUrl } from '@/stores/auth-store';
import { useLogout } from '@/hooks';
import { toast } from '@/hooks';
import { getIconComponent } from '@/lib/workspace-utils.tsx';

function MenuContent({
  theme,
  toggleTheme,
  language,
  changeLanguage,
  user,
  logout,
  getInitials,
  getRoleLabel,
  navigate,
  t,
  variant = 'default',
}: {
  theme: string;
  toggleTheme: () => void;
  language: string;
  changeLanguage: (lang: string) => void;
  user: { firstName?: string; lastName?: string; email?: string; role?: string; avatar?: string } | null;
  logout: () => void;
  getInitials: () => string;
  getRoleLabel: () => string;
  navigate: (path: string) => void;
  t: (key: string, opts?: Record<string, string>) => string;
  variant?: 'default' | 'bottomBar';
}) {
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

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'fr': return t('settings.languages.french');
      case 'en': return t('settings.languages.english');
      default: return code.toUpperCase();
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'bottomBar' ? (
          <button className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-muted-foreground transition-colors relative">
            <Avatar className="h-6 w-6 hover:brightness-125 transition-all">
              <AvatarImage src={getAvatarUrl(user?.avatarId)} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-[10px] font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium leading-tight">{user?.firstName ?? t('common.more')}</span>
          </button>
        ) : (
          <Button
            variant="ghost"
            className="rounded-full p-0 h-8 w-8 hover:bg-transparent active:scale-95 transition-all"
          >
            <Avatar className="h-8 w-8 hover:brightness-125 transition-all">
              <AvatarImage src={getAvatarUrl(user?.avatarId)} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 glass-overlay border-border/50 shadow-2xl">
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

        {/* Profile & Settings */}
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('settings.profile')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('settings.title')}
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

        <DropdownMenuSeparator className="bg-border/50" />

        {/* Theme Toggle */}
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

export function UserMenu({ variant }: { variant?: 'default' | 'bottomBar' } = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { language, changeLanguage } = useLanguageStore();
  const user = useAuthStore((state) => state.user);
  const { logout } = useLogout();

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    const roleLabelMap: Record<string, string> = {
      GUEST: t('settings.roles.guest'),
      STUDENT: t('settings.roles.student'),
      PROFESSIONAL: t('settings.roles.professional'),
      ADMIN: t('settings.roles.admin'),
    };
    return roleLabelMap[user.role] || t('settings.guest');
  };

  return (
    <MenuContent
      theme={theme}
      toggleTheme={toggleTheme}
      language={language}
      changeLanguage={changeLanguage}
      user={user}
      logout={logout}
      getInitials={getInitials}
      getRoleLabel={getRoleLabel}
      navigate={navigate}
      t={t}
      variant={variant}
    />
  );
}

/**
 * UserMenu with absolute positioning (for pages without header)
 */
export function UserMenuAbsolute() {
  return (
    <motion.div
      className="absolute top-4 right-4 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <UserMenu />
    </motion.div>
  );
}
