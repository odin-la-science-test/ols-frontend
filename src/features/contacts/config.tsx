import type { TFunction } from 'i18next';
import { Star, Mail, Phone } from 'lucide-react';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { Contact } from './types';
import { Badge } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS CONFIG - Module configuration for collection layout
// ═══════════════════════════════════════════════════════════════════════════

// ─── Table Columns ───

export function getContactColumns(_data: Contact[], t: TFunction): ColumnDef<Contact>[] {
  return [
    {
      key: 'firstName',
      header: t('contacts.name'),
      sortable: true,
      render: (_value, row) => {
        const name = [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email || '—';
        return (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate">{name}</span>
            {row.isAppUser && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--module-accent-subtle)] text-[var(--module-accent)] font-medium shrink-0">
                OLS
              </span>
            )}
            {row.favorite && (
              <Star className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" />
            )}
          </div>
        );
      },
    },
    {
      key: 'email',
      header: t('contacts.email'),
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm truncate">{value as string}</span>;
      },
    },
    {
      key: 'phone',
      header: t('contacts.phone'),
      width: '130px',
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm">{value as string}</span>;
      },
    },
    {
      key: 'organization',
      header: t('contacts.organization'),
      sortable: true,
      width: '150px',
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm truncate">{value as string}</span>;
      },
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

export function getContactFilters(t: TFunction): FilterConfig[] {
  return [
    {
      key: 'favorite',
      label: t('contacts.favorites'),
      type: 'boolean',
      icon: Star,
    },
    {
      key: 'isAppUser',
      label: t('contacts.olsUsers'),
      type: 'boolean',
    },
  ];
}

// ─── Stats Computation ───

export function computeContactStats(data: Contact[], t: TFunction): StatItem[] {
  const total = data.length;
  const favorites = data.filter((c) => c.favorite).length;
  const withOrg = data.filter((c) => c.organization).length;

  return [
    { label: t('common.total'), value: total },
    { label: t('contacts.favorites'), value: favorites },
    { label: t('contacts.withOrganization'), value: withOrg },
  ];
}

// ─── Export Columns ───

export function getContactExportColumns(
  _data: Contact[],
  t: TFunction
): Array<{ key: keyof Contact; header: string }> {
  return [
    { key: 'id', header: t('common.id') },
    { key: 'firstName', header: t('contacts.firstName') },
    { key: 'lastName', header: t('contacts.lastName') },
    { key: 'email', header: t('contacts.email') },
    { key: 'phone', header: t('contacts.phone') },
    { key: 'organization', header: t('contacts.organization') },
    { key: 'jobTitle', header: t('contacts.jobTitle') },
    { key: 'createdAt', header: t('contacts.createdAt') },
  ];
}

// ─── Card Configuration ───

export function getContactCardConfig(t: TFunction): CardConfig<Contact> {
  return {
    titleField: 'firstName',
    subtitleField: 'jobTitle',
    badges: [
      {
        key: 'favorite',
        render: (value) => {
          if (!value) return null;
          return (
            <Badge variant="secondary" size="sm" className="gap-1">
              <Star className="w-3 h-3 text-amber-500" fill="currentColor" />
            </Badge>
          );
        },
      },
      {
        key: 'isAppUser',
        render: (value) => {
          if (!value) return null;
          return (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--module-accent-subtle)] text-[var(--module-accent)] font-medium">
              OLS
            </span>
          );
        },
      },
    ],
    descriptionField: 'organization',
    descriptionLabel: t('contacts.organization'),
    infoFields: [
      {
        key: 'email',
        label: t('contacts.email'),
        render: (value) => {
          if (!value) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{value as string}</span>
            </div>
          );
        },
      },
      {
        key: 'phone',
        label: t('contacts.phone'),
        render: (value) => {
          if (!value) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 shrink-0" />
              <span>{value as string}</span>
            </div>
          );
        },
      },
    ],
  };
}
