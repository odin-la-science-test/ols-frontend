'use client';

import { useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { getAccentForPath } from '@/lib/accent-colors';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';

import type { SortableTabItemProps } from './types';

export function SortableTabItem({
  tab, isActive, sizeMode, isCompact, groupColor,
  onActivate, onClose, onContextMenu, groupId,
}: SortableTabItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPinned = tab.pinned ?? false;
  const iconOnly = sizeMode === 'icon-only';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tab.id,
    data: { type: 'tab', id: tab.id, source: groupId } as const,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.15 : undefined,
  };

  const paddingClass = (() => {
    if (iconOnly) return isCompact ? 'px-2 py-0.5' : 'px-2.5 py-1.5';
    if (sizeMode === 'mini') return isCompact ? 'px-1.5 py-0.5' : 'px-2 py-1.5';
    if (sizeMode === 'shrunk') return isCompact ? 'px-2 py-0.5' : 'px-2.5 py-1.5';
    return isCompact ? 'px-2 py-0.5' : 'px-3 py-1.5';
  })();

  const gapClass = (iconOnly || sizeMode === 'mini') ? 'gap-1' : (isCompact ? 'gap-1.5' : 'gap-2');
  const textSizeClass = isCompact || sizeMode !== 'full' ? 'text-xs' : 'text-sm';

  const maxTitleWidth = (() => {
    if (iconOnly) return undefined;
    if (sizeMode === 'mini') return isCompact ? 32 : 40;
    if (sizeMode === 'shrunk') return isCompact ? 56 : 72;
    return isCompact ? 100 : 120;
  })();

  const tabElement = (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'relative flex items-center rounded-t-lg cursor-pointer',
        'transition-all duration-150 select-none border-b-0 shrink-0',
        gapClass, paddingClass, textSizeClass,
        isActive
          ? getAccentForPath(tab.path)
            ? 'text-white shadow-sm'
            : 'bg-muted text-foreground shadow-sm'
          : 'bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] text-muted-foreground hover:bg-muted hover:text-foreground',

      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActivate}
      onContextMenu={onContextMenu}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          if (!isPinned) onClose(e as unknown as ReactMouseEvent<HTMLDivElement>);
        }
      }}
    >
      {/* Active background (colored for modules, neutral for system) */}
      {isActive && getAccentForPath(tab.path) && (
        <div
          className="absolute inset-0 rounded-t-lg"
          style={{ backgroundColor: getAccentForPath(tab.path)! }}
        />
      )}

      {/* Group color stripe */}
      {groupColor && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg z-10"
          style={{ backgroundColor: groupColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-inherit">
        {isPinned && iconOnly ? (
          <Pin className={cn('shrink-0', isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
        ) : (
          getIconComponent(tab.icon, isCompact ? 'h-3 w-3 shrink-0' : 'h-4 w-4 shrink-0')
        )}

        {!iconOnly && (
          <span className="truncate" style={{ maxWidth: maxTitleWidth }}>
            {tab.title}
          </span>
        )}

        {isPinned && !iconOnly && (
          <Pin className={cn('shrink-0 text-muted-foreground/60', isCompact ? 'h-2 w-2' : 'h-2.5 w-2.5')} />
        )}

        {/* Close button */}
        <AnimatePresence>
          {!isPinned && (isHovered || isActive) && !iconOnly && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              onClick={onClose}
              className={cn(
                'p-0.5 rounded transition-colors shrink-0',
                isActive
                  ? 'text-white/60 hover:text-white hover:bg-white/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <X className={isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
            </motion.button>
          )}
          {!isPinned && (isHovered || isActive) && iconOnly && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              onClick={onClose}
              className={cn(
                'p-0.5 rounded transition-colors shrink-0 absolute -top-1 -right-1',
                isActive ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              <X className="h-2 w-2" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (!iconOnly) return tabElement;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{tabElement}</TooltipTrigger>
      <TooltipContent side="bottom">{tab.title}</TooltipContent>
    </Tooltip>
  );
}
