'use client';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { useHubModules } from '@/hooks';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { MenuItem, MenuSeparator } from './menu-primitives';
import type { PlatformMenuContentProps } from './types';

export function PlatformMenuContent({ type, accentColor, onClose }: PlatformMenuContentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = useAuthStore((s) => s.user?.role === 'GUEST');
  const { data: modules, isLoading } = useHubModules(type);

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

        return (
          <MenuItem
            key={mod.moduleKey}
            onClick={() => !isLocked && handleNav(mod.routePath)}
            isActive={isCurrent}
            disabled={isLocked}
          >
            <DynamicIcon name={mod.icon} className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{mod.title}</span>
            {isLocked && <Lock className="h-3 w-3 text-muted-foreground/40 ml-auto shrink-0" />}
            {isCurrent && !isLocked && <Check className="h-3 w-3 text-primary ml-auto shrink-0" />}
          </MenuItem>
        );
      })}

    </>
  );
}
