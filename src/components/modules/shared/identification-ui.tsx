import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// SHARED IDENTIFICATION UI COMPONENTS
// Based on Bacteriology implementation (Source of Truth)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Segmented chip styles ───
// Defined as @utility in index.css: chip-base, chip-active, chip-inactive

export interface ToggleButtonProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'positive' | 'negative';
  size?: 'default' | 'sm';
}

export function ToggleButton({
  children,
  active,
  onClick,
  variant = 'default',
  size = 'default'
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'chip-base justify-center',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        active
          ? variant === 'positive'
            ? 'bg-violet-500 text-white shadow-sm'
            : variant === 'negative'
            ? 'bg-pink-500 text-white shadow-sm'
            : 'chip-active'
          : 'chip-inactive'
      )}
    >
      {children}
    </button>
  );
}

export interface BooleanToggleProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}

export function BooleanToggle({ label, value, onChange }: BooleanToggleProps) {
  const cycle = () => {
    if (value === undefined) onChange(true);
    else if (value === true) onChange(false);
    else onChange(undefined);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
        value === true
          ? 'bg-success text-white shadow-sm'
          : value === false
          ? 'bg-muted text-muted-foreground'
          : 'text-muted-foreground/70 hover:text-foreground'
      )}
    >
      <span>{label}</span>
      <span className="font-bold">
        {value === true ? '+' : value === false ? '−' : '?'}
      </span>
    </button>
  );
}
