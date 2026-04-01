import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';
import i18n from '@/i18n';

// ═══════════════════════════════════════════════════════════════════════════
// USE INLINE AUTO-SAVE — Auto-save individual fields on blur
//
// Connects a React Hook Form instance to an update mutation.
// Saves only changed fields, one at a time, on blur or immediate trigger.
// Used by inline-editable detail panels (Notion-like UX).
// ═══════════════════════════════════════════════════════════════════════════

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UpdateMutation<TUpdate> {
  mutateAsync: (variables: { id: number; data: TUpdate }) => Promise<unknown>;
  isPending: boolean;
}

export interface UseInlineAutoSaveOptions<TForm extends FieldValues, TUpdate> {
  form: UseFormReturn<TForm>;
  updateMutation: UpdateMutation<TUpdate>;
  entityId: number;
  entityValues: Partial<TForm>;
  /** Set to false for read-only mode (e.g., Support tickets not OPEN) */
  enabled?: boolean;
}

export interface UseInlineAutoSaveReturn {
  /** Call on blur of a text/textarea field */
  handleFieldBlur: (fieldName: Path<never>) => void;
  /** Call immediately on change for selects, color pickers, toggles */
  saveField: (fieldName: Path<never>) => void;
  saveStatus: SaveStatus;
  isSaving: boolean;
}

const SAVED_DISPLAY_MS = 1500;
const DEBOUNCE_MS = 300;

export function useInlineAutoSave<TForm extends FieldValues, TUpdate>(
  options: UseInlineAutoSaveOptions<TForm, TUpdate>,
): UseInlineAutoSaveReturn {
  const { form, updateMutation, entityId, entityValues, enabled = true } = options;

  // Snapshot of last-saved values (starts with entity values)
  const snapshotRef = useRef<Partial<TForm>>({ ...entityValues });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Reset form and snapshot when entity changes (ID change or external data update e.g. after undo)
  const entityHash = JSON.stringify(entityValues);
  useEffect(() => {
    // Only reset if the form is NOT currently being edited (no dirty fields)
    const isDirty = Object.keys(form.formState.dirtyFields).length > 0;
    if (!isDirty) {
      snapshotRef.current = { ...entityValues };
      form.reset(entityValues as TForm);
    }
  }, [entityId, entityHash]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSave = useCallback(async (fieldName: string) => {
    if (!enabled) return;

    const currentValue = form.getValues(fieldName as Path<TForm>);
    const previousValue = snapshotRef.current[fieldName as keyof TForm];

    // Skip if unchanged (deep comparison for arrays/objects)
    if (JSON.stringify(currentValue) === JSON.stringify(previousValue)) return;

    // Validate the field first
    const isValid = await form.trigger(fieldName as Path<TForm>);
    if (!isValid) return;

    setSaveStatus('saving');

    try {
      await updateMutation.mutateAsync({
        id: entityId,
        data: { [fieldName]: currentValue } as TUpdate,
      });

      // Update snapshot
      snapshotRef.current = {
        ...snapshotRef.current,
        [fieldName]: currentValue,
      };

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus((s) => s === 'saved' ? 'idle' : s), SAVED_DISPLAY_MS);
    } catch (err) {
      logger.error('[InlineAutoSave] save failed', fieldName, err);
      setSaveStatus('error');
      toast({ title: i18n.t('common.saveError'), variant: 'destructive' });

      // Revert field to last-saved value
      form.setValue(
        fieldName as Path<TForm>,
        previousValue as TForm[typeof fieldName & string],
      );
      setTimeout(() => setSaveStatus((s) => s === 'error' ? 'idle' : s), SAVED_DISPLAY_MS);
    }
  }, [enabled, form, updateMutation, entityId]);

  const handleFieldBlur = useCallback((fieldName: Path<never>) => {
    if (!enabled) return;

    // Debounce to avoid saves when tabbing quickly through fields
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave(fieldName as string);
    }, DEBOUNCE_MS);
  }, [enabled, doSave]);

  const saveField = useCallback((fieldName: Path<never>) => {
    if (!enabled) return;
    // Immediate save for selects, color pickers, toggles
    doSave(fieldName as string);
  }, [enabled, doSave]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    handleFieldBlur,
    saveField,
    saveStatus,
    isSaving: saveStatus === 'saving',
  };
}
