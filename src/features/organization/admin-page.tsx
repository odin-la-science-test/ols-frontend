'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { useAllOrganizations, useSearchOrganizations } from './hooks';
import { getOrganizationColumns, getOrganizationCardConfig } from './config';
import { OrganizationDetailPanel } from './components/organization-detail';
import { OrganizationEditor } from './components/organization-editor';
import type { Organization } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ORGANIZATION PAGE - Dashboard for admins to manage organizations
// Click org → detail sidebar with info + "Manage members" button → drill-down
// ═══════════════════════════════════════════════════════════════════════════

export const AdminOrganizationPage = createCollectionPage<Organization>({
  moduleKey: 'admin-organization',
  iconName: 'building-2',
  backTo: '/lab',
  translations: (t) => ({
    title: t('adminOrganization.title'),
    searchPlaceholder: t('adminOrganization.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('adminOrganization.emptyTitle'),
    emptyDatabase: t('adminOrganization.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useAllOrganizations,
  useSearch: useSearchOrganizations,
  defaultSort: { key: 'name', direction: 'asc' },
  columns: getOrganizationColumns,
  cardConfig: getOrganizationCardConfig,
  renderDetail: ({ item }) => (
    <OrganizationDetailPanel organization={item} />
  ),
  renderEditor: ({ onSaved, onCancel, moduleKey }) => (
    <OrganizationEditor onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: {
    labelKey: 'adminOrganization.newOrganization',
    createTitle: 'adminOrganization.createTitle',
  },
});
