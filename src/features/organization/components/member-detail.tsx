'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DetailPanelContent, DetailSection, DetailRow, Badge } from '@/components/modules/shared';
import { toast } from '@/hooks';
import { ORGANIZATION_ROLES } from '@/api/generated/enum-values';
import { useUpdateMemberRole, useRemoveMember } from '../hooks';
import { getRoleLabel } from '../config';
import type { OrganizationMembership, OrganizationRole, MembershipStatus } from '../types';
import { MemberSupervisions } from './member-supervisions';

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER DETAIL PANEL - View and manage a single organization member
// ═══════════════════════════════════════════════════════════════════════════

interface MemberDetailPanelProps {
  member: OrganizationMembership;
  onClose: () => void;
}

function getStatusLabel(status: MembershipStatus, t: (key: string) => string): string {
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

export function MemberDetailPanel({ member, onClose }: MemberDetailPanelProps) {
  const { t } = useTranslation();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRoleChange = async (newRole: string) => {
    try {
      await updateRole.mutateAsync({
        orgId: member.organizationId,
        membershipId: member.id,
        data: { role: newRole as OrganizationRole },
      });
      toast({ title: t('organization.memberRoleChanged') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleRemove = async () => {
    try {
      await removeMember.mutateAsync({
        orgId: member.organizationId,
        membershipId: member.id,
      });
      toast({ title: t('organization.memberRemoved') });
      onClose();
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const name = member.userFullName || member.userEmail;

  return (
    <DetailPanelContent
      title={name}
      badge={
        <Badge variant={getStatusVariant(member.status)}>
          {getStatusLabel(member.status, t)}
        </Badge>
      }
    >
      <div className="space-y-6">
        <DetailSection title={t('organization.members')} icon={User}>
          <DetailRow label={t('organization.email')} value={member.userEmail} copyable />
          {member.userFullName && (
            <DetailRow label={t('contacts.name')} value={member.userFullName} />
          )}
          <DetailRow label={t('organization.role')} value={getRoleLabel(member.role, t)} />
          <DetailRow label={t('organization.status')} value={getStatusLabel(member.status, t)} />
        </DetailSection>

        <DetailSection title={t('organization.joinedAt')} icon={Clock}>
          <DetailRow label={t('organization.joinedAt')} value={formatDate(member.joinedAt)} />
        </DetailSection>

        {/* Supervisions */}
        <MemberSupervisions member={member} />

        {/* Actions */}
        <DetailSection title={t('organization.changeRole')} icon={User}>
          <Select value={member.role} onValueChange={handleRoleChange} disabled={updateRole.isPending}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORGANIZATION_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {getRoleLabel(role, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DetailSection>

        <div className="pt-2">
          {!confirmRemove ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive w-full"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('organization.removeMember')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleRemove}
                disabled={removeMember.isPending}
              >
                {t('common.confirm')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setConfirmRemove(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DetailPanelContent>
  );
}
