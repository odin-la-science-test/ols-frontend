import { Sprout, Microscope, FlaskConical, Flame } from 'lucide-react';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { Fungus, FungusType, FungusCategory } from './types';
import { Badge, BooleanBadge, TooltipHeader } from '@/components/modules/shared';
import type { TFunction } from 'i18next';
import { filterConfidenceColumn, addConfidenceExportColumn } from '@/components/modules/shared/column-helper';

// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY CONFIG - Module configuration
// ═══════════════════════════════════════════════════════════════════════════

// Module accent color — re-exported from centralized accent map
import { MUNIN_PRIMARY } from '@/lib/accent-colors';
export const MYCOLOGY_ACCENT = MUNIN_PRIMARY;

// ─── Labels & Translations ───
export const getFungusTypeLabels = (t: TFunction): Record<FungusType, string> => ({
  LEVURES: t('mycology.yeasts'),
  MOISISSURES: t('mycology.molds'),
  CHAMPIGNONS_FILAMENTEUX: t('mycology.filamentous'),
});

export const getFungusCategoryLabels = (t: TFunction): Record<FungusCategory, string> => ({
  PATHOGENES: t('mycology.pathogens'),
  COMESTIBLES: t('mycology.edible'),
  TOXIQUES: t('mycology.toxic'),
  MEDICINAUX: t('mycology.medicinal'),
  FERMENTATION: t('mycology.fermentation'),
  CULTURE: t('mycology.culture'),
  DIAGNOSTIC: t('mycology.diagnostic'),
});

// ─── Table Columns ───
// Base columns function
const getBaseColumns = (t: TFunction): ColumnDef<Fungus>[] => {
  const fungusTypeLabels = getFungusTypeLabels(t);
  const fungusCategoryLabels = getFungusCategoryLabels(t);

  const columns: ColumnDef<Fungus>[] = [
  {
    key: 'species',
    header: t('scientific.species'),
    sortable: true,
    render: (value) => (
      <div className="font-medium">
        <span className="italic">{value as string}</span>
      </div>
    ),
  },
  {
    key: 'type',
    header: t('scientific.type'),
    sortable: true,
    width: '130px',
    render: (value) => {
      const type = value as FungusType;
      if (!type) return null;
      const variant = 
        type === 'LEVURES' ? 'yeast' : 
        type === 'MOISISSURES' ? 'mold' : 
        'filamentous';
      return <Badge variant={variant} size="sm">{fungusTypeLabels[type]}</Badge>;
    },
  },
  {
    key: 'category',
    header: t('scientific.category'),
    sortable: true,
    width: '120px',
    render: (value) => {
      const category = value as FungusCategory;
      if (!category) return null;
      const variant = 
        category === 'PATHOGENES' ? 'destructive' :
        category === 'TOXIQUES' ? 'destructive' :
        category === 'MEDICINAUX' ? 'success' :
        category === 'COMESTIBLES' ? 'success' :
        'secondary';
      return <Badge variant={variant} size="sm">{fungusCategoryLabels[category]}</Badge>;
    },
  },
  {
    key: 'aerobic',
    header: <TooltipHeader shortLabel={t('mycology.aerobicShort')} fullLabel={t('mycology.aerobic')} />,
    width: '60px',
    align: 'center',
    render: (value) => <BooleanBadge value={value as boolean | null} />,
  },
  {
    key: 'dimorphic',
    header: <TooltipHeader shortLabel={t('mycology.dimorphicShort')} fullLabel={t('mycology.dimorphic')} />,
    width: '60px',
    align: 'center',
    render: (value) => <BooleanBadge value={value as boolean | null} />,
  },
  {
    key: 'encapsulated',
    header: <TooltipHeader shortLabel={t('mycology.encapsulatedShort')} fullLabel={t('mycology.encapsulated')} />,
    width: '60px',
    align: 'center',
    render: (value) => <BooleanBadge value={value as boolean | null} />,
  },
  {
    key: 'melaninProducer',
    header: <TooltipHeader shortLabel={t('mycology.melaninShort')} fullLabel={t('mycology.melaninProducer')} />,
    width: '60px',
    align: 'center',
    render: (value) => <BooleanBadge value={value as boolean | null} />,
  },
  {
    key: 'pathogenicity',
    header: t('scientific.pathogenicity'),
    sortable: true,
    render: (value) => {
      if (!value) return <span className="text-muted-foreground">—</span>;
      return <span className="text-sm">{value as string}</span>;
    },
  },
];

  return columns;
};

