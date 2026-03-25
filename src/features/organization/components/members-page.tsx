'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CollectionLayout } from '@/components/modules/layout/collection-layout';
import { useBreadcrumbStore } from '@/stores/breadcrumb-store';
import { useOrganizationMembers, useOrganizationDetail } from '../hooks';
import { getMemberColumns, getMemberCardConfig } from '../config';
import { MemberDetailPanel } from './member-detail';
import { MemberEditor } from './member-editor';
import type { OrganizationMembership } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// MEMBERS PAGE - Drill-down page listing members of a specific organization
// Uses CollectionLayout directly (not createCollectionPage) because orgId
// comes from route params
// ═══════════════════════════════════════════════════════════════════════════

export function MembersPage() {
  const { id } = useParams();
  const orgId = Number(id);
  const { t } = useTranslation();
  const { data: orgDetail } = useOrganizationDetail(orgId);
  const setLabel = useBreadcrumbStore((s) => s.setLabel);
  const removeLabel = useBreadcrumbStore((s) => s.removeLabel);

  // Register org name in breadcrumb store
  useEffect(() => {
    if (orgDetail?.name) {
      setLabel(`/lab/organization/${orgId}`, orgDetail.name);
    }
    return () => removeLabel(`/lab/organization/${orgId}`);
  }, [orgDetail?.name, orgId, setLabel, removeLabel]);

  const useData = useMemo(
    () => () => useOrganizationMembers(orgId),
    [orgId],
  );

  const title = orgDetail
    ? `${orgDetail.name} — ${t('organization.members')}`
    : t('organization.members');

  const translations = useMemo(() => ({
    title,
    searchPlaceholder: t('organization.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('organization.emptyTitle'),
    emptyDatabase: t('organization.noMembers'),
    searchNoResults: (query: string) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }), [t, title]);

  return (
    <CollectionLayout<OrganizationMembership>
      moduleKey="organization-members"
      title={title}
      icon="users"
      backTo="/lab/organization"
      useData={useData}
      columns={getMemberColumns}
      cardConfig={getMemberCardConfig}
      defaultSort={{ key: 'userFullName', direction: 'asc' }}
      translations={translations}
      renderDetail={({ item, onClose }) => (
        <MemberDetailPanel member={item} onClose={onClose} />
      )}
      renderEditor={({ onSaved, onCancel }) => (
        <MemberEditor orgId={orgId} onSaved={onSaved} onCancel={onCancel} />
      )}
      newItemConfig={{
        labelKey: 'organization.addMember',
        createTitle: 'organization.addMemberTitle',
      }}
    />
  );
}
