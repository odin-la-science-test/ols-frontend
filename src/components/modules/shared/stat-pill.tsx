import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// STAT PILL — Compact stat badge with label, value, and optional sub-text
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_MAP = {
  default: 'bg-slate-100 ring-slate-200/60 text-slate-700 dark:bg-slate-800/60 dark:ring-slate-700/40 dark:text-slate-200',
  warning: 'bg-yellow-50 ring-yellow-200/60 text-yellow-800 dark:bg-yellow-500/10 dark:ring-yellow-500/30 dark:text-yellow-200',
  destructive: 'bg-red-50 ring-red-200/60 text-red-800 dark:bg-red-500/10 dark:ring-red-500/30 dark:text-red-200',
  success: 'bg-emerald-50 ring-emerald-200/60 text-emerald-800 dark:bg-emerald-500/10 dark:ring-emerald-500/30 dark:text-emerald-200',
} as const;

interface StatPillProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: keyof typeof COLOR_MAP;
}

export function StatPill({ label, value, sub, variant = 'default' }: StatPillProps) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ring-1 ring-inset min-w-[64px]',
      COLOR_MAP[variant],
    )}>
      <span className="text-base font-bold tabular-nums leading-none">{value}</span>
      <span className="text-[10px] font-medium opacity-70 leading-tight text-center">{label}</span>
      {sub && <span className="text-[9px] tabular-nums opacity-50">{sub}</span>}
    </div>
  );
}