// ─── Filter Configuration ───
export const getFungiFilters = (t: TFunction): FilterConfig[] => [
  {
    key: 'type',
    label: t('scientific.type'),
    type: 'select',
    icon: Sprout,
    options: [
      { value: 'LEVURES', label: t('mycology.yeasts') },
      { value: 'MOISISSURES', label: t('mycology.molds') },
      { value: 'CHAMPIGNONS_FILAMENTEUX', label: t('mycology.filamentous') },
    ],
  },
  {
    key: 'category',
    label: t('scientific.category'),
    type: 'select',
    icon: Flame,
    options: [
      { value: 'PATHOGENES', label: t('mycology.pathogens') },
      { value: 'COMESTIBLES', label: t('mycology.edible') },
      { value: 'TOXIQUES', label: t('mycology.toxic') },
      { value: 'MEDICINAUX', label: t('mycology.medicinal') },
    ],
  },
  {
    key: 'aerobic',
    label: t('mycology.aerobic'),
    type: 'boolean',
  },
  {
    key: 'dimorphic',
    label: t('mycology.dimorphic'),
    type: 'boolean',
  },
  {
    key: 'encapsulated',
    label: t('mycology.encapsulated'),
    type: 'boolean',
  },
  {
    key: 'melaninProducer',
    label: t('mycology.melaninProducer'),
    type: 'boolean',
  },
];

// ─── Stats Computation ───
export function computeFungiStats(fungi: Fungus[], t: TFunction): StatItem[] {
  const total = fungi.length;
  
  const byType = fungi.reduce((acc, f) => {
    if (f.type) acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pathogenic = fungi.filter((f) => f.category === 'PATHOGENES').length;

  return [
    {
      label: t('common.total'),
      value: total,
      icon: Sprout,
    },
    {
      label: t('mycology.yeasts'),
      value: byType['LEVURES'] || 0,
      icon: Microscope,
    },
    {
      label: t('mycology.molds'),
      value: byType['MOISISSURES'] || 0,
      icon: FlaskConical,
    },
    {
      label: t('mycology.pathogens'),
      value: pathogenic,
      icon: Flame,
    },
  ];
}

// Get columns with or without confidence score based on data
export function getFungiColumns(data: Fungus[], t: TFunction): ColumnDef<Fungus>[] {
  return filterConfidenceColumn(getBaseColumns(t), data);
}

// ─── Export Configuration ───
export function getFungiExportColumns(
  data: Fungus[],
  t: TFunction
): Array<{ key: keyof Fungus; header: string }> {
  const baseColumns: Array<{ key: keyof Fungus; header: string }> = [
    { key: 'id', header: t('common.id') },
    { key: 'species', header: t('scientific.species') },
    { key: 'type', header: t('scientific.type') },
    { key: 'category', header: t('scientific.category') },
    { key: 'morphology', header: t('scientific.morphology.label') },
    { key: 'aerobic', header: t('mycology.aerobic') },
    { key: 'dimorphic', header: t('mycology.dimorphic') },
    { key: 'encapsulated', header: t('mycology.encapsulated') },
    { key: 'melaninProducer', header: t('mycology.melaninProducer') },
    { key: 'pathogenicity', header: t('scientific.pathogenicity') },
    { key: 'habitat', header: t('scientific.habitat') },
    { key: 'optimalTemperature', header: t('scientific.optimalTemperature') },
    { key: 'maximalTemperature', header: t('scientific.maximalTemperature') },
    { key: 'cultureMedium', header: t('scientific.cultureMedium') },
    { key: 'reproduction', header: t('scientific.reproduction') },
    { key: 'metabolism', header: t('scientific.metabolism') },
    { key: 'applications', header: t('scientific.applications') },
    { key: 'apiCodes', header: t('scientific.apiCode') },
    { key: 'description', header: t('common.description') },
  ];

  return addConfidenceExportColumn(baseColumns, data);
}

// ─── Card Configuration ───
export function getFungiCardConfig(t: TFunction): CardConfig<Fungus> {
  const fungusTypeLabels = getFungusTypeLabels(t);
  const fungusCategoryLabels = getFungusCategoryLabels(t);

  return {
    titleField: 'species',
    badges: [
      {
        key: 'type',
        label: t('scientific.type'),
        render: (value) => {
          const type = value as FungusType;
          if (!type) return null;
          const variant = 
            type === 'LEVURES' ? 'yeast' : 
            type === 'MOISISSURES' ? 'mold' : 
            'filamentous';
          return <Badge variant={variant} size="sm">{fungusTypeLabels[type]}</Badge>;
        },
      },
      {
        key: 'category',
        label: t('scientific.category'),
        render: (value) => {
          const category = value as FungusCategory;
          if (!category) return null;
          const variant = 
            category === 'PATHOGENES' ? 'destructive' :
            category === 'TOXIQUES' ? 'destructive' :
            category === 'MEDICINAUX' ? 'success' :
            category === 'COMESTIBLES' ? 'success' :
            'secondary';
          return <Badge variant={variant} size="sm">{fungusCategoryLabels[category]}</Badge>;
        },
      },
    ],
    descriptionField: 'description',
    descriptionLabel: t('common.description'),
    infoFields: [
      {
        key: 'aerobic',
        label: 'Aér.',
        fullLabel: t('mycology.aerobic'),
        render: (value) => <BooleanBadge value={value as boolean | null} />,
      },
      {
        key: 'dimorphic',
        label: 'Dim.',
        fullLabel: t('mycology.dimorphic'),
        render: (value) => <BooleanBadge value={value as boolean | null} />,
      },
      {
        key: 'optimalTemperature',
        label: '°C opt.',
        fullLabel: t('scientific.optimalTemperature'),
        render: (value) => value ? `${value}°C` : '—',
      },
    ],
  };
}
