'use client';

import { type MouseEvent } from 'react';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// SELECTION CHECKBOX - Reusable checkbox for multi-selection
// ═══════════════════════════════════════════════════════════════════════════

interface SelectionCheckboxProps {
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: (e: MouseEvent) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SelectionCheckbox({ 
  isSelected, 
  isDisabled, 
  onClick,
  size = 'md',
  className,
}: SelectionCheckboxProps) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled && !isSelected}
      className={cn(
        sizeClasses,
        'rounded-md border-2 transition-all duration-200',
        'flex items-center justify-center',
        isSelected
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-[color-mix(in_srgb,var(--color-background)_80%,transparent)] backdrop-blur-sm border-border hover:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]',
        isDisabled && !isSelected && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isSelected && <Check className={iconSize} strokeWidth={3} />}
    </button>
  );
}
