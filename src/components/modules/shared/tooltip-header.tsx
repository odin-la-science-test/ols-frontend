'use client';

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';

interface TooltipHeaderProps {
  shortLabel: string;
  fullLabel: string;
}

export function TooltipHeader({ shortLabel, fullLabel }: TooltipHeaderProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="cursor-default border-b border-dotted border-muted-foreground/40 hover:border-primary/60 transition-colors">
          {shortLabel}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{fullLabel}</TooltipContent>
    </Tooltip>
  );
}