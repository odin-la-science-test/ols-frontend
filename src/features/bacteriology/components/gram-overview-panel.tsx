'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBacteria } from '../hooks';
import type { BacterialMorphology, BiochemKey } from '../types';
import { morphologyLabel, biochemKeyLabel } from '../types';
import {
  Badge,
  StatPill,
  BiochemBar,
  DistributionBar,
  OverviewSection,
  OverviewSeparator,
  pct,
} from '@/components/modules/shared';
import type { DistributionSegment } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// GRAM OVERVIEW PANEL — Contextual bottom panel tab for Bacteriology
//
// Renders a live summary of the loaded bacteria dataset:
//   • Gram +/− distribution ring
//   • Morphology breakdown
//   • Biochemical profile (% positive)
//   • Key clinical indicators
// ═══════════════════════════════════════════════════════════════════════════

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

    const biochemKeys: BiochemKey[] = ['catalase', 'oxydase', 'coagulase', 'lactose', 'indole', 'mannitol', 'mobilite'];
    const biochem = biochemKeys.map((key) => {
      const withData = bacteria.filter((b) => b[key] !== null && b[key] !== undefined);
      const positive = withData.filter((b) => b[key] === true).length;
      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1, 3),
        fullLabel: biochemKeyLabel(key, t),
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

  const gramSegments: DistributionSegment[] = [
    {
      key: 'gram-pos',
      count: gramPos,
      percentage: pct(gramPos, total),
      className: 'bg-violet-100 dark:bg-violet-500/25',
      labelClassName: 'text-violet-700 dark:text-violet-200',
    },
    {
      key: 'gram-neg',
      count: gramNeg,
      percentage: pct(gramNeg, total),
      className: 'bg-pink-100 dark:bg-pink-500/25',
      labelClassName: 'text-pink-700 dark:text-pink-200',
    },
  ];

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3">

        {/* ── Section 1: Gram distribution ── */}
        <OverviewSection title={t('bottomPanel.gramOverview.gramDistribution')} subtitle={`n=${total}`}>
          <DistributionBar segments={gramSegments} />

          {/* Gram legend */}
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
                    {morphologyLabel(morpho, t)} {count}
                  </Badge>
                );
              })}
          </div>
        </OverviewSection>

        <OverviewSeparator />

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

        <OverviewSeparator />

        {/* ── Section 3: Biochemical profile ── */}
        <OverviewSection title={t('bottomPanel.gramOverview.biochemProfile')}>
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
        </OverviewSection>
      </div>
    </div>
  );
}
