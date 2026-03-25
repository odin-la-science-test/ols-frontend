'use client';

import { cn } from '@/lib/utils';
import { type ActivityBarPosition } from '@/stores/activity-bar-store';

export function ItemTooltip({ label, position = 'left' }: { label: string; position?: ActivityBarPosition }) {
  return (
    <div
      className={cn(
        'absolute px-2 py-1 rounded-md',
        'bg-popover text-popover-foreground text-xs font-medium',
        'border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] shadow-lg',
        'opacity-0 group-hover:opacity-100 pointer-events-none',
        'transition-opacity duration-150 whitespace-nowrap z-50',
        position === 'top'
          ? 'top-full mt-2 left-1/2 -translate-x-1/2'
          : position === 'bottom'
            ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
            : position === 'right'
              ? 'right-full mr-2'
              : 'left-full ml-2'
      )}
    >
      {label}
    </div>
  );
}
