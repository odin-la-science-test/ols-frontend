import type { TFunction } from 'i18next';
import type { ColumnDef, FilterConfig, CardConfig } from '@/components/modules/types';
import type { Annotation, AnnotationColor } from './types';
import { Badge } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATIONS CONFIG - Module configuration for collection layout
// ═══════════════════════════════════════════════════════════════════════════

// ─── Color mapping ───

function getColorDotClass(color: AnnotationColor): string {
  switch (color) {
    case 'YELLOW': return 'bg-yellow-500';
    case 'GREEN': return 'bg-green-500';
    case 'BLUE': return 'bg-blue-500';
    case 'PINK': return 'bg-pink-500';
  }
}

function getColorLabel(color: AnnotationColor, t: TFunction): string {
  switch (color) {
    case 'YELLOW': return t('annotations.color.YELLOW');
    case 'GREEN': return t('annotations.color.GREEN');
    case 'BLUE': return t('annotations.color.BLUE');
    case 'PINK': return t('annotations.color.PINK');
  }
}

// ─── Table Columns ───

export function getAnnotationColumns(_data: Annotation[], t: TFunction): ColumnDef<Annotation>[] {
  return [
    {
      key: 'content',
      header: t('annotations.content'),
      sortable: true,
      render: (value) => {
        const text = value as string;
        const truncated = text.length > 80 ? `${text.slice(0, 80)}...` : text;
        return <span className="text-sm truncate">{truncated}</span>;
      },
    },
    {
      key: 'entityType',
      header: t('annotations.entityType'),
      sortable: true,
      width: '130px',
      render: (value) => (
        <Badge variant="outline" size="sm">
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'color',
      header: t('annotations.color'),
      width: '100px',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getColorDotClass(row.color)}`} />
          <span className="text-sm text-muted-foreground">
            {getColorLabel(row.color, t)}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('contacts.createdAt'),
      sortable: true,
      width: '110px',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value as string).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];
}

// ─── Filter Configuration ───

export function getAnnotationFilters(t: TFunction): FilterConfig[] {
  return [
    {
      key: 'color',
      label: t('annotations.color'),
      type: 'select',
      options: [
        { value: 'YELLOW', label: t('annotations.color.YELLOW') },
        { value: 'GREEN', label: t('annotations.color.GREEN') },
        { value: 'BLUE', label: t('annotations.color.BLUE') },
        { value: 'PINK', label: t('annotations.color.PINK') },
      ],
    },
  ];
}

// ─── Export Columns ───

export function getAnnotationExportColumns(
  _data: Annotation[],
  t: TFunction
): Array<{ key: keyof Annotation; header: string }> {
  return [
    { key: 'id', header: t('common.id') },
    { key: 'content', header: t('annotations.content') },
    { key: 'entityType', header: t('annotations.entityType') },
    { key: 'entityId', header: t('annotations.entityId') },
    { key: 'color', header: t('annotations.color') },
    { key: 'createdAt', header: t('contacts.createdAt') },
  ];
}

// ─── Card Configuration ───

export function getAnnotationCardConfig(t: TFunction): CardConfig<Annotation> {
  return {
    titleField: 'content',
    badges: [
      {
        key: 'color',
        render: (_value, row) => (
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getColorDotClass(row.color)}`} />
        ),
      },
    ],
    descriptionField: 'entityType',
    descriptionLabel: t('annotations.entityType'),
    infoFields: [
      {
        key: 'entityType',
        label: t('annotations.entityType'),
        render: (value) => {
          if (!value) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <Badge variant="outline" size="sm">
              {value as string}
            </Badge>
          );
        },
      },
    ],
  };
}
