'use client';

import type { ReactNode } from 'react';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { PanelZone } from '@/stores/panel-registry-store';

export function SidebarDropZone({
  zone,
  children,
  className,
}: {
  zone: PanelZone;
  children: ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `sidebar-drop-${zone}`,
    data: { type: 'sidebar-zone', zone } as const,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full overflow-hidden transition-all duration-150',
        isOver && 'ring-1 ring-primary/30 ring-inset bg-primary/[0.04]',
        className,
      )}
    >
      {children}
    </div>
  );
}
