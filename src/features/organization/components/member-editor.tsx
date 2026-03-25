'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks';
import { ORGANIZATION_ROLES } from '@/api/generated/enum-values';
import { useAddMember } from '../hooks';
import { getRoleLabel } from '../config';
import type { OrganizationMembership } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER EDITOR - Form to add a new member to an organization
// ═══════════════════════════════════════════════════════════════════════════

const schema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'MANAGER', 'MEMBER', 'INTERN']),
});

type FormData = z.infer<typeof schema>;

interface MemberEditorProps {
  orgId: number;
  onSaved: (member: OrganizationMembership) => void;
  onCancel: () => void;
}

export function MemberEditor({ orgId, onSaved, onCancel }: MemberEditorProps) {
  const { t } = useTranslation();
  const addMember = useAddMember();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'MEMBER' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await addMember.mutateAsync({
        orgId,
        data: { email: data.email, role: data.role },
      });
      toast({ title: t('organization.memberAdded') });
      onSaved(result);
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SidebarFormBody>
        <SidebarFormField label={t('organization.email')} error={errors.email?.message}>
          <Input {...register('email')} type="email" placeholder={t('organization.memberEmail')} />
        </SidebarFormField>

        <SidebarFormField label={t('organization.role')} error={errors.role?.message}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
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
            )}
          />
        </SidebarFormField>
      </SidebarFormBody>

      <SidebarFormActions>
        <Button type="button" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" disabled={addMember.isPending}>{t('common.create')}</Button>
      </SidebarFormActions>
    </form>
  );
}
