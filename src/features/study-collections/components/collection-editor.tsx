'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/ui';
import { motion } from 'framer-motion';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useCreateCollection } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useDraftForm } from '@/hooks/use-draft-form';
import { studyCollectionFormSchema, type StudyCollectionFormData } from '../schema';
import type { StudyCollection } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION EDITOR - Create a study collection
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

interface CollectionEditorProps {
  onSaved: (collection: StudyCollection) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function CollectionEditor({ onSaved, onCancel, moduleKey }: CollectionEditorProps) {
  const { t } = useTranslation();

  const { form, clearDraft } = useDraftForm<StudyCollectionFormData>({
    moduleKey,
    schema: studyCollectionFormSchema,
    defaults: { name: '', description: '' },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const createCollection = useCreateCollection();
  const { log } = useActivityLog();
  const isPending = createCollection.isPending;

  const onSubmit = async (data: StudyCollectionFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
      };

      const result = await createCollection.mutateAsync(payload);
      log({ type: 'action', message: t('activity.studyCollections.create'), icon: 'plus', accentColor: HUGIN_PRIMARY });
      clearDraft();
      onSaved(result);
      toast({ title: t('studyCollections.created') });
    } catch {
      toast({ title: t('studyCollections.saveError'), variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 min-h-0"
    >
      <SidebarFormBody>
        {/* Name */}
        <SidebarFormField
          label={t('studyCollections.name')}
          error={errors.name?.message ? t(errors.name.message) : undefined}
        >
          <Input
            {...register('name')}
            placeholder={t('studyCollections.namePlaceholder')}
            className="bg-card border-border/40"
            autoFocus
          />
        </SidebarFormField>

        {/* Description */}
        <SidebarFormField label={t('studyCollections.description')}>
          <Textarea
            {...register('description')}
            placeholder={t('studyCollections.descriptionPlaceholder')}
            rows={4}
            className="border-border/40 bg-card"
          />
        </SidebarFormField>
      </SidebarFormBody>

      {/* Actions */}
      <SidebarFormActions>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
          {t('studyCollections.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isPending ? t('common.loading') : t('studyCollections.create')}
        </Button>
      </SidebarFormActions>
    </motion.div>
  );
}
