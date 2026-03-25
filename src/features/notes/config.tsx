import type { TFunction } from 'i18next';
import { Pin, Tag } from 'lucide-react';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { Note, NoteColor } from './types';
import { noteColorLabel } from './types';
import { Badge } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// NOTES CONFIG - Module configuration for collection layout
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
  green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  yellow: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

// ─── Table Columns ───

export function getNoteColumns(_data: Note[], t: TFunction): ColumnDef<Note>[] {
  return [
    {
      key: 'title',
      header: t('notes.titleLabel'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2 min-w-0">
          {row.color && (
            <div className={`w-2 h-2 rounded-full shrink-0 bg-${row.color}-500`} />
          )}
          <span className="font-medium truncate">{value as string}</span>
          {row.pinned && (
            <Pin className="w-3 h-3 text-[var(--module-accent)] shrink-0" fill="currentColor" />
          )}
        </div>
      ),
    },
    {
      key: 'tags',
      header: t('notes.tags'),
      width: '200px',
      render: (value) => {
        const tags = value as string[];
        if (!tags?.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'color',
      header: t('notes.color'),
      width: '100px',
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">—</span>;
        const color = value as string;
        const classes = COLOR_CLASSES[color] || '';
        return (
          <Badge className={`text-[11px] border ${classes}`} size="sm">
            {noteColorLabel(color as NoteColor, t)}
          </Badge>
        );
      },
    },
    {
      key: 'updatedAt',
      header: t('notes.updatedAt'),
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

export function getNoteFilters(t: TFunction): FilterConfig[] {
  return [
    {
      key: 'pinned',
      label: t('notes.pinned'),
      type: 'boolean',
      icon: Pin,
    },
    {
      key: 'color',
      label: t('notes.color'),
      type: 'select',
      options: [
        { value: 'blue', label: t('notes.colors.blue') },
        { value: 'red', label: t('notes.colors.red') },
        { value: 'green', label: t('notes.colors.green') },
        { value: 'yellow', label: t('notes.colors.yellow') },
        { value: 'purple', label: t('notes.colors.purple') },
        { value: 'orange', label: t('notes.colors.orange') },
      ],
    },
  ];
}

// ─── Stats Computation ───

export function computeNoteStats(data: Note[], t: TFunction): StatItem[] {
  const total = data.length;
  const pinned = data.filter((n) => n.pinned).length;
  const withTags = data.filter((n) => n.tags.length > 0).length;

  return [
    { label: t('common.total'), value: total },
    { label: t('notes.pinned'), value: pinned },
    { label: t('notes.withTags'), value: withTags },
  ];
}

// ─── Export Columns ───

export function getNoteExportColumns(
  _data: Note[],
  t: TFunction
): Array<{ key: keyof Note; header: string }> {
  return [
    { key: 'id', header: t('common.id') },
    { key: 'title', header: t('notes.titleLabel') },
    { key: 'content', header: t('notes.content') },
    { key: 'color', header: t('notes.color') },
    { key: 'pinned', header: t('notes.pinned') },
    { key: 'tags', header: t('notes.tags') },
    { key: 'createdAt', header: t('notes.createdAt') },
    { key: 'updatedAt', header: t('notes.updatedAt') },
  ];
}

// ─── Card Configuration ───

export function getNoteCardConfig(t: TFunction): CardConfig<Note> {
  return {
    titleField: 'title',
    badges: [
      {
        key: 'pinned',
        render: (value) => {
          if (!value) return null;
          return (
            <Pin className="w-3 h-3 text-[var(--module-accent)]" fill="currentColor" />
          );
        },
      },
      {
        key: 'color',
        render: (value) => {
          if (!value) return null;
          const color = value as string;
          const classes = COLOR_CLASSES[color] || '';
          return (
            <Badge className={`text-[10px] border ${classes}`} size="sm">
              {noteColorLabel(color as NoteColor, t)}
            </Badge>
          );
        },
      },
    ],
    descriptionField: 'content',
    descriptionLabel: t('notes.content'),
    infoFields: [
      {
        key: 'tags',
        label: t('notes.tags'),
        render: (value) => {
          const tags = value as string[];
          if (!tags?.length) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{tags.length}</span>
            </div>
          );
        },
      },
      {
        key: 'updatedAt',
        label: t('notes.updatedAt'),
        render: (value) => (
          <span className="text-xs text-muted-foreground">
            {new Date(value as string).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
          </span>
        ),
      },
    ],
  };
}
