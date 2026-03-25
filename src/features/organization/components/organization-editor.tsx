'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useCreateOrganization } from '../hooks';
import { toast } from '@/hooks';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Organization, OrganizationType } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION EDITOR - Admin form to create an organization
// ═══════════════════════════════════════════════════════════════════════════

const ORGANIZATION_TYPES: OrganizationType[] = ['LABORATORY', 'UNIVERSITY', 'COMPANY', 'HOSPITAL', 'RESEARCH_CENTER', 'OTHER'];

const schema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['LABORATORY', 'UNIVERSITY', 'COMPANY', 'HOSPITAL', 'RESEARCH_CENTER', 'OTHER']),
  website: z.string().max(500).optional(),
  ownerEmail: z.string().email(),
});

type FormData = z.infer<typeof schema>;

function getTypeLabel(type: OrganizationType, t: (key: string) => string): string {
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

interface OrganizationEditorProps {
  onSaved: (org: Organization) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function OrganizationEditor({ onSaved, onCancel }: OrganizationEditorProps) {
  const { t } = useTranslation();
  const createOrg = useCreateOrganization();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', type: 'LABORATORY', website: '', ownerEmail: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createOrg.mutateAsync({
        name: data.name,
        type: data.type,
        description: data.description,
        website: data.website,
        ownerEmail: data.ownerEmail,
      });
      toast({ title: t('adminOrganization.created') });
      onSaved(result);
    } catch {
      toast({ title: t('adminOrganization.createError'), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SidebarFormBody>
        <SidebarFormField label={t('organization.name')} error={errors.name?.message}>
          <Input {...register('name')} placeholder={t('organization.name')} />
        </SidebarFormField>

        <SidebarFormField label={t('organization.type')} error={errors.type?.message}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getTypeLabel(type, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </SidebarFormField>

        <SidebarFormField label={t('organization.description')} error={errors.description?.message}>
          <Input {...register('description')} placeholder={t('organization.description')} />
        </SidebarFormField>

        <SidebarFormField label={t('organization.website')} error={errors.website?.message}>
          <Input {...register('website')} placeholder="https://..." />
        </SidebarFormField>

        <SidebarFormField label={t('adminOrganization.ownerEmail')} error={errors.ownerEmail?.message}>
          <Input {...register('ownerEmail')} type="email" placeholder="responsable@labo.fr" />
        </SidebarFormField>
      </SidebarFormBody>

      <SidebarFormActions>
        <Button type="button" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" disabled={createOrg.isPending}>{t('common.create')}</Button>
      </SidebarFormActions>
    </form>
  );
}
