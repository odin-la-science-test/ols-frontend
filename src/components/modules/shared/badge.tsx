'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// BADGE - Status and category badges
// ═══════════════════════════════════════════════════════════════════════════

const badgeVariants = cva(
  'inline-flex items-center rounded-md font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-900 ring-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 font-semibold',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 ring-secondary/30',
        success: 'bg-green-100 text-green-900 ring-green-300 dark:bg-green-500/25 dark:text-green-100 dark:ring-green-500/40 font-semibold',
        warning: 'bg-yellow-100 text-yellow-900 ring-yellow-300 dark:bg-yellow-500/25 dark:text-yellow-100 dark:ring-yellow-500/40 font-semibold',
        destructive: 'bg-red-100 text-red-900 ring-red-300 dark:bg-red-500/25 dark:text-red-100 dark:ring-red-500/40 font-semibold',
        outline: 'bg-transparent text-foreground ring-border',
        // Specific for Gram staining (Violet / Pink) - excellent contraste
        gramPositive: 'bg-violet-100 text-violet-900 ring-violet-300 dark:bg-violet-500/25 dark:text-violet-100 dark:ring-violet-500/40 font-semibold',
        gramNegative: 'bg-pink-100 text-pink-900 ring-pink-300 dark:bg-pink-500/25 dark:text-pink-100 dark:ring-pink-500/40 font-semibold',
        // Morphology (Blue / Green / Amber) - excellent contraste
        coccus: 'bg-blue-100 text-blue-900 ring-blue-300 dark:bg-blue-500/25 dark:text-blue-100 dark:ring-blue-500/40 font-semibold',
        bacillus: 'bg-emerald-100 text-emerald-900 ring-emerald-300 dark:bg-emerald-500/25 dark:text-emerald-100 dark:ring-emerald-500/40 font-semibold',
        spirochete: 'bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-500/25 dark:text-amber-100 dark:ring-amber-500/40 font-semibold',
        // Fungus types (Purple / Emerald / Cyan) - excellent contraste
        yeast: 'bg-purple-100 text-purple-900 ring-purple-300 dark:bg-purple-500/25 dark:text-purple-100 dark:ring-purple-500/40 font-semibold',
        mold: 'bg-teal-100 text-teal-900 ring-teal-300 dark:bg-teal-500/25 dark:text-teal-100 dark:ring-teal-500/40 font-semibold',
        filamentous: 'bg-sky-100 text-sky-900 ring-sky-300 dark:bg-sky-500/25 dark:text-sky-100 dark:ring-sky-500/40 font-semibold',
        // Molecule (Plasmid / Metabolite) - violet
        molecule: 'bg-violet-100 text-violet-900 ring-violet-300 dark:bg-violet-500/25 dark:text-violet-100 dark:ring-violet-500/40 font-semibold',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        default: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span 
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'destructive' && 'bg-destructive',
            (!variant || variant === 'default') && 'bg-primary',
          )} 
        />
      )}
      {children}
    </div>
  );
}

// ─── Boolean Badge (Oui/Non) ───
interface BooleanBadgeProps {
  value: boolean | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
  nullLabel?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function BooleanBadge({
  value,
  trueLabel = '+',
  falseLabel = '−',
  nullLabel = '?',
  size = 'sm', // Align with table badges by default
}: BooleanBadgeProps) {
  if (value === null || value === undefined) {
    return <Badge variant="outline" size={size}>{nullLabel}</Badge>;
  }
  return (
    <Badge variant={value ? 'success' : 'secondary'} size={size}>
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}
