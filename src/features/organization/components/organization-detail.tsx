'use client';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Users, GitBranch, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow } from '@/components/modules/shared';
import type { Organization, OrganizationType } from '../types';
import { useOrganizationMembers, useSupervisions } from '../hooks';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION DETAIL PANEL - View details + navigate to members
// ═══════════════════════════════════════════════════════════════════════════

function getOrgTypeLabel(type: OrganizationType, t: (key: string) => string): string {
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

function getRoleLabel(role: string, t: (key: string) => string): string {
  switch (role) {
    case 'OWNER': return t('organization.roles.owner');
    case 'MANAGER': return t('organization.roles.manager');
    case 'MEMBER': return t('organization.roles.member');
    case 'INTERN': return t('organization.roles.intern');
    default: return role;
  }
}

export function OrganizationDetailPanel({ organization }: { organization: Organization }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: members } = useOrganizationMembers(organization.id);
  const { data: supervisions } = useSupervisions(organization.id);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <DetailPanelContent title={organization.name} icon={Building2}>
      {/* Informations */}
      <DetailSection title={t('organization.info')} icon={Building2}>
        <DetailRow label={t('organization.type')} value={getOrgTypeLabel(organization.type, t)} />
        {organization.description && (
          <DetailRow label={t('organization.description')} value={organization.description} />
        )}
        {organization.website && (
          <DetailRow label={t('organization.website')} value={organization.website} />
        )}
        <DetailRow label={t('organization.createdBy')} value={organization.createdByName} />
        <DetailRow label={t('organization.createdAt')} value={formatDate(organization.createdAt)} />
      </DetailSection>

      {/* Membres (aperçu + bouton drill-down) */}
      <DetailSection title={`${t('organization.members')} (${members?.length ?? 0})`} icon={Users}>
        {members && members.length > 0 ? (
          <div className="space-y-1.5">
            {members.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1">
                <span className="truncate">{m.userFullName || m.userEmail}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {getRoleLabel(m.role, t)}
                </span>
              </div>
            ))}
            {members.length > 5 && (
              <p className="text-xs text-muted-foreground">+{members.length - 5} {t('organization.members').toLowerCase()}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('organization.noMembers')}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 gap-2"
          onClick={() => navigate(`/lab/organization/${organization.id}`)}
        >
          <Users className="h-3.5 w-3.5" />
          {t('organization.manageMembers')}
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </Button>
      </DetailSection>

      {/* Supervisions */}
      <DetailSection title={`${t('organization.supervisions')} (${supervisions?.length ?? 0})`} icon={GitBranch}>
        {supervisions && supervisions.length > 0 ? (
          <div className="space-y-1.5">
            {supervisions.map((s) => (
              <div key={s.id} className="text-sm py-1">
                <span className="font-medium">{s.supervisorName}</span>
                <span className="text-muted-foreground mx-1.5">→</span>
                <span>{s.superviseeName}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('organization.noSupervisions')}</p>
        )}
      </DetailSection>
    </DetailPanelContent>
  );
}
