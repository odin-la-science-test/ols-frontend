'use client';

import { type ReactNode } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Keyboard, Rows3, Rows4, Rows2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ActivityBarPosition } from '@/stores/activity-bar-store';
import { useThemeStore } from '@/stores';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';

import { getItemLabelKey, useActivityBarDensity } from './utils';
import { ItemTooltip } from './item-tooltip';

// ─── Settings Quick Menu (dropdown, not navigation) ─────────────────────

export function SettingsQuickMenu({ barPosition = 'left' }: { barPosition?: ActivityBarPosition }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { btnSize, iconSize } = useActivityBarDensity();
  const { density, setDensity } = useThemeStore();
  const label = t(getItemLabelKey('settings'));
  const isActive = location.pathname === '/settings' || location.pathname.startsWith('/settings/');

  const densityOptions: { value: 'compact' | 'normal' | 'comfortable'; label: string; icon: ReactNode }[] = [
    { value: 'compact', label: t('settingsPage.densityCompact'), icon: <Rows4 className="h-3.5 w-3.5" /> },
    { value: 'normal', label: t('settingsPage.densityNormal'), icon: <Rows3 className="h-3.5 w-3.5" /> },
    { value: 'comfortable', label: t('settingsPage.densityComfortable'), icon: <Rows2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative flex items-center justify-center rounded-lg transition-all duration-200 group hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)]',
            btnSize,
            isActive ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {getIconComponent('settings', cn(iconSize, isActive && 'text-foreground'))}
          <ItemTooltip label={label} position={barPosition} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={barPosition === 'top' ? 'bottom' : barPosition === 'bottom' ? 'top' : barPosition === 'right' ? 'left' : 'right'}
        sideOffset={4}
        className="w-52 ml-1 bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] backdrop-blur-xl border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] shadow-2xl"
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

        <DropdownMenuSeparator className="bg-[color-mix(in_srgb,var(--color-border)_50%,transparent)]" />

        {/* Keyboard shortcuts */}
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Keyboard className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('menuBar.keyboardShortcuts')}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[color-mix(in_srgb,var(--color-border)_50%,transparent)]" />

        {/* All settings */}
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          {t('settings.title')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
