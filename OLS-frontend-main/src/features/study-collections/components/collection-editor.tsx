'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/ui';
import { motion } from 'framer-motion';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useCreateCollection, useUpdateCollection, useDeleteCollection } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useDraftForm } from '@/hooks/use-draft-form';
import { studyCollectionFormSchema, type StudyCollectionFormData } from '../schema';
import type { StudyCollection } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION EDITOR - Create or edit a study collection
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

interface CollectionEditorProps {
  /** Collection existante à éditer (null = création) */
  contact?: StudyCollection | null;
  onSaved: (collection: StudyCollection) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function CollectionEditor({ contact: collection, onSaved, onCancel, moduleKey }: CollectionEditorProps) {
  const { t } = useTranslation();
  const isEditing = !!collection;

  const { form, clearDraft } = useDraftForm<StudyCollectionFormData>({
    moduleKey,
    schema: studyCollectionFormSchema,
    defaults: { name: '', description: '' },
    entityValues: collection ? {
      name: collection.name ?? '',
      description: collection.description ?? '',
    } : undefined,
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();
  const isPending = createCollection.isPending || updateCollection.isPending;

  const onSubmit = async (data: StudyCollectionFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
      };

      if (isEditing && collection) {
        const previousData = {
          name: collection.name,
          description: collection.description || undefined,
        };
        await pushCommand({
          labelKey: 'history.studyCollections.update',
          icon: 'pencil',
          execute: async () => {
            const result = await updateCollection.mutateAsync({ id: collection.id, data: payload });
            log({ type: 'action', message: t('activity.studyCollections.update'), icon: 'pencil', accentColor: HUGIN_PRIMARY });
            clearDraft();
            onSaved(result);
            toast({ title: t('studyCollections.updated') });
          },
          undo: async () => {
            await updateCollection.mutateAsync({ id: collection.id, data: previousData });
            toast({ title: t('history.undo') });
          },
        });
      } else {
        let createdId: number | null = null;
        await pushCommand({
          labelKey: 'history.studyCollections.create',
          icon: 'plus',
          execute: async () => {
            const result = await createCollection.mutateAsync(payload);
            createdId = result.id;
            log({ type: 'action', message: t('activity.studyCollections.create'), icon: 'plus', accentColor: HUGIN_PRIMARY });
            clearDraft();
            onSaved(result);
            toast({ title: t('studyCollections.created') });
          },
          undo: async () => {
            if (createdId) {
              await deleteCollection.mutateAsync(createdId);
              toast({ title: t('history.undo') });
            }
          },
        });
      }
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
          {isPending ? t('common.loading') : isEditing ? t('studyCollections.save') : t('studyCollections.create')}
        </Button>
      </SidebarFormActions>
    </motion.div>
  );
}
