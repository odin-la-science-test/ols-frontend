import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// SHARED IDENTIFICATION UI COMPONENTS
// Based on Bacteriology implementation (Source of Truth)
// ═══════════════════════════════════════════════════════════════════════════

export interface ToggleButtonProps {
  children: React.ReactNode;
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
        'inline-flex items-center justify-center rounded-md border font-medium transition-all',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        active
          ? variant === 'positive'
            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
            : variant === 'negative'
            ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
            : 'bg-primary/20 border-primary/40 text-primary'
          : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'
      )}
    >
      {active && <Check className="h-3 w-3 mr-1.5" />}
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
        'border',
        value === true
          ? 'bg-success/15 border-success/30 text-success'
          : value === false
          ? 'bg-muted/30 border-muted/50 text-muted-foreground'
          : 'bg-muted/20 border-transparent text-muted-foreground/70 hover:bg-muted/30'
      )}
    >
      <span>{label}</span>
      <span className="font-bold">
        {value === true ? '+' : value === false ? '−' : '?'}
      </span>
    </button>
  );
}
