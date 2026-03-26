import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW SECTION — Layout helpers for bottom panel overview tabs
// ═══════════════════════════════════════════════════════════════════════════

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Compute rounded percentage, safe for zero total. */
export function pct(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// ─── OverviewSection ──────────────────────────────────────────────────────

interface OverviewSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function OverviewSection({ title, subtitle, children }: OverviewSectionProps) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] tabular-nums text-muted-foreground/60">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── OverviewSeparator ────────────────────────────────────────────────────

export function OverviewSeparator() {
  return <div className="hidden sm:block w-px self-stretch bg-border/40" />;
}
