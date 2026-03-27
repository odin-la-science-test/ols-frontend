'use client';

import { useCallback, type MouseEvent } from 'react';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { SelectionCheckbox } from './selection-checkbox';
import { useDensity } from '@/hooks';
import type { CardConfig, CardFieldConfig } from '../types';
import { Badge } from './badge';

// ═══════════════════════════════════════════════════════════════════════════
// DATA CARD GRID - Card-based view for data display
// ═══════════════════════════════════════════════════════════════════════════

// ─── Reusable Field Grid Component (DRY) ───
interface FieldGridProps<T> {
  fields: CardFieldConfig<T>[];
  item: T;
  getValue: (key: string) => unknown;
  columns?: number;
  className?: string;
}

function FieldGrid<T>({ 
  fields, 
  item, 
  getValue, 
  columns = 3,
  className 
}: FieldGridProps<T>) {
  const visibleFields = fields.filter(field => {
    const value = getValue(String(field.key));
    return value !== undefined && value !== null && value !== '';
  });

  if (visibleFields.length === 0) return null;

  return (
    <div 
      className={cn(
        `grid gap-2`,
        columns === 3 && 'grid-cols-3',
        columns === 2 && 'grid-cols-2',
        className
      )}
    >
      {visibleFields.map((field, i) => {
        const value = getValue(String(field.key));
        const shortLabel = field.label || '';
        const fullLabel = field.fullLabel || shortLabel;
        const hasTooltip = fullLabel !== shortLabel;

        const rendered = field.render 
          ? field.render(value, item) 
          : <span className="text-sm font-medium text-foreground">{String(value)}</span>;

        return (
          <div key={i} className="text-center">
            {/* Label with optional tooltip */}
            {shortLabel && (
              hasTooltip ? (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1 cursor-default border-b border-dotted border-muted-foreground/40 hover:border-primary/60 transition-colors inline-block">
                      {shortLabel}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {fullLabel}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {shortLabel}
                </div>
              )
            )}
            {/* Value */}
            <div className="flex justify-center">
              {rendered}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Data Card Grid Props ───
interface DataCardGridProps<T extends { id: string | number }> {
  data: T[];
  config: CardConfig<T>;
  /** Single item selection (for detail view) */
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

// ─── Single Card Component ───
interface DataCardProps<T extends { id: string | number }> {
  item: T;
  config: CardConfig<T>;
  isSelected: boolean;
  onSelect?: (item: T) => void;
  index: number;
  /** Selection mode props */
  isSelectionMode?: boolean;
  isChecked?: boolean;
  onToggleSelection?: (item: T) => void;
  isSelectionDisabled?: boolean;
}

function DataCard<T extends { id: string | number }>({
  item,
  config,
  isSelected,
  onSelect,
  index,
  isSelectionMode = false,
  isChecked = false,
  onToggleSelection,
  isSelectionDisabled = false,
}: DataCardProps<T>) {
  const d = useDensity();

  const getValue = useCallback((key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  }, [item]);

  const title = getValue(String(config.titleField)) as string;
  const subtitle = config.subtitleField ? getValue(String(config.subtitleField)) as string : undefined;
  const description = config.descriptionField ? getValue(String(config.descriptionField)) as string : undefined;
  const confidenceScore = (item as Record<string, unknown>).confidenceScore as number | undefined;

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelection?.(item);
    } else {
      onSelect?.(item);
    }
  };

  const handleCheckboxClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleClick}
      className={cn(
        'group relative bg-card rounded-xl border overflow-hidden cursor-pointer transition-all duration-200',
        // Normal selection (detail view)
        !isSelectionMode && isSelected && 'bg-muted',
        !isSelectionMode && !isSelected && 'hover:bg-muted',
        // Selection mode styling
        isSelectionMode && isChecked && 'ring-2 ring-primary bg-primary/5',
        isSelectionMode && !isChecked && 'hover:bg-muted/50',
        isSelectionMode && isSelectionDisabled && !isChecked && 'opacity-60'
      )}
    >
      {/* Selection Checkbox - only in selection mode */}
      {isSelectionMode && (
        <SelectionCheckbox
          isSelected={isChecked}
          isDisabled={isSelectionDisabled}
          onClick={handleCheckboxClick}
          className="absolute top-3 left-3 z-10"
        />
      )}

      {/* Header: Avatar + Title + Confidence */}
      <div className={cn(
        'flex items-start justify-between gap-3',
        d.cardHeaderPadding,
        isSelectionMode && 'pl-12' // Make room for checkbox
      )}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {config.avatarRender?.(item)}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base text-foreground italic truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {confidenceScore !== undefined && confidenceScore !== null && (
          <Badge
            variant={confidenceScore >= 80 ? 'success' : confidenceScore >= 50 ? 'warning' : 'secondary'}
            size="sm"
            className="font-bold shrink-0"
          >
            {confidenceScore}%
          </Badge>
        )}
      </div>

      {/* Badges Section - subtle background */}
      {config.badges && config.badges.length > 0 && (
        <div className={cn(d.cardSectionPadding, 'bg-muted/20')}>
          <FieldGrid
            fields={config.badges}
            item={item}
            getValue={getValue}
            columns={config.badges.length <= 2 ? 2 : 3}
          />
        </div>
      )}

      {/* Description */}
      {description && (
        <div className={cn(d.cardSectionPadding, 'bg')}>
          <p className="text-sm text-muted-foreground line-clamp-2">
            <span className="font-medium text-foreground/80">{config.descriptionLabel}: </span>
            {description}
          </p>
        </div>
      )}

      {/* Info Fields Section */}
      {config.infoFields && config.infoFields.length > 0 && (
        <div className={cn(d.cardSectionPadding, 'bg-muted/20')}>
          <FieldGrid
            fields={config.infoFields}
            item={item}
            getValue={getValue}
            columns={config.infoFields.length <= 2 ? 2 : 3}
          />
        </div>
      )}
    </motion.div>
  );
}

// ─── Loading Skeleton ───
function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-pulse">
      <div className="mb-3">
        <div className="h-5 bg-muted/50 rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted/30 rounded w-1/2" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-muted/30 rounded-full w-16" />
        <div className="h-6 bg-muted/30 rounded-full w-20" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-muted/30 rounded w-full" />
        <div className="h-4 bg-muted/30 rounded w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/30">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-3 bg-muted/30 rounded w-12 mx-auto mb-1" />
            <div className="h-4 bg-muted/40 rounded w-8 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Grid Component ───
export function DataCardGrid<T extends { id: string | number }>({
  data,
  config,
  selectedId,
  onSelect,
  isSelectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  isMaxSelectionReached = false,
  isLoading = false,
  emptyMessage,
  className,
}: DataCardGridProps<T>) {
  const d = useDensity();

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3', d.cardGridGap, className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3', d.cardGridGap, className)}>
      {data.map((item, index) => (
        <DataCard
          key={item.id}
          item={item}
          config={config}
          isSelected={selectedId === item.id}
          onSelect={onSelect}
          index={index}
          isSelectionMode={isSelectionMode}
          isChecked={selectedIds.has(item.id)}
          onToggleSelection={onToggleSelection}
          isSelectionDisabled={isMaxSelectionReached}
        />
      ))}
    </div>
  );
}
