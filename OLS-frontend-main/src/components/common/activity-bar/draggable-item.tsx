'use client';

import { type ReactNode } from 'react';

import { Reorder } from 'framer-motion';
import { type ActivityBarItem } from '@/stores/activity-bar-store';

// ─── Draggable item wrapper ──────────────────────────────────────────────

interface DraggableItemProps {
  item: ActivityBarItem;
  children: ReactNode;
  axis?: 'x' | 'y';
}

export function DraggableItem({ item, children }: DraggableItemProps) {
  return (
    <Reorder.Item
      value={item}
      id={item.id}
      className="flex items-center justify-center cursor-grab active:cursor-grabbing"
      whileDrag={{ scale: 1.1, opacity: 0.8 }}
      transition={{ duration: 0.15 }}
      style={{ touchAction: 'none' }}
    >
      {children}
    </Reorder.Item>
  );
}
