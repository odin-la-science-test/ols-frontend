'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCollectionPage } from '@/lib/create-collection-page';
import { useMyOrganizations, useSearchOrganizations } from './hooks';
import { getOrganizationColumns, getOrganizationCardConfig } from './config';
import { OrganizationDetailPanel } from './components/organization-detail';
import type { Organization } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION PAGE - Hugin Lab organization module (user view)
// Auto-navigates to members if user has only one organization
// ═══════════════════════════════════════════════════════════════════════════

const OrganizationCollection = createCollectionPage<Organization>({
  moduleKey: 'organization',
  iconName: 'building-2',
  backTo: '/lab',
  translations: (t) => ({
    title: t('organization.title'),
    searchPlaceholder: t('organization.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('organization.emptyTitle'),
    emptyDatabase: t('organization.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyOrganizations,
  useSearch: useSearchOrganizations,
  defaultSort: { key: 'name', direction: 'asc' },
  columns: getOrganizationColumns,
  cardConfig: getOrganizationCardConfig,
  renderDetail: ({ item }) => (
    <OrganizationDetailPanel organization={item} />
  ),
});

export function OrganizationPage() {
  const navigate = useNavigate();
  const { data } = useMyOrganizations();

  useEffect(() => {
    if (data && data.length === 1) {
      navigate(`/lab/organization/${data[0].id}`, { replace: true });
    }
  }, [data, navigate]);

  return <OrganizationCollection />;
}
