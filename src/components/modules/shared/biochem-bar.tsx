import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// BIOCHEM BAR — Animated vertical bar with gradient color thresholds
// ═══════════════════════════════════════════════════════════════════════════

interface BiochemBarProps {
  label: string;
  fullLabel: string;
  percentage: number | null;
  /** Custom thresholds for color breakpoints (defaults: high=70, medium=40) */
  thresholds?: { high: number; medium: number };
}

function getBarColor(percentage: number | null, thresholds: { high: number; medium: number }): string {
  if (percentage === null) return 'bg-muted';
  if (percentage >= thresholds.high) {
    return 'bg-gradient-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500';
  }
  if (percentage >= thresholds.medium) {
    return 'bg-gradient-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500';
  }
  return 'bg-gradient-to-t from-rose-500 to-rose-400 dark:from-rose-600 dark:to-rose-500';
}

export function BiochemBar({ label, fullLabel, percentage, thresholds = { high: 70, medium: 40 } }: BiochemBarProps) {
  const barColor = getBarColor(percentage, thresholds);

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1 group">
          {/* Bar container */}
          <div className="relative w-6 h-8 rounded-md bg-muted/40 dark:bg-muted/20 overflow-hidden ring-1 ring-inset ring-border/20">
            {percentage !== null && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                className={cn('absolute bottom-0 inset-x-0 rounded-b-[3px]', barColor)}
              />
            )}
          </div>
          {/* Label */}
          <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-none">
            {label}
          </span>
          {/* Value */}
          <span className="text-[10px] tabular-nums text-muted-foreground/80 leading-none">
            {percentage !== null ? `${percentage}%` : '—'}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{`${fullLabel}: ${percentage ?? '—'}%`}</TooltipContent>
    </Tooltip>
  );
}
