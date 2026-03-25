import { X } from 'lucide-react';
import { Button, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useTranslation } from 'react-i18next';

import { getValue } from './comparison-panel-utils';

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON PANEL - Header components (ItemHeader & MobileItemsSummary)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Item Header - Desktop ───
export interface ItemHeaderProps<T> {
  item: T;
  titleField: keyof T;
  subtitleField?: keyof T;
  onRemove?: () => void;
  showRemove: boolean;
}

export function ItemHeader<T extends { id: string | number }>({
  item,
  titleField,
  subtitleField,
  onRemove,
  showRemove,
}: ItemHeaderProps<T>) {
  const { t } = useTranslation();
  const title = String(getValue(item, String(titleField)) ?? '');
  const subtitle = subtitleField ? String(getValue(item, String(subtitleField)) ?? '') : undefined;

  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] rounded-lg min-w-0">
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <h4 className="font-semibold text-sm text-center truncate w-full italic">
            {title}
          </h4>
        </TooltipTrigger>
        <TooltipContent side="top">{title}</TooltipContent>
      </Tooltip>
      {subtitle && (
        <span className="text-xs text-muted-foreground truncate w-full text-center">
          {subtitle}
        </span>
      )}
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="mt-1 h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <X className="h-3 w-3 mr-1" />
          {t('common.remove')}
        </Button>
      )}
    </div>
  );
}

// ─── Mobile Items Summary ───
export interface MobileItemsSummaryProps<T> {
  items: T[];
  titleField: keyof T;
  onRemoveItem?: (id: string | number) => void;
}

export function MobileItemsSummary<T extends { id: string | number }>({
  items,
  titleField,
  onRemoveItem,
}: MobileItemsSummaryProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="md:hidden p-4 border-b border-[color-mix(in_srgb,var(--color-border)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_20%,transparent)]">
      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
        {t('modules.comparison.selected', { count: items.length })}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const title = String(getValue(item, String(titleField)) ?? '');
          return (
            <div
              key={item.id}
              className="flex items-center gap-1 px-2 py-1 bg-[color-mix(in_srgb,var(--color-background)_50%,transparent)] rounded-md border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]"
            >
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium italic truncate max-w-[120px]">
                    {title}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">{title}</TooltipContent>
              </Tooltip>
              {onRemoveItem && items.length > 2 && (
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
