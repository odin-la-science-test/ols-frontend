import type { TFunction } from 'i18next';
import { Package } from 'lucide-react';
import type { ColumnDef, CardConfig } from '@/components/modules/types';
import type { StudyCollection } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTIONS CONFIG - Module configuration for collection layout
// ═══════════════════════════════════════════════════════════════════════════

// ─── Table Columns ───

export function getCollectionColumns(_data: StudyCollection[], t: TFunction): ColumnDef<StudyCollection>[] {
  return [
    {
      key: 'name',
      header: t('studyCollections.name'),
      sortable: true,
      render: (value) => (
        <span className="font-medium truncate">{value as string}</span>
      ),
    },
    {
      key: 'description',
      header: t('studyCollections.description'),
      render: (value) => {
        const text = value as string;
        if (!text) return <span className="text-muted-foreground">—</span>;
        const truncated = text.length > 80 ? text.slice(0, 80) + '...' : text;
        return <span className="text-sm truncate">{truncated}</span>;
      },
    },
    {
      key: 'items',
      header: t('studyCollections.items'),
      width: '100px',
      render: (value) => {
        const items = value as StudyCollection['items'];
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{items.length}</span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('studyCollections.addedAt'),
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

// ─── Card Configuration ───

export function getCollectionCardConfig(t: TFunction): CardConfig<StudyCollection> {
  return {
    titleField: 'name',
    descriptionField: 'description',
    descriptionLabel: t('studyCollections.description'),
    infoFields: [
      {
        key: 'items',
        label: t('studyCollections.items'),
        render: (value) => {
          const items = value as StudyCollection['items'];
          return (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="w-3 h-3 shrink-0" strokeWidth={1.5} />
              <span>{t('studyCollections.itemCount', { count: items.length })}</span>
            </div>
          );
        },
      },
    ],
  };
}

// ─── Export Columns ───

export function getCollectionExportColumns(
  _data: StudyCollection[],
  t: TFunction
): Array<{ key: keyof StudyCollection; header: string }> {
  return [
    { key: 'id', header: t('common.id') },
    { key: 'name', header: t('studyCollections.name') },
    { key: 'description', header: t('studyCollections.description') },
    { key: 'createdAt', header: t('studyCollections.addedAt') },
  ];
}
