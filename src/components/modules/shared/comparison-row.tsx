import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';

import type { ComparisonField, ComparisonConfig } from './comparison-panel';
import { getValue, areValuesEqual, formatValue } from './comparison-panel-utils';

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON PANEL - Row components (Desktop & Mobile)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Types ───
interface ComparisonRowProps<T> {
  field: ComparisonField<T>;
  items: T[];
  isHighlighted: boolean;
}

// ─── Comparison Row - Desktop (side by side) ───
export function ComparisonRowDesktop<T extends { id: string | number }>({
  field,
  items,
  isHighlighted,
}: ComparisonRowProps<T>) {
  const values = items.map(item => getValue(item, String(field.key)));
  const allEqual = areValuesEqual(values);

  return (
    <div
      className={cn(
        'hidden md:grid gap-2 py-2 px-3 rounded-lg transition-colors',
        isHighlighted && !allEqual && 'bg-amber-500/10',
        isHighlighted && allEqual && 'bg-emerald-500/10'
      )}
      style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
    >
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground truncate">{field.label}</span>
        {!allEqual && (
          <Minus className="h-3 w-3 text-amber-500 shrink-0" />
        )}
        {allEqual && values[0] !== null && values[0] !== undefined && (
          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
        )}
      </div>

      {/* Values */}
      {items.map((item) => {
        const value = getValue(item, String(field.key));
        const rendered = field.render ? field.render(value, item) : formatValue(value);

        return (
          <div key={item.id} className="min-w-0 text-center">
            {rendered}
          </div>
        );
      })}
    </div>
  );
}

// ─── Comparison Row - Mobile (stacked) ───
export function ComparisonRowMobile<T extends { id: string | number }>({
  field,
  items,
  isHighlighted,
  config,
}: ComparisonRowProps<T> & { config: ComparisonConfig<T> }) {
  const values = items.map(item => getValue(item, String(field.key)));
  const allEqual = areValuesEqual(values);

  return (
    <div
      className={cn(
        'md:hidden rounded-lg transition-colors p-3',
        isHighlighted && !allEqual && 'bg-amber-500/10',
        isHighlighted && allEqual && 'bg-emerald-500/10'
      )}
    >
      {/* Field Label */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
        <span className="text-sm font-medium text-foreground">{field.label}</span>
        {!allEqual && (
          <Minus className="h-3 w-3 text-amber-500 shrink-0" />
        )}
        {allEqual && values[0] !== null && values[0] !== undefined && (
          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
        )}
      </div>

      {/* Values stacked vertically with item names */}
      <div className="space-y-2">
        {items.map((item) => {
          const value = getValue(item, String(field.key));
          const rendered = field.render ? field.render(value, item) : formatValue(value);
          const itemTitle = String(getValue(item, String(config.titleField)) ?? '');

          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground italic truncate max-w-[40%]">
                    {itemTitle}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">{itemTitle}</TooltipContent>
              </Tooltip>
              <div className="flex-1 text-right">
                {rendered}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
