'use client';

import * as React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Button } from './button';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// ICON BUTTON WITH TOOLTIP - Reusable button with consistent tooltip style
// ═══════════════════════════════════════════════════════════════════════════

interface IconButtonWithTooltipProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function IconButtonWithTooltip({
  icon,
  tooltip,
  onClick,
  disabled = false,
  className,
  side = 'bottom',
}: IconButtonWithTooltipProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'hover:bg-muted/50',
            className
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
