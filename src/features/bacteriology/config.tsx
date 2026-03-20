import type { TFunction } from 'i18next';
import { FlaskConical, Microscope } from 'lucide-react';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { Bacterium, GramStatus, BacterialMorphology } from './types';
import { Badge, BooleanBadge, TooltipHeader } from '@/components/modules/shared';
import { filterConfidenceColumn, addConfidenceExportColumn } from '@/components/modules/shared/column-helper';

// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY CONFIG - Module configuration
// ═══════════════════════════════════════════════════════════════════════════

// Module accent color — re-exported from centralized accent map
import { MUNIN_PRIMARY } from '@/lib/accent-colors';
export const BACTERIOLOGY_ACCENT = MUNIN_PRIMARY;

// ─── Labels & Translations ───
// These maps use non-translatable keys (enums) to return translatable keys/strings
// For DRY principle, we use translation keys directly in components

export const getGramLabels = (t: TFunction): Record<GramStatus, string> => ({
  POSITIVE: t('scientific.gramPositive'),
  NEGATIVE: t('scientific.gramNegative'),
});

export const getMorphoLabels = (t: TFunction): Record<BacterialMorphology, string> => ({
  COCCI: t('scientific.morphology.cocci'),
  BACILLI: t('scientific.morphology.bacilli'),
  SPIRAL: t('scientific.morphology.spiral'),
  COCCOBACILLI: t('scientific.morphology.coccobacilli'),
});

