'use client';


import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE GROUP - Segmented control for switching between options
// ═══════════════════════════════════════════════════════════════════════════

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'default';
  className?: string;
  /** Label accessible pour le groupe (requis pour l'accessibilite) */
  'aria-label': string;
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
  className,
  'aria-label': ariaLabel,
}: ToggleGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center rounded-lg bg-muted/50 p-1',
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative rounded-md font-medium transition-all duration-200',
            size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
