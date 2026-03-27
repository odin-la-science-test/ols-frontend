import { type ReactNode, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

export interface VirtualListProps<T> {
  items: T[];
  estimateSize: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  getItemKey?: (index: number) => string | number;
}

export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  className,
  overscan = 5,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey,
  });

  return (
    <div ref={parentRef} className={cn('overflow-auto', className)}>
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute left-0 top-0 w-full"
            style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
