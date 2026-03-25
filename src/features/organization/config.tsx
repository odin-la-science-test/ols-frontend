import type { TFunction } from 'i18next';
import { Users } from 'lucide-react';
import type { ColumnDef, CardConfig } from '@/components/modules/types';
import type { Organization, OrganizationType, OrganizationMembership, OrganizationRole, MembershipStatus } from './types';
import { Badge } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION CONFIG - Module configuration for collection layout
// ═══════════════════════════════════════════════════════════════════════════

function getOrgTypeLabel(type: OrganizationType, t: TFunction): string {
  switch (type) {
    case 'LABORATORY': return t('organization.types.laboratory');
    case 'UNIVERSITY': return t('organization.types.university');
    case 'COMPANY': return t('organization.types.company');
    case 'HOSPITAL': return t('organization.types.hospital');
    case 'RESEARCH_CENTER': return t('organization.types.researchCenter');
    case 'OTHER': return t('organization.types.other');
    default: return type;
  }
}

export function getRoleLabel(role: OrganizationRole, t: TFunction): string {
  switch (role) {
    case 'OWNER': return t('organization.roles.owner');
    case 'MANAGER': return t('organization.roles.manager');
    case 'MEMBER': return t('organization.roles.member');
    case 'INTERN': return t('organization.roles.intern');
    default: return role;
  }
}

function getStatusLabel(status: MembershipStatus, t: TFunction): string {
  switch (status) {
    case 'ACTIVE': return t('organization.statuses.active');
    case 'INVITED': return t('organization.statuses.invited');
    case 'SUSPENDED': return t('organization.statuses.suspended');
    default: return status;
  }
}

function getStatusVariant(status: MembershipStatus): 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'INVITED': return 'warning';
    case 'SUSPENDED': return 'destructive';
    default: return 'warning';
  }
}

export function getMemberColumns(_data: OrganizationMembership[], t: TFunction): ColumnDef<OrganizationMembership>[] {
  return [
    {
      key: 'userFullName',
      header: t('organization.memberEmail'),
      sortable: true,
      render: (_value, row) => (
        <span className="font-medium truncate">{row.userFullName || row.userEmail}</span>
      ),
    },
    {
      key: 'role',
      header: t('organization.role'),
      sortable: true,
      width: '140px',
      render: (value) => (
        <Badge variant="outline">{getRoleLabel(value as OrganizationRole, t)}</Badge>
      ),
    },
    {
      key: 'status',
      header: t('organization.status'),
      sortable: true,
      width: '120px',
      render: (value) => (
        <Badge variant={getStatusVariant(value as MembershipStatus)}>
          {getStatusLabel(value as MembershipStatus, t)}
        </Badge>
      ),
    },
    {
      key: 'joinedAt',
      header: t('organization.joinedAt'),
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

// ─── Card Configurations ───

export function getOrganizationCardConfig(t: TFunction): CardConfig<Organization> {
  return {
    titleField: 'name',
    badges: [
      {
        key: 'type',
        render: (value) => (
          <Badge variant="outline" size="sm">{getOrgTypeLabel(value as OrganizationType, t)}</Badge>
        ),
      },
    ],
    descriptionField: 'description',
    infoFields: [
      {
        key: 'memberCount',
        label: t('organization.members'),
        render: (value) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{value as number}</span>
          </div>
        ),
      },
      {
        key: 'createdByName',
        label: t('organization.createdBy'),
      },
    ],
  };
}

export function getMemberCardConfig(t: TFunction): CardConfig<OrganizationMembership> {
  return {
    titleField: 'userFullName',
    subtitleField: 'userEmail',
    badges: [
      {
        key: 'role',
        render: (value) => (
          <Badge variant="outline" size="sm">{getRoleLabel(value as OrganizationRole, t)}</Badge>
        ),
      },
      {
        key: 'status',
        render: (value) => (
          <Badge variant={getStatusVariant(value as MembershipStatus)} size="sm">
            {getStatusLabel(value as MembershipStatus, t)}
          </Badge>
        ),
      },
    ],
  };
}

// ─── Table Columns ───

export function getOrganizationColumns(_data: Organization[], t: TFunction): ColumnDef<Organization>[] {
  return [
    {
      key: 'name',
      header: t('organization.name'),
      sortable: true,
      render: (_value, row) => (
        <span className="font-medium truncate">{row.name}</span>
      ),
    },
    {
      key: 'type',
      header: t('organization.type'),
      sortable: true,
      width: '160px',
      render: (value) => (
        <Badge variant="outline">{getOrgTypeLabel(value as OrganizationType, t)}</Badge>
      ),
    },
    {
      key: 'memberCount',
      header: t('organization.members'),
      sortable: true,
      width: '120px',
      render: (value) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{value as number}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('organization.createdAt'),
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
