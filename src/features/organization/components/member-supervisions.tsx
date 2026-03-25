'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DetailSection } from '@/components/modules/shared';
import { toast } from '@/hooks';
import { useSupervisions, useOrganizationMembers, useCreateSupervision, useDeleteSupervision } from '../hooks';
import type { OrganizationMembership, SupervisionRelationship } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER SUPERVISIONS - Supervision sections in the member detail panel
// ═══════════════════════════════════════════════════════════════════════════

interface MemberSupervisionsProps {
  member: OrganizationMembership;
}

function SupervisionList({
  items,
  nameKey,
  onDelete,
  isDeleting,
}: {
  items: SupervisionRelationship[];
  nameKey: 'superviseeName' | 'supervisorName';
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      {items.map((s) => (
        <div key={s.id} className="flex items-center justify-between text-sm py-1 group">
          <span className="truncate">{s[nameKey]}</span>
          <button
            onClick={() => onDelete(s.id)}
            disabled={isDeleting}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[color-mix(in_srgb,var(--color-destructive)_10%,transparent)] text-muted-foreground hover:text-destructive transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AddSupervisionSelect({
  orgId,
  memberId,
  direction,
  existingIds,
  members,
}: {
  orgId: number;
  memberId: number;
  direction: 'supervisee' | 'supervisor';
  existingIds: Set<number>;
  members: OrganizationMembership[];
}) {
  const { t } = useTranslation();
  const createSupervision = useCreateSupervision();
  const [adding, setAdding] = useState(false);

  const availableMembers = members.filter(
    (m) => m.userId !== memberId && !existingIds.has(m.userId) && m.status === 'ACTIVE',
  );

  const handleAdd = async (targetUserId: string) => {
    const data = direction === 'supervisee'
      ? { supervisorId: memberId, superviseeId: Number(targetUserId) }
      : { supervisorId: Number(targetUserId), superviseeId: memberId };

    try {
      await createSupervision.mutateAsync({ orgId, data });
      toast({ title: t('organization.supervisionAdded') });
      setAdding(false);
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  if (!adding) {
    return (
      <Button variant="ghost" size="sm" className="w-full gap-1.5 mt-1" onClick={() => setAdding(true)}>
        <Plus className="w-3 h-3" />
        {direction === 'supervisee' ? t('organization.addSupervisee') : t('organization.addSupervisor')}
      </Button>
    );
  }

  return (
    <div className="flex gap-1.5 mt-1">
      <Select onValueChange={handleAdd} disabled={createSupervision.isPending}>
        <SelectTrigger className="h-7 text-xs flex-1">
          <SelectValue placeholder={t('organization.memberEmail')} />
        </SelectTrigger>
        <SelectContent>
          {availableMembers.map((m) => (
            <SelectItem key={m.userId} value={String(m.userId)}>
              {m.userFullName || m.userEmail}
            </SelectItem>
          ))}
          {availableMembers.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{t('organization.noMembers')}</div>
          )}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setAdding(false)}>
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

export function MemberSupervisions({ member }: MemberSupervisionsProps) {
  const { t } = useTranslation();
  const { data: supervisions = [] } = useSupervisions(member.organizationId);
  const { data: members = [] } = useOrganizationMembers(member.organizationId);
  const deleteSupervision = useDeleteSupervision();

  const supervisees = supervisions.filter((s) => s.supervisorId === member.userId);
  const supervisors = supervisions.filter((s) => s.superviseeId === member.userId);

  const superviseeIds = new Set(supervisees.map((s) => s.superviseeId));
  const supervisorIds = new Set(supervisors.map((s) => s.supervisorId));

  const handleDelete = async (supervisionId: number) => {
    try {
      await deleteSupervision.mutateAsync({ orgId: member.organizationId, supervisionId });
      toast({ title: t('organization.supervisionRemoved') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  return (
    <>
      <DetailSection title={`${t('organization.supervises')} (${supervisees.length})`} icon={GitBranch}>
        <SupervisionList items={supervisees} nameKey="superviseeName" onDelete={handleDelete} isDeleting={deleteSupervision.isPending} />
        <AddSupervisionSelect orgId={member.organizationId} memberId={member.userId} direction="supervisee" existingIds={superviseeIds} members={members} />
      </DetailSection>

      <DetailSection title={`${t('organization.supervisedBy')} (${supervisors.length})`} icon={GitBranch}>
        <SupervisionList items={supervisors} nameKey="supervisorName" onDelete={handleDelete} isDeleting={deleteSupervision.isPending} />
        <AddSupervisionSelect orgId={member.organizationId} memberId={member.userId} direction="supervisor" existingIds={supervisorIds} members={members} />
      </DetailSection>
    </>
  );
}
