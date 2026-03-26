'use client';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LifeBuoy, Keyboard, Info, GraduationCap } from 'lucide-react';
import { registry } from '@/lib/module-registry';
import { useTourStore } from '@/stores/tour-store';
import { MenuItem, MenuSeparator } from './menu-primitives';
import type { OnCloseProps } from './types';

export function HelpMenuContent({ onClose }: OnCloseProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setActiveTour = useTourStore((s) => s.setActiveTour);

  return (
    <>
      <MenuItem onClick={() => { setActiveTour('global-shell'); onClose(); }}>
        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>{t('tour.replay')}</span>
      </MenuItem>
      <MenuSeparator />
      <MenuItem onClick={() => { navigate(registry.getRoutePath('support') ?? '/lab/support'); onClose(); }}>
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
