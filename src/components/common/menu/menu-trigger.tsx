'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { MenuId, MenuTriggerProps } from './types';

const MENU_LABELS: Record<MenuId, string> = {
  atlas: 'atlas.title',
  lab: 'lab.title',
  module: 'menuBar.module',
  'module-split': 'menuBar.module',
  view: 'menuBar.view',
  help: 'menuBar.help',
};

export function MenuTrigger({ id, icon, label: labelOverride, accentColor, isOpen, isCompact, onToggle, onHover }: MenuTriggerProps) {
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
          ? 'bg-[color-mix(in_srgb,var(--color-muted)_60%,transparent)] text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]'
      )}
      style={isOpen && accentColor ? { color: accentColor } : undefined}
    >
      {icon}
      <span className="font-medium">{displayLabel}</span>
    </button>
  );
}
