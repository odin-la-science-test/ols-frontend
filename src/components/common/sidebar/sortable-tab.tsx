'use client';

import type { CSSProperties } from 'react';

import { X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { DragMeta } from '@/components/common/shell-dnd-context';

import type { SortableTabProps } from './types';

export function SortableTab({
  panel,
  zone,
  isActive,
  density,
  onClick,
  onClose,
  showClose,
  multiTab,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `sidebar-tab-${zone}-${panel.id}`,
    data: { type: 'sidebar-panel', id: panel.id, source: zone } satisfies DragMeta,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        'group/tab relative flex-1 min-w-0 flex items-center gap-1 transition-colors cursor-pointer select-none',
        density === 'compact' ? 'px-2 py-0.5' : 'px-2.5 py-1',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground/70 hover:text-muted-foreground',
        isDragging && 'opacity-30 z-50',
        'cursor-grab active:cursor-grabbing',
      )}
    >
      <span className="flex-1 min-w-0 text-[10px] font-medium uppercase tracking-wider truncate">
        {panel.label}
      </span>
      {showClose && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="shrink-0 rounded p-0.5 opacity-0 group-hover/tab:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
        >
          <X className="h-2.5 w-2.5" />
        </span>
      )}
      {/* Active indicator — only shown when multiple tabs */}
      {multiTab && (
        <div
          className={cn(
            'absolute bottom-0 left-1 right-1 h-[1.5px] rounded-full transition-all',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
          style={isActive ? { backgroundColor: panel.accentColor ?? 'hsl(var(--primary))' } : undefined}
        />
      )}
    </div>
  );
}
