'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFungi } from '../hooks';
import type { FungusType, FungusCategory } from '../types';
import { getFungusTypeLabels, getFungusCategoryLabels } from '../config';
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
// FUNGUS OVERVIEW PANEL — Contextual bottom panel tab for Mycology
//
// Renders a live summary of the loaded fungi dataset:
//   • Type distribution (Levures / Moisissures / Filamenteux)
//   • Category breakdown
//   • Boolean characteristics (aerobic, dimorphic, etc.)
//   • Clinical indicators (hosts, toxins, allergens)
//   • Biochemical profile (metabolites, enzymes, substrates)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Segment colors per FungusType ───────────────────────────────────────

const TYPE_SEGMENTS: Record<FungusType, { className: string; labelClassName: string }> = {
  LEVURES: {
    className: 'bg-purple-100 dark:bg-purple-500/25',
    labelClassName: 'text-purple-700 dark:text-purple-200',
  },
  MOISISSURES: {
    className: 'bg-teal-100 dark:bg-teal-500/25',
    labelClassName: 'text-teal-700 dark:text-teal-200',
  },
  CHAMPIGNONS_FILAMENTEUX: {
    className: 'bg-sky-100 dark:bg-sky-500/25',
    labelClassName: 'text-sky-700 dark:text-sky-200',
  },
};

const CATEGORY_VARIANT: Record<FungusCategory, 'destructive' | 'success' | 'secondary'> = {
  PATHOGENES: 'destructive',
  TOXIQUES: 'destructive',
  MEDICINAUX: 'success',
  COMESTIBLES: 'success',
  FERMENTATION: 'secondary',
  CULTURE: 'secondary',
  DIAGNOSTIC: 'secondary',
};

