import type { ReactNode } from 'react';

import { Badge } from './badge';
import type { ComparisonConfig, ComparisonField } from './comparison-panel';

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON PANEL - Utility functions
// ═══════════════════════════════════════════════════════════════════════════

/** Get a nested value from an object using dot notation */
export function getValue<T>(item: T, key: string): unknown {
  const keys = key.split('.');
  let value: unknown = item;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return value;
}

/** Check if all values in an array are equal (via JSON comparison) */
export function areValuesEqual(values: unknown[]): boolean {
  if (values.length < 2) return true;
  const first = JSON.stringify(values[0]);
  return values.every(v => JSON.stringify(v) === first);
}

/** Format a value for display in the comparison panel */
export function formatValue(value: unknown): ReactNode {
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

// ─── Plain-text formatting for clipboard copy ───

/** Format a single value as plain text */
function formatValueAsText(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '+' : '−';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.map(String).join(', ');
  }
  return String(value);
}

/**
 * Format an entire comparison as a human-readable plain text table.
 * Used by the "Copy comparison" button.
 */
export function formatComparisonAsText<T extends { id: string | number }>(
  items: T[],
  config: ComparisonConfig<T>,
): string {
  const lines: string[] = [];

  // Header with item titles
  const titles = items.map(item => String(getValue(item, String(config.titleField)) ?? ''));
  lines.push(`--- ${titles.join(' | ')} ---`);
  lines.push('');

  // Group fields by category
  const groups = new Map<string, ComparisonField<T>[]>();
  for (const field of config.fields) {
    const category = field.category || 'general';
    const existing = groups.get(category) || [];
    groups.set(category, [...existing, field]);
  }

  for (const [category, fields] of groups.entries()) {
    if (category !== 'general') {
      lines.push(`[${category.toUpperCase()}]`);
    }

    for (const field of fields) {
      const values = items.map(item => formatValueAsText(getValue(item, String(field.key))));
      const isDifferent = !areValuesEqual(items.map(item => getValue(item, String(field.key))));
      const marker = isDifferent ? '≠' : '=';
      lines.push(`  ${field.label} ${marker} ${values.join(' | ')}`);
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}
