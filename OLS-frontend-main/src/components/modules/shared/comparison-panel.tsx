'use client';

import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompareArrows, Minus, Equal, Copy, Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ToggleGroup, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { clipboard } from '@/lib/clipboard';
import { toast } from '@/hooks/use-toast';

import { getValue, areValuesEqual, formatComparisonAsText } from './comparison-panel-utils';
import { ComparisonRowDesktop, ComparisonRowMobile } from './comparison-row';
import { ItemHeader, MobileItemsSummary } from './comparison-header';

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON PANEL - Side-by-side comparison of multiple items
// ═══════════════════════════════════════════════════════════════════════════

// ─── Types ───
export interface ComparisonField<T> {
  key: keyof T | string;
  label: string;
  /** Custom renderer for field value */
  render?: (value: unknown, item: T) => ReactNode;
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
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups = new Map<string, ComparisonField<T>[]>();

    for (const field of config.fields) {
      const category = field.category || 'general';
      const existing = groups.get(category) || [];
      groups.set(category, [...existing, field]);
    }

    return groups;
  }, [config.fields]);

  // Filter fields if showing differences only
  const filterFields = useCallback((fields: ComparisonField<T>[]) => {
    if (!showDifferencesOnly) return fields;

    return fields.filter(field => {
      const values = items.map(item => getValue(item, String(field.key)));
      return !areValuesEqual(values);
    });
  }, [items, showDifferencesOnly]);

  // ─── Copy comparison as formatted text ───
  const [copied, setCopied] = useState(false);

  const handleCopyComparison = useCallback(async () => {
    const text = formatComparisonAsText(items, config);
    const success = await clipboard.copy(text);
    if (success) {
      setCopied(true);
      toast({ title: t('modules.comparison.copiedToClipboard') });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({ title: t('modules.comparison.copyFailed'), variant: 'destructive' });
    }
  }, [items, config, t]);

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
              'glass-overlay',
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
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showDifferencesOnly ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                      className="sm:hidden h-8 w-8"
                    >
                      {showDifferencesOnly ? <Minus className="h-4 w-4" /> : <Equal className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{showDifferencesOnly ? t('modules.comparison.differences') : t('common.total')}</TooltipContent>
                </Tooltip>
                {/* Copy comparison button */}
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyComparison}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      {copied
                        ? <Check className="h-4 w-4 text-green-500" />
                        : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('modules.comparison.copyComparison')}</TooltipContent>
                </Tooltip>
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
                          <Fragment key={String(field.key)}>
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
                          </Fragment>
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
