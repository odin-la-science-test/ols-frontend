'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompareArrows, Check, Minus, Equal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ToggleGroup } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { Badge } from './badge';

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON PANEL - Side-by-side comparison of multiple items
// ═══════════════════════════════════════════════════════════════════════════

// ─── Types ───
export interface ComparisonField<T> {
  key: keyof T | string;
  label: string;
  /** Custom renderer for field value */
  render?: (value: unknown, item: T) => React.ReactNode;
  /** Category/group for organizing fields */
  category?: string;
}

export interface ComparisonConfig<T> {
  /** Main title field (e.g., species) */
  titleField: keyof T;
  /** Subtitle field */
  subtitleField?: keyof T;
  /** Fields to compare */
  fields: ComparisonField<T>[];
  /** Optional icon */
  icon?: LucideIcon;
}

interface ComparisonPanelProps<T extends { id: string | number }> {
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  config: ComparisonConfig<T>;
  /** Remove an item from comparison */
  onRemoveItem?: (id: string | number) => void;
  className?: string;
}

// ─── Helper: Get nested value ───
function getValue<T>(item: T, key: string): unknown {
  const keys = key.split('.');
  let value: unknown = item;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return value;
}

// ─── Helper: Check if values are equal ───
function areValuesEqual(values: unknown[]): boolean {
  if (values.length < 2) return true;
  const first = JSON.stringify(values[0]);
  return values.every(v => JSON.stringify(v) === first);
}

// ─── Helper: Format value for display ───
function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50">—</span>;
  }
  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-success font-medium">+</span>
    ) : (
      <span className="text-muted-foreground">−</span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground/50">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 3).map((v, i) => (
          <Badge key={i} variant="secondary" size="sm">
            {String(v)}
          </Badge>
        ))}
        {value.length > 3 && (
          <Badge variant="outline" size="sm">
            +{value.length - 3}
          </Badge>
        )}
      </div>
    );
  }
  if (typeof value === 'number') {
    return <span className="font-mono text-sm">{value}</span>;
  }
  return <span className="text-sm">{String(value)}</span>;
}

// ─── Comparison Row - Desktop (side by side) ───
interface ComparisonRowProps<T> {
  field: ComparisonField<T>;
  items: T[];
  isHighlighted: boolean;
}

function ComparisonRowDesktop<T extends { id: string | number }>({
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
function ComparisonRowMobile<T extends { id: string | number }>({
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
              <span className="text-xs text-muted-foreground italic truncate max-w-[40%]" title={itemTitle}>
                {itemTitle}
              </span>
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

// ─── Item Header - Desktop ───
interface ItemHeaderProps<T> {
  item: T;
  titleField: keyof T;
  subtitleField?: keyof T;
  onRemove?: () => void;
  showRemove: boolean;
}

function ItemHeader<T extends { id: string | number }>({
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
    <div className="flex flex-col items-center gap-1 p-3 bg-muted/30 rounded-lg min-w-0">
      <h4 className="font-semibold text-sm text-center truncate w-full italic" title={title}>
        {title}
      </h4>
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
interface MobileItemsSummaryProps<T> {
  items: T[];
  titleField: keyof T;
  onRemoveItem?: (id: string | number) => void;
}

function MobileItemsSummary<T extends { id: string | number }>({
  items,
  titleField,
  onRemoveItem,
}: MobileItemsSummaryProps<T>) {
  const { t } = useTranslation();
  
  return (
    <div className="md:hidden p-4 border-b border-border/30 bg-muted/20">
      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
        {t('modules.comparison.selected', { count: items.length })}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const title = String(getValue(item, String(titleField)) ?? '');
          return (
            <div 
              key={item.id}
              className="flex items-center gap-1 px-2 py-1 bg-background/50 rounded-md border border-border/50"
            >
              <span className="text-sm font-medium italic truncate max-w-[120px]" title={title}>
                {title}
              </span>
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

// ─── Main Component ───
export function ComparisonPanel<T extends { id: string | number }>({
  isOpen,
  onClose,
  items,
  config,
  onRemoveItem,
  className,
}: ComparisonPanelProps<T>) {
  const { t } = useTranslation();
  const [showDifferencesOnly, setShowDifferencesOnly] = React.useState(false);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Group fields by category
  const groupedFields = React.useMemo(() => {
    const groups = new Map<string, ComparisonField<T>[]>();
    
    for (const field of config.fields) {
      const category = field.category || 'general';
      const existing = groups.get(category) || [];
      groups.set(category, [...existing, field]);
    }
    
    return groups;
  }, [config.fields]);

  // Filter fields if showing differences only
  const filterFields = React.useCallback((fields: ComparisonField<T>[]) => {
    if (!showDifferencesOnly) return fields;
    
    return fields.filter(field => {
      const values = items.map(item => getValue(item, String(field.key)));
      return !areValuesEqual(values);
    });
  }, [items, showDifferencesOnly]);

  const Icon = config.icon || GitCompareArrows;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'absolute inset-x-0 bottom-0 z-50',
              'h-[85vh] md:h-[80vh]',
              'bg-card/80 backdrop-blur-xl',
              'border-t border-border/50',
              'shadow-2xl',
              'flex flex-col',
              'rounded-t-2xl',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 p-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold truncate">
                    {t('modules.comparison.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    {t('modules.comparison.selected', { count: items.length })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Desktop/tablet: ToggleGroup */}
                <ToggleGroup
                  size="sm"
                  options={[
                    { value: 'total', label: t('common.total') },
                    { value: 'differences', label: t('modules.comparison.differences') },
                  ]}
                  value={showDifferencesOnly ? 'differences' : 'total'}
                  onChange={(val) => setShowDifferencesOnly(val === 'differences')}
                  className="hidden sm:inline-flex"
                />
                {/* Mobile: simple icon toggle */}
                <Button
                  variant={showDifferencesOnly ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                  className="sm:hidden h-8 w-8"
                  title={showDifferencesOnly ? t('modules.comparison.differences') : t('common.total')}
                >
                  {showDifferencesOnly ? <Minus className="h-4 w-4" /> : <Equal className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile: Items Summary (chips) */}
            <MobileItemsSummary
              items={items}
              titleField={config.titleField}
              onRemoveItem={onRemoveItem}
            />

            {/* Desktop: Item Headers - Sticky */}
            <div 
              className="hidden md:grid gap-2 p-4 border-b border-border/30 bg-muted/20 shrink-0 overflow-x-auto"
              style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
            >
              <div /> {/* Empty cell for alignment */}
              {items.map((item) => (
                <ItemHeader
                  key={item.id}
                  item={item}
                  titleField={config.titleField}
                  subtitleField={config.subtitleField}
                  onRemove={onRemoveItem ? () => onRemoveItem(item.id) : undefined}
                  showRemove={items.length > 2}
                />
              ))}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6 md:space-y-2">
                {Array.from(groupedFields.entries()).map(([category, fields]) => {
                  const filteredFields = filterFields(fields);
                  if (filteredFields.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2 md:space-y-1">
                      {category !== 'general' && (
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-3">
                          {category}
                        </h3>
                      )}
                      <div className="space-y-3 md:space-y-1">
                        {filteredFields.map((field) => (
                          <React.Fragment key={String(field.key)}>
                            {/* Desktop view */}
                            <ComparisonRowDesktop
                              field={field}
                              items={items}
                              isHighlighted={true}
                            />
                            {/* Mobile view */}
                            <ComparisonRowMobile
                              field={field}
                              items={items}
                              isHighlighted={true}
                              config={config}
                            />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
