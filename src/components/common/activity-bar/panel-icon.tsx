'use client';

import { type MouseEvent as ReactMouseEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  type ActivityBarItem,
  type ActivityBarPosition,
} from '@/stores/activity-bar-store';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { getAccentForPath } from '@/lib/accent-colors';

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
  const { pathname } = useLocation();
  const { btnSize, iconSize } = useActivityBarDensity();
  const label = t(getItemLabelKey(item.id));
  const isHorizontal = barPosition === 'top' || barPosition === 'bottom';
  const indicatorOnTop = barPosition === 'bottom';

  // Navigation indicator: colored on module pages, neutral on system pages
  const accentColor = getAccentForPath(pathname);
  const indicatorStyle = accentColor ? { backgroundColor: accentColor } : undefined;
  const indicatorClass = accentColor ? 'absolute rounded-full' : 'absolute rounded-full system-indicator';

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
    >
      {/* Animated indicator (single active panel — normal/tabs mode) */}
      {useAnimatedIndicator && (
        <motion.div
          layoutId={`activity-bar-indicator-${indicatorSide}`}
          className={cn(
            indicatorClass,
            isHorizontal
              ? cn('left-1.5 right-1.5 h-[2px]', indicatorOnTop ? 'top-0' : 'bottom-0')
              : cn(
                  'top-1.5 bottom-1.5 w-[2px]',
                  indicatorSide === 'right' ? 'right-0' : 'left-0'
                )
          )}
          style={indicatorStyle}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      {/* Static indicator (both active in stacked mode) */}
      {isActive && isStacked && (
        <div
          className={cn(
            indicatorClass,
            isHorizontal
              ? cn('left-1.5 right-1.5 h-[2px]', indicatorOnTop ? 'top-0' : 'bottom-0')
              : cn(
                  'top-1.5 bottom-1.5 w-[2px]',
                  indicatorSide === 'right' ? 'right-0' : 'left-0'
                )
          )}
          style={indicatorStyle}
        />
      )}
      {/* Stacked dot: in stack but not the visible tab (tabs mode) */}
      {isStacked && !isActive && (
        <div
          className={cn(
            'absolute w-1 h-1 rounded-full',
            accentColor ? '' : 'system-dot',
            isHorizontal
              ? cn('left-1/2 -translate-x-1/2', indicatorOnTop ? 'top-0.5' : 'bottom-0.5')
              : cn(
                  indicatorSide === 'right' ? 'right-1' : 'left-1',
                  'top-1/2 -translate-y-1/2'
                )
          )}
          style={accentColor ? { backgroundColor: `color-mix(in srgb, ${accentColor} 60%, transparent)` } : undefined}
        />
      )}
      <DynamicIcon name={item.icon} className={cn(iconSize, isActive && 'text-foreground')} />
      <ItemBadge count={badge ?? 0} />
      <ItemTooltip label={label} position={barPosition} />
    </button>
  );
}
