import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// DISTRIBUTION BAR — Animated proportional bar with N segments
// ═══════════════════════════════════════════════════════════════════════════

export interface DistributionSegment {
  key: string;
  count: number;
  percentage: number;
  /** Tailwind bg classes for the segment fill */
  className: string;
  /** Tailwind text classes for the inline label */
  labelClassName: string;
  /** Minimum percentage to show inline label (default 15) */
  minPercentForLabel?: number;
}

interface DistributionBarProps {
  segments: DistributionSegment[];
  /** CSS width value (default '180px') */
  width?: string;
}

export function DistributionBar({ segments, width = '180px' }: DistributionBarProps) {
  return (
    <div
      className="flex h-5 rounded-md overflow-hidden ring-1 ring-inset ring-border/30"
      style={{ width }}
    >
      {segments
        .filter((s) => s.count > 0)
        .map((segment, i) => {
          const minPct = segment.minPercentForLabel ?? 15;
          return (
            <motion.div
              key={segment.key}
              initial={{ width: 0 }}
              animate={{ width: `${segment.percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
              className={`h-full flex items-center justify-center ${segment.className}`}
            >
              {segment.percentage > minPct && (
                <span className={`text-[9px] font-bold tabular-nums ${segment.labelClassName}`}>
                  {segment.percentage}%
                </span>
              )}
            </motion.div>
          );
        })}
    </div>
  );
}
