'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { SelectionCheckbox } from './selection-checkbox';
import { useDensity } from '@/hooks';
import type { ColumnDef, SortConfig } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// DATA TABLE - Flexible, sortable table with selection
// ═══════════════════════════════════════════════════════════════════════════

interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: ColumnDef<T>[];
  sort?: SortConfig;
  onSort?: (sort: SortConfig) => void;
  selectedId?: string | number | null;
  onSelect?: (row: T) => void;
  /** Multi-selection mode */
  isSelectionMode?: boolean;
  selectedIds?: Set<string | number>;
  onToggleSelection?: (item: T) => void;
  isMaxSelectionReached?: boolean;
  /** Loading & empty states */
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  sort,
  onSort,
  selectedId,
  onSelect,
  isSelectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  isMaxSelectionReached = false,
  isLoading = false,
  emptyMessage,
  className,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const d = useDensity();

  const handleSort = (key: string) => {
    if (!onSort) return;

    if (sort?.key === key) {
      onSort({
        key,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSort({ key, direction: 'asc' });
    }
  };

  const getSortIcon = (key: string) => {
    if (sort?.key !== key) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  const getValue = (row: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  const handleRowClick = (row: T) => {
    if (isSelectionMode) {
      onToggleSelection?.(row);
    } else {
      onSelect?.(row);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent, row: T) => {
    e.stopPropagation();
    onToggleSelection?.(row);
  };

  // Scroll horizontal avec la molette verticale (comme VS Code)
  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Si déjà un scroll horizontal (trackpad), laisser faire
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // Si le contenu déborde horizontalement, convertir molette → scroll H
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 0.8, behavior: 'auto' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border bg-card overflow-hidden',
          className
        )}
      >
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className={cn('border-b border-border bg-muted/30', d.tableHeaderPadding)}>
            <div className="h-4 bg-muted/50 rounded w-1/3" />
          </div>
          {/* Row skeletons */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn('border-b border-border/30 last:border-0', d.tableCellPadding)}
            >
              <div className="flex gap-4">
                <div className="h-4 bg-muted/30 rounded flex-1" />
                <div className="h-4 bg-muted/30 rounded w-20" />
                <div className="h-4 bg-muted/30 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border bg-card overflow-hidden',
          className
        )}
      >
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden',
        className
      )}
    >
      <div ref={scrollRef} className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {/* Selection column header */}
              {isSelectionMode && (
                <th className={d.tableCheckboxPadding}>
                  <span className="sr-only">{t('common.selection')}</span>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    d.tableHeaderPadding,
                    'text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                    col.sortable &&
                      onSort &&
                      'cursor-pointer select-none hover:text-foreground transition-colors'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div
                    className={cn(
                      'flex items-center gap-2',
                      col.align === 'right' && 'justify-end'
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && onSort && getSortIcon(String(col.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border/30">
            {data.map((row) => {
              const isChecked = selectedIds.has(row.id);
              
              return (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className={cn(
                    'group transition-colors',
                    (onSelect || isSelectionMode) && 'cursor-pointer',
                    // Normal selection (detail view)
                    !isSelectionMode && selectedId === row.id
                      ? 'bg-primary/5 hover:bg-primary/10'
                      : !isSelectionMode && 'even:bg-muted/15 hover:bg-muted/30',
                    // Selection mode styling
                    isSelectionMode && isChecked && 'bg-primary/5',
                    isSelectionMode && !isChecked && 'even:bg-muted/15 hover:bg-muted/30',
                    isSelectionMode && isMaxSelectionReached && !isChecked && 'opacity-60'
                  )}
                >
                  {/* Selection checkbox column */}
                  {isSelectionMode && (
                    <td className={d.tableCheckboxPadding}>
                      <SelectionCheckbox
                        isSelected={isChecked}
                        isDisabled={isMaxSelectionReached}
                        onClick={(e) => handleCheckboxClick(e, row)}
                        size="sm"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const value = getValue(row, String(col.key));
                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          d.tableCellPadding,
                          'text-sm',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.render ? col.render(value, row) : String(value ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Pagination Component ───
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const d = useDensity();

  return (
    <div className={cn('flex items-center justify-between', d.paginationPadding, className)}>
      <span className="text-sm text-muted-foreground">
        {startItem}-{endItem} {t('common.of')} {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
