'use client';

import type { CSSProperties } from 'react';

import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { DynamicBottomTab } from '@/stores/bottom-panel-store';
import { getIconComponent } from '@/lib/workspace-utils.tsx';

interface SortableDynamicTabProps {
  tab: DynamicBottomTab;
  isActive: boolean;
  isCompact: boolean;
  onClick: () => void;
}

export function SortableDynamicTab({
  tab,
  isActive,
  isCompact,
  onClick,
}: SortableDynamicTabProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.15 : undefined,
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 text-xs font-medium transition-colors select-none',
        isCompact ? 'py-1' : 'py-1.5',
        isActive
          ? 'text-foreground border-b-2'
          : 'text-muted-foreground hover:text-foreground pb-[2px]',
      )}
      style={isActive ? { ...style, borderBottomColor: tab.accentColor ?? 'color-mix(in srgb, var(--color-foreground) 25%, transparent)' } : style}
    >
      {getIconComponent(tab.icon, 'h-3.5 w-3.5')}
      {t(tab.labelKey)}
    </button>
  );
}
