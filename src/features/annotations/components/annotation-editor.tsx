'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useCreateAnnotation } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useDraftForm } from '@/hooks/use-draft-form';
import { annotationFormSchema, type AnnotationFormData } from '../schema';
import type { Annotation, AnnotationColor } from '../types';
import { Controller } from 'react-hook-form';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATION EDITOR - Create an annotation
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

const ANNOTATION_COLORS: AnnotationColor[] = ['YELLOW', 'GREEN', 'BLUE', 'PINK'];

function getColorLabel(color: AnnotationColor, t: ReturnType<typeof useTranslation>['t']): string {
  switch (color) {
    case 'YELLOW': return t('annotations.color.YELLOW');
    case 'GREEN': return t('annotations.color.GREEN');
    case 'BLUE': return t('annotations.color.BLUE');
    case 'PINK': return t('annotations.color.PINK');
  }
}

function getColorDotClass(color: AnnotationColor): string {
  switch (color) {
    case 'YELLOW': return 'bg-yellow-500';
    case 'GREEN': return 'bg-green-500';
    case 'BLUE': return 'bg-blue-500';
    case 'PINK': return 'bg-pink-500';
  }
}

interface AnnotationEditorProps {
  onSaved: (annotation: Annotation) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function AnnotationEditor({ onSaved, onCancel, moduleKey }: AnnotationEditorProps) {
  const { t } = useTranslation();

  const { form, clearDraft } = useDraftForm<AnnotationFormData>({
    moduleKey,
    schema: annotationFormSchema,
    defaults: { content: '', entityType: '', entityId: 0, color: 'YELLOW' },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const createAnnotation = useCreateAnnotation();
  const { log } = useActivityLog();
  const isPending = createAnnotation.isPending;

  const onSubmit = async (data: AnnotationFormData) => {
    try {
      const result = await createAnnotation.mutateAsync({
        entityType: data.entityType,
        entityId: data.entityId,
        content: data.content,
        color: data.color,
      });
      log({ type: 'action', message: t('annotations.created'), icon: 'plus', accentColor: HUGIN_PRIMARY });
      clearDraft();
      onSaved(result);
      toast({ title: t('annotations.created') });
    } catch {
      toast({ title: t('annotations.saveError'), variant: 'destructive' });
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
        {/* Content */}
        <SidebarFormField
          label={t('annotations.content')}
          error={errors.content?.message ? t(errors.content.message) : undefined}
        >
          <Textarea
            {...register('content')}
            placeholder={t('annotations.contentPlaceholder')}
            rows={5}
            className="border-border/40 bg-card"
            autoFocus
          />
        </SidebarFormField>

        {/* Entity Type + Entity ID row */}
        <div className="grid grid-cols-2 gap-3">
          <SidebarFormField
            label={t('annotations.entityType')}
            error={errors.entityType?.message ? t(errors.entityType.message) : undefined}
          >
            <Input
              {...register('entityType')}
              placeholder={t('annotations.entityTypePlaceholder')}
              className="bg-card border-border/40"
            />
          </SidebarFormField>
          <SidebarFormField
            label={t('annotations.entityId')}
            error={errors.entityId?.message ? t(errors.entityId.message) : undefined}
          >
            <Input
              {...register('entityId', { valueAsNumber: true })}
              type="number"
              placeholder="ID"
              className="bg-card border-border/40"
            />
          </SidebarFormField>
        </div>

        {/* Color */}
        <SidebarFormField label={t('annotations.color')}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="bg-card border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANNOTATION_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getColorDotClass(color)}`} />
                        {getColorLabel(color, t)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </SidebarFormField>
      </SidebarFormBody>

      {/* Actions */}
      <SidebarFormActions>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
          {t('contacts.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isPending ? t('common.loading') : t('contacts.create')}
        </Button>
      </SidebarFormActions>
    </motion.div>
  );
}