export function FungusOverviewPanel() {
  const { t } = useTranslation();
  const { data: fungi = [], isLoading } = useFungi();

  const stats = useMemo(() => {
    if (fungi.length === 0) return null;

    const total = fungi.length;

    // Type distribution
    const typeCounts: Record<FungusType, number> = { LEVURES: 0, MOISISSURES: 0, CHAMPIGNONS_FILAMENTEUX: 0 };
    fungi.forEach((f) => { if (f.type) typeCounts[f.type]++; });

    // Category breakdown
    const categoryCounts = {} as Record<FungusCategory, number>;
    fungi.forEach((f) => {
      if (f.category) categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    });

    // Boolean characteristics
    const aerobic = fungi.filter((f) => f.aerobic === true).length;
    const dimorphic = fungi.filter((f) => f.dimorphic === true).length;
    const encapsulated = fungi.filter((f) => f.encapsulated === true).length;
    const melanin = fungi.filter((f) => f.melaninProducer === true).length;

    // Clinical
    const withHosts = fungi.filter((f) => f.hosts && f.hosts.length > 0).length;
    const withToxins = fungi.filter((f) => f.toxins).length;
    const withAllergens = fungi.filter((f) => f.allergens).length;

    // Biochemical (% having at least one entry)
    const withMetabolites = fungi.filter((f) => f.secondaryMetabolites && f.secondaryMetabolites.length > 0).length;
    const withEnzymes = fungi.filter((f) => f.enzymes && f.enzymes.length > 0).length;
    const withSubstrates = fungi.filter((f) => f.degradableSubstrates && f.degradableSubstrates.length > 0).length;

    return {
      total, typeCounts, categoryCounts,
      aerobic, dimorphic, encapsulated, melanin,
      withHosts, withToxins, withAllergens,
      biochemPcts: {
        metabolites: pct(withMetabolites, total),
        enzymes: pct(withEnzymes, total),
        substrates: pct(withSubstrates, total),
      },
    };
  }, [fungi]);

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
        {t('bottomPanel.fungusOverview.noData')}
      </div>
    );
  }

  const { total, typeCounts, categoryCounts, aerobic, dimorphic, encapsulated, melanin,
    withHosts, withToxins, withAllergens, biochemPcts } = stats;

  const typeLabels = getFungusTypeLabels(t);
  const categoryLabels = getFungusCategoryLabels(t);

  const typeSegments: DistributionSegment[] = (
    Object.entries(typeCounts) as [FungusType, number][]
  ).map(([type, count]) => ({
    key: type,
    count,
    percentage: pct(count, total),
    ...TYPE_SEGMENTS[type],
  }));

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-3">

        {/* ── Section 1: Type distribution ── */}
        <OverviewSection title={t('bottomPanel.fungusOverview.typeDistribution')} subtitle={`n=${total}`}>
          <DistributionBar segments={typeSegments} />

          {/* Type legend */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.entries(typeCounts) as [FungusType, number][])
              .filter(([, count]) => count > 0)
              .map(([type, count]) => {
                const variant = type === 'LEVURES' ? 'yeast' : type === 'MOISISSURES' ? 'mold' : 'filamentous';
                return (
                  <Badge key={type} variant={variant} size="sm">
                    {typeLabels[type]} {count}
                  </Badge>
                );
              })}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            {(Object.entries(categoryCounts) as [FungusCategory, number][])
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <Badge key={cat} variant={CATEGORY_VARIANT[cat]} size="sm">
                  {categoryLabels[cat]} {count}
                </Badge>
              ))}
          </div>
        </OverviewSection>

        <OverviewSeparator />

        {/* ── Section 2: Characteristics ── */}
        <OverviewSection title={t('bottomPanel.fungusOverview.characteristics')}>
          <div className="flex flex-wrap items-start gap-2">
            <StatPill label={t('mycology.aerobicShort')} value={aerobic} sub={`${pct(aerobic, total)}%`} />
            <StatPill
              label={t('mycology.dimorphicShort')}
              value={dimorphic}
              sub={`${pct(dimorphic, total)}%`}
              variant={dimorphic > 0 ? 'warning' : 'default'}
            />
            <StatPill
              label={t('mycology.encapsulatedShort')}
              value={encapsulated}
              sub={`${pct(encapsulated, total)}%`}
              variant={encapsulated > 0 ? 'destructive' : 'default'}
            />
            <StatPill label={t('mycology.melaninShort')} value={melanin} sub={`${pct(melanin, total)}%`} />
          </div>
        </OverviewSection>

        <OverviewSeparator />

        {/* ── Section 3: Clinical profile ── */}
        <OverviewSection title={t('bottomPanel.fungusOverview.clinicalProfile')}>
          <div className="flex flex-wrap items-start gap-2">
            <StatPill
              label={t('bottomPanel.fungusOverview.hosts')}
              value={withHosts}
              sub={`${pct(withHosts, total)}%`}
              variant={withHosts > 0 ? 'warning' : 'default'}
            />
            <StatPill
              label={t('bottomPanel.fungusOverview.toxins')}
              value={withToxins}
              sub={`${pct(withToxins, total)}%`}
              variant={withToxins > 0 ? 'destructive' : 'default'}
            />
            <StatPill
              label={t('bottomPanel.fungusOverview.allergens')}
              value={withAllergens}
              sub={`${pct(withAllergens, total)}%`}
              variant={withAllergens > 0 ? 'warning' : 'default'}
            />
          </div>
        </OverviewSection>

        <OverviewSeparator />

        {/* ── Section 4: Biochemical profile ── */}
        <OverviewSection title={t('bottomPanel.fungusOverview.biochemProfile')}>
          <div className="flex items-end gap-2">
            <BiochemBar
              label={t('bottomPanel.fungusOverview.metabolitesShort')}
              fullLabel={t('bottomPanel.fungusOverview.metabolites')}
              percentage={biochemPcts.metabolites}
            />
            <BiochemBar
              label={t('bottomPanel.fungusOverview.enzymesShort')}
              fullLabel={t('bottomPanel.fungusOverview.enzymes')}
              percentage={biochemPcts.enzymes}
            />
            <BiochemBar
              label={t('bottomPanel.fungusOverview.substratesShort')}
              fullLabel={t('bottomPanel.fungusOverview.substrates')}
              percentage={biochemPcts.substrates}
            />
          </div>
        </OverviewSection>
      </div>
    </div>
  );
}
