import { useEffect, useRef, useCallback } from 'react';
import { useForm, type UseFormReturn, type DefaultValues, type Path, type FieldValues, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import { useWorkspaceStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// USE DRAFT FORM — React Hook Form + Zod + workspace draft persistence
//
// Remplace le pattern manuel useState + useFormDraft.
// - Auto-restore du draft depuis le workspace store au mount
// - Auto-save du draft au unmount (navigation away)
// - Clear explicite sur submit/cancel via clearDraft()
// - Type-safe : le schema Zod drive à la fois la validation et le typage
//
// Usage :
//   const { form, clearDraft } = useDraftForm<NoteFormData>({
//     moduleKey: 'notes',
//     schema: noteFormSchema,
//     defaults: { title: '', content: '', color: null, tags: [] },
//     entityValues: note ? { title: note.title, ... } : undefined,
//   });
//   const { register, control, handleSubmit, formState: { errors } } = form;
// ═══════════════════════════════════════════════════════════════════════════

export interface UseDraftFormOptions<T extends FieldValues> {
  /** Module key pour la persistence workspace (ex: 'notes') */
  moduleKey: string;
  /** Schema Zod pour la validation */
  schema: ZodType<T>;
  /** Valeurs par défaut pour la création (pas d'entité, pas de draft) */
  defaults: DefaultValues<T>;
  /** Valeurs d'une entité existante en édition (overrides defaults, overridden by draft) */
  entityValues?: Partial<T>;
  /** Champs à exclure du draft (ex: fichiers non sérialisables) */
  transientFields?: Path<T>[];
}

export interface UseDraftFormReturn<T extends FieldValues> {
  /** L'objet RHF complet — register(), control, formState, etc. */
  form: UseFormReturn<T>;
  /** Efface le draft persisté (appeler sur submit ou cancel) */
  clearDraft: () => void;
}

export function useDraftForm<T extends FieldValues>({
  moduleKey,
  schema,
  defaults,
  entityValues,
  transientFields = [],
}: UseDraftFormOptions<T>): UseDraftFormReturn<T> {
  // Lire le draft sauvegardé une seule fois au mount
  const savedDraft = useRef(
    useWorkspaceStore.getState().getModuleContext(moduleKey)?.formDraft as Partial<T> | undefined
  ).current;

  // Priorité : defaults < entityValues < savedDraft (le draft gagne si l'user était en cours d'édition)
  const mergedDefaults = {
    ...defaults,
    ...(entityValues ?? {}),
    ...(savedDraft ?? {}),
  } as DefaultValues<T>;

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<T>,
    defaultValues: mergedDefaults,
    mode: 'onBlur',
  });

  // Track si le draft a été clear (submit/cancel) pour skip le save au unmount
  const draftClearedRef = useRef(false);

  const clearDraft = useCallback(() => {
    draftClearedRef.current = true;
    useWorkspaceStore.getState().saveModuleContext(moduleKey, {
      formDraft: undefined,
    });
  }, [moduleKey]);

  // Auto-save au unmount (navigation away sans submit/cancel)
  useEffect(() => {
    return () => {
      if (draftClearedRef.current) return;

      const currentValues = form.getValues();
      const draftToSave = { ...currentValues };

      // Retirer les champs transients (non sérialisables)
      for (const field of transientFields) {
        delete (draftToSave as Record<string, unknown>)[field as string];
      }

      // Ne sauvegarder que s'il y a du contenu significatif
      const hasContent = Object.values(draftToSave).some(
        (v) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
      );

      useWorkspaceStore.getState().saveModuleContext(moduleKey, {
        formDraft: hasContent ? draftToSave : undefined,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  return { form, clearDraft };
}
