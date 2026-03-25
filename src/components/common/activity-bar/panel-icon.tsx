'use client';

import { type MouseEvent as ReactMouseEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  type ActivityBarItem,
  type ActivityBarPosition,
} from '@/stores/activity-bar-store';
import { getIconComponent } from '@/lib/workspace-utils.tsx';

import { getItemLabelKey, useActivityBarDensity } from './utils';
import { ItemTooltip } from './item-tooltip';
import { ItemBadge } from './item-badge';

// ─── Panel Icon (toggle sidebar panel) ──────────────────────────────────

export interface PanelIconProps {
  item: ActivityBarItem;
  isActive: boolean;
  /** Whether this panel is part of a multi-panel stack */
  isStacked?: boolean;
  badge?: number;
  onToggle: (e?: ReactMouseEvent<HTMLElement>) => void;
  /** Side of the active indicator bar. Default: 'left' (panels gauche). Use 'right' for secondary sidebar. */
  indicatorSide?: 'left' | 'right';
  /** Position of the activity bar for tooltip direction */
  barPosition?: ActivityBarPosition;
}

export function PanelIcon({ item, isActive, isStacked, badge, onToggle, indicatorSide = 'left', barPosition = 'left' }: PanelIconProps) {
  const { t } = useTranslation();
  const { btnSize, iconSize } = useActivityBarDensity();
  const label = t(getItemLabelKey(item.id));
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
          : 'text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)]'
      )}
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
            'absolute w-1 h-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_60%,transparent)]',
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