// ─── Table Columns ───
// Base columns function
const getBaseColumns = (t: TFunction): ColumnDef<Bacterium>[] => {
  const gramLabels = getGramLabels(t);
  const morphoLabels = getMorphoLabels(t);

  const columns: ColumnDef<Bacterium>[] = [
  {
    key: 'species',
    header: t('scientific.species'),
    sortable: true,
    render: (value, row) => (
      <div className="font-medium flex items-center min-w-0">
        <span className="italic truncate" title={value as string}>{value as string}</span>
        {row.strain && (
          <span className="ml-2 text-muted-foreground text-xs truncate shrink-0 max-w-[150px]" title={row.strain}>
            {row.strain}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'confidenceScore',
    header: t('bacteriology.confidence'),
    sortable: true,
    width: '90px',
    align: 'center',
    render: (_value, row) => {
      const score = row.confidenceScore;
      if (score === null || score === undefined) return null;
      
      // Color coding based on confidence level
      let variant: 'success' | 'warning' | 'secondary' = 'secondary';
      
      if (score >= 80) {
        variant = 'success';
      } else if (score >= 50) {
        variant = 'warning';
      }
      
      return (
        <Badge variant={variant} size="sm">
          {score}%
        </Badge>
      );
    },
  },
  {
    key: 'gram',
    header: t('scientific.gram'),
    sortable: true,
    width: '100px',
    render: (value) => {
      const gram = value as GramStatus;
      return (
        <Badge variant={gram === 'POSITIVE' ? 'gramPositive' : 'gramNegative'} size="sm">
          {gramLabels[gram]}
        </Badge>
      );
    },
  },
  {
    key: 'morpho',
    header: t('scientific.morphology.label'),
    sortable: true,
    width: '120px',
    render: (value) => {
      const morpho = value as BacterialMorphology;
      const variant = morpho === 'COCCI' ? 'coccus' : morpho === 'BACILLI' ? 'bacillus' : 'spirochete';
      return <Badge variant={variant} size="sm">{morphoLabels[morpho]}</Badge>;
    },
  },
  {
    key: 'catalase',
    header: <TooltipHeader shortLabel={t('bacteriology.catalaseShort')} fullLabel={t('bacteriology.catalase')} />,
    width: '60px',
    align: 'center',
    render: (value) => <BooleanBadge value={value as boolean | null} />,
  },
  {
    key: 'oxydase',
    header: <TooltipHeader shortLabel={t('bacteriology.oxydaseShort')} fullLabel={t('bacteriology.oxydase')} />,
    width: '60px',
    align: 'center',
    render: (value) => <BooleanBadge value={value as boolean | null} />,
  },
  {
    key: 'pathogenicity',
    header: t('scientific.pathogenicity'),
    width: '140px',
    render: (value) => {
      if (!value) return <span className="text-muted-foreground">—</span>;
      const isPathogenic = (value as string).toLowerCase().includes('pathog');
      return (
        <Badge variant={isPathogenic ? 'warning' : 'secondary'} size="sm">
          {value as string}
        </Badge>
      );
    },
  },
];

  return columns;
};

// ─── Filter Configuration ───
export const getBacteriaFilters = (t: TFunction): FilterConfig[] => [
  {
    key: 'gram',
    label: t('scientific.gram'),
    type: 'select',
    icon: FlaskConical,
    options: [
      { value: 'POSITIVE', label: t('scientific.gramPositive') },
      { value: 'NEGATIVE', label: t('scientific.gramNegative') },
    ],
  },
  {
    key: 'morphology',
    label: t('scientific.morphology.label'),
    type: 'select',
    icon: Microscope,
    options: [
      { value: 'COCCI', label: t('scientific.morphology.cocci') },
      { value: 'BACILLI', label: t('scientific.morphology.bacilli') },
      { value: 'SPIRAL', label: t('scientific.morphology.spiral') },
      { value: 'COCCOBACILLI', label: t('scientific.morphology.coccobacilli') },
    ],
  },
  {
    key: 'catalase',
    label: t('bacteriology.catalase'),
    type: 'boolean',
  },
  {
    key: 'oxydase',
    label: t('bacteriology.oxydase'),
    type: 'boolean',
  },
];

// ─── Stats Computation ───
export function computeBacteriaStats(data: Bacterium[], t: TFunction): StatItem[] {
  const total = data.length;
  const gramPositive = data.filter((b) => b.gram === 'POSITIVE').length;
  const gramNegative = data.filter((b) => b.gram === 'NEGATIVE').length;
  const withResistance = data.filter((b) => b.resistanceGenes && b.resistanceGenes.length > 0).length;

  return [
    {
      label: t('common.total'),
      value: total,
    },
    {
      label: t('scientific.gramPositive'),
      value: gramPositive,
      color: 'default',
    },
    {
      label: t('scientific.gramNegative'),
      value: gramNegative,
      color: 'default',
    },
    {
      label: t('bacteriology.resistance'),
      value: withResistance,
      color: withResistance > 0 ? 'warning' : 'default',
    },
  ];
}

// Export default columns
export const bacteriaColumns = getBaseColumns;

// Get columns with or without confidence score based on data
export function getBacteriaColumns(data: Bacterium[], t: TFunction): ColumnDef<Bacterium>[] {
  return filterConfidenceColumn(getBaseColumns(t), data);
}

// ─── Export Configuration ───
export function getBacteriaExportColumns(
  data: Bacterium[],
  t: TFunction
): Array<{ key: keyof Bacterium; header: string }> {
  const baseColumns: Array<{ key: keyof Bacterium; header: string }> = [
    { key: 'id', header: t('common.id') },
    { key: 'species', header: t('scientific.species') },
    { key: 'strain', header: t('scientific.strain') },
    { key: 'gram', header: t('scientific.gram') },
    { key: 'morpho', header: t('scientific.morphology.label') },
    { key: 'catalase', header: t('bacteriology.catalase') },
    { key: 'oxydase', header: t('bacteriology.oxydase') },
    { key: 'coagulase', header: t('bacteriology.coagulase') },
    { key: 'lactose', header: t('bacteriology.lactose') },
    { key: 'indole', header: t('bacteriology.indole') },
    { key: 'mannitol', header: t('bacteriology.mannitol') },
    { key: 'mobilite', header: t('bacteriology.mobility') },
    { key: 'hemolyse', header: t('scientific.hemolysis') },
    { key: 'pathogenicity', header: t('scientific.pathogenicity') },
    { key: 'habitat', header: t('scientific.habitat') },
    { key: 'genomeSize', header: t('scientific.genomeSize') },
    { key: 'mlst', header: t('scientific.mlst') },
    { key: 'maldiProfile', header: t('scientific.maldiProfile') },
    { key: 'apiCodes', header: t('scientific.apiCode') },
  ];

  return addConfidenceExportColumn(baseColumns, data);
}

// ─── Card Configuration ───
export function getBacteriaCardConfig(t: TFunction): CardConfig<Bacterium> {
  const gramLabels = getGramLabels(t);
  const morphoLabels = getMorphoLabels(t);

  return {
    titleField: 'species',
    subtitleField: 'strain',
    badges: [
      {
        key: 'gram',
        label: t('scientific.gram'),
        render: (value) => {
          const gram = value as GramStatus;
          if (!gram) return null;
          return (
            <Badge variant={gram === 'POSITIVE' ? 'gramPositive' : 'gramNegative'} size="sm">
              {gramLabels[gram]}
            </Badge>
          );
        },
      },
      {
        key: 'morpho',
        label: t('scientific.morphology.label'),
        render: (value) => {
          const morpho = value as BacterialMorphology;
          if (!morpho) return null;
          const variant = morpho === 'COCCI' ? 'coccus' : morpho === 'BACILLI' ? 'bacillus' : 'spirochete';
          return <Badge variant={variant} size="sm">{morphoLabels[morpho]}</Badge>;
        },
      },
      {
        key: 'pathogenicity',
        label: t('scientific.pathogenicity'),
        render: (value) => {
          if (!value) return null;
          const isPathogenic = (value as string).toLowerCase().includes('pathog');
          return (
            <Badge variant={isPathogenic ? 'warning' : 'secondary'} size="sm">
              {value as string}
            </Badge>
          );
        },
      },
    ],
    descriptionField: 'habitat',
    descriptionLabel: t('scientific.habitat'),
    infoFields: [
      {
        key: 'catalase',
        label: 'Cat.',
        fullLabel: t('bacteriology.catalase'),
        render: (value) => <BooleanBadge value={value as boolean | null} />,
      },
      {
        key: 'oxydase',
        label: 'Oxy.',
        fullLabel: t('bacteriology.oxydase'),
        render: (value) => <BooleanBadge value={value as boolean | null} />,
      },
      {
        key: 'genomeSize',
        label: 'Génome',
        fullLabel: t('scientific.genomeSize'),
        render: (value) => value ? `${(value as number).toFixed(1)} Mb` : '—',
      },
    ],
  };
}

