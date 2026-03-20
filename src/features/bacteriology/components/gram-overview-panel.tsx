'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBacteria } from '../hooks';
import type { BacterialMorphology } from '../types';
import { Badge } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// GRAM OVERVIEW PANEL — Contextual bottom panel tab for Bacteriology
//
// Renders a live summary of the loaded bacteria dataset:
//   • Gram +/− distribution ring
//   • Morphology breakdown
//   • Biochemical profile (% positive)
//   • Key clinical indicators
//
// Uses the app's design system (Badge variants, motion, ring-inset)
// for a polished, integrated look.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Helpers ────────────────────────────────────────────────────────────

function pct(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// ─── Mini stat pill — matches app's ring-inset badge style ──────────────

function StatPill({ label, value, sub, variant = 'default' }: {
  label: string;
  value: string | number;
  sub?: string;
  variant?: 'default' | 'warning' | 'destructive';
}) {
  const colorMap = {
    default: 'bg-slate-100 ring-slate-200/60 text-slate-700 dark:bg-slate-800/60 dark:ring-slate-700/40 dark:text-slate-200',
    warning: 'bg-yellow-50 ring-yellow-200/60 text-yellow-800 dark:bg-yellow-500/10 dark:ring-yellow-500/30 dark:text-yellow-200',
    destructive: 'bg-red-50 ring-red-200/60 text-red-800 dark:bg-red-500/10 dark:ring-red-500/30 dark:text-red-200',
  };

  return (
    <div className={cn(
      'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ring-1 ring-inset min-w-[64px]',
      colorMap[variant],
    )}>
      <span className="text-base font-bold tabular-nums leading-none">{value}</span>
      <span className="text-[10px] font-medium opacity-70 leading-tight text-center">{label}</span>
      {sub && <span className="text-[9px] tabular-nums opacity-50">{sub}</span>}
    </div>
  );
}

// ─── Biochem bar with smooth gradient ───────────────────────────────────

function BiochemBar({ label, fullLabel, percentage }: {
  label: string;
  fullLabel: string;
  percentage: number | null;
}) {
  const barColor = percentage === null
    ? 'bg-muted'
    : percentage >= 70
      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500'
      : percentage >= 40
        ? 'bg-gradient-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500'
        : 'bg-gradient-to-t from-rose-500 to-rose-400 dark:from-rose-600 dark:to-rose-500';

  return (
    <div className="flex flex-col items-center gap-1 group" title={`${fullLabel}: ${percentage ?? '—'}%`}>
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
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export function GramOverviewPanel() {
  const { t } = useTranslation();
  const { data: bacteria = [], isLoading } = useBacteria();

  // ── Computed stats ──
  const stats = useMemo(() => {
    if (bacteria.length === 0) return null;

    const total = bacteria.length;
    const gramPos = bacteria.filter((b) => b.gram === 'POSITIVE').length;
    const gramNeg = bacteria.filter((b) => b.gram === 'NEGATIVE').length;

    const morphoCounts: Record<BacterialMorphology, number> = { COCCI: 0, BACILLI: 0, SPIRAL: 0, COCCOBACILLI: 0 };
    bacteria.forEach((b) => { if (b.morpho) morphoCounts[b.morpho]++; });

    const biochemKeys = ['catalase', 'oxydase', 'coagulase', 'lactose', 'indole', 'mannitol', 'mobilite'] as const;
    const biochem = biochemKeys.map((key) => {
      const withData = bacteria.filter((b) => b[key] !== null && b[key] !== undefined);
      const positive = withData.filter((b) => b[key] === true).length;
      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1, 3),
        fullLabel: t(`bacteriology.${key === 'mobilite' ? 'mobility' : key}`),
        pct: withData.length > 0 ? Math.round((positive / withData.length) * 100) : null,
      };
    });

    const withResistance = bacteria.filter((b) => b.resistanceGenes && b.resistanceGenes.length > 0).length;
    const hemoBeta = bacteria.filter((b) => b.hemolyse === 'BETA').length;
    const hemoAlpha = bacteria.filter((b) => b.hemolyse === 'ALPHA').length;
    const hemoGamma = bacteria.filter((b) => b.hemolyse === 'GAMMA').length;

    return { total, gramPos, gramNeg, morphoCounts, biochem, withResistance, hemoBeta, hemoAlpha, hemoGamma };
  }, [bacteria, t]);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          {t('common.loading')}
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground/60">
        {t('bottomPanel.gramOverview.noData')}
      </div>
    );
  }

  const { total, gramPos, gramNeg, morphoCounts, biochem, withResistance, hemoBeta, hemoAlpha, hemoGamma } = stats;
  const gramPosPct = pct(gramPos, total);
  const gramNegPct = pct(gramNeg, total);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="flex items-start gap-6 px-4 py-3">

        {/* ── Section 1: Gram distribution ── */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('bottomPanel.gramOverview.gramDistribution')}
            </span>
            <span className="text-[10px] tabular-nums text-muted-foreground/60">
              n={total}
            </span>
          </div>

          {/* Proportional bar */}
          <div className="flex h-5 rounded-md overflow-hidden ring-1 ring-inset ring-border/30" style={{ width: '180px' }}>
            {gramPos > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gramPosPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-violet-100 dark:bg-violet-500/25 flex items-center justify-center"
              >
                {gramPosPct > 15 && (
                  <span className="text-[9px] font-bold text-violet-700 dark:text-violet-200 tabular-nums">
                    {gramPosPct}%
                  </span>
                )}
              </motion.div>
            )}
            {gramNeg > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gramNegPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
                className="h-full bg-pink-100 dark:bg-pink-500/25 flex items-center justify-center"
              >
                {gramNegPct > 15 && (
                  <span className="text-[9px] font-bold text-pink-700 dark:text-pink-200 tabular-nums">
                    {gramNegPct}%
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Gram legend using app badges */}
          <div className="flex items-center gap-1.5">
            <Badge variant="gramPositive" size="sm">G+ {gramPos}</Badge>
            <Badge variant="gramNegative" size="sm">G− {gramNeg}</Badge>
          </div>

          {/* Morphology chips */}
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            {(Object.entries(morphoCounts) as [BacterialMorphology, number][])
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([morpho, count]) => {
                const variant = morpho === 'COCCI' ? 'coccus' : morpho === 'BACILLI' ? 'bacillus' : 'spirochete';
                return (
                  <Badge key={morpho} variant={variant} size="sm">
                    {t(`scientific.morphology.${morpho.toLowerCase()}`)} {count}
                  </Badge>
                );
              })}
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="hidden sm:block w-px self-stretch bg-border/40" />

        {/* ── Section 2: Clinical indicators ── */}
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('bottomPanel.gramOverview.clinicalIndicators')}
          </span>
          <div className="flex items-start gap-2">
            <StatPill
              label={t('bottomPanel.gramOverview.resistance')}
              value={withResistance}
              sub={`${pct(withResistance, total)}%`}
              variant={withResistance > 0 ? 'warning' : 'default'}
            />
            <StatPill
              label="β-hémo."
              value={hemoBeta}
              sub={hemoAlpha + hemoGamma > 0 ? `α${hemoAlpha} γ${hemoGamma}` : undefined}
              variant={hemoBeta > 0 ? 'destructive' : 'default'}
            />
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="hidden sm:block w-px self-stretch bg-border/40" />

        {/* ── Section 3: Biochemical profile ── */}
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('bottomPanel.gramOverview.biochemProfile')}
          </span>
          <div className="flex items-end gap-2">
            {biochem.map((stat) => (
              <BiochemBar
                key={stat.key}
                label={stat.label}
                fullLabel={stat.fullLabel}
                percentage={stat.pct}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
