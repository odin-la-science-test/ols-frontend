'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Type, FileUp, Users, X, Search } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { CHIP_BASE, CHIP_ACTIVE, CHIP_INACTIVE } from '@/components/modules/shared/identification-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadZone } from './upload-zone';
import { useCreateTextShare, useCreateFileShare, useDeleteShare } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useDraftForm } from '@/hooks/use-draft-form';
import { shareFormSchema, type ShareFormData } from '../schema';
import { useSearchUsers } from '@/hooks/use-search-users';
import type { SharedItem } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CREATE SHARE DIALOG - Inline form for creating text or file shares
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

interface CreateShareFormProps {
  onCreated: (item: SharedItem) => void;
  onCancel: () => void;
  moduleKey: string;
}

type ExpirationPreset = '1h' | '24h' | '7d' | 'never';

function getExpirationDate(preset: ExpirationPreset): string | null {
  const now = new Date();
  switch (preset) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'never':
      return null;
  }
}

export function CreateShareForm({ onCreated, onCancel, moduleKey }: CreateShareFormProps) {
  const { t } = useTranslation();

  const { form, clearDraft } = useDraftForm<ShareFormData>({
    moduleKey,
    schema: shareFormSchema,
    defaults: { mode: 'text', title: '', textContent: '', expiration: 'never', maxDownloads: '', recipientEmail: '' },
  });

  const { register, control, handleSubmit, watch } = form;
  const mode = watch('mode');
  const recipientEmail = watch('recipientEmail');

  // Non-serializable state — stays local
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Ephemeral UI state for contact picker
  const [contactSearch, setContactSearch] = useState('');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const contactPickerRef = useRef<HTMLDivElement>(null);

  const createText = useCreateTextShare();
  const createFile = useCreateFileShare();
  const deleteShare = useDeleteShare();
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();
  const isPending = createText.isPending || createFile.isPending;

  // User search for picker
  const { data: userResults = [] } = useSearchUsers(contactSearch);

  // Close contact picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contactPickerRef.current && !contactPickerRef.current.contains(e.target as Node)) {
        setShowContactPicker(false);
      }
    };
    if (showContactPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showContactPicker]);

  const canSubmit = mode === 'text' ? (watch('textContent') ?? '').trim().length > 0 : selectedFiles.length > 0;

  // Resolve the actual recipient: either picked from contacts or typed manually
  const resolvedRecipient = recipientEmail || (contactSearch.includes('@') ? contactSearch.trim() : '');

  const onSubmit = async (data: ShareFormData) => {
    try {
      const expiresAt = getExpirationDate(data.expiration as ExpirationPreset);
      const maxDl = data.maxDownloads ? parseInt(data.maxDownloads, 10) : null;

      if (data.mode === 'text') {
        let createdId: number | null = null;
        await pushCommand({
          labelKey: 'history.quickshare.createText',
          icon: 'type',
          execute: async () => {
            const result = await createText.mutateAsync({
              title: data.title || undefined,
              textContent: data.textContent,
              maxDownloads: maxDl,
              expiresAt,
              recipientEmail: resolvedRecipient || undefined,
            });
            createdId = result.id;
            log({ type: 'action', message: t('activity.quickshare.createText'), icon: 'type', accentColor: HUGIN_PRIMARY });
            clearDraft();
            onCreated(result);
            toast({ title: t('quickshare.created') });
          },
          undo: async () => {
            if (createdId) {
              await deleteShare.mutateAsync(createdId);
              toast({ title: t('history.undo') });
            }
          },
        });
      } else if (selectedFiles.length > 0) {
        const result = await createFile.mutateAsync({
          files: selectedFiles,
          title: data.title || undefined,
          maxDownloads: maxDl,
          expiresAt,
          recipientEmail: resolvedRecipient || undefined,
        });
        log({ type: 'action', message: t('activity.quickshare.createFile'), icon: 'file-up', accentColor: HUGIN_PRIMARY });
        clearDraft();
        onCreated(result);
        toast({ title: t('quickshare.created') });
      }
    } catch {
      toast({ title: t('quickshare.createError'), variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  const expirationOptions: { key: ExpirationPreset; label: string }[] = [
    { key: '1h', label: t('quickshare.expiration1h') },
    { key: '24h', label: t('quickshare.expiration24h') },
    { key: '7d', label: t('quickshare.expiration7d') },
    { key: 'never', label: t('quickshare.expirationNever') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 min-h-0"
    >
      <SidebarFormBody>
      {/* Mode tabs */}
      <Controller
        name="mode"
        control={control}
        render={({ field }) => (
          <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/40">
            <button
              type="button"
              onClick={() => field.onChange('text')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all',
                field.value === 'text'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Type className="w-4 h-4" strokeWidth={1.5} />
              {t('quickshare.modeText')}
            </button>
            <button
              type="button"
              onClick={() => field.onChange('file')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all',
                field.value === 'file'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileUp className="w-4 h-4" strokeWidth={1.5} />
              {t('quickshare.modeFile')}
            </button>
          </div>
        )}
      />

      {/* Title */}
      <Input
        {...register('title')}
        placeholder={t('quickshare.titlePlaceholder')}
        className="bg-card border-border/40"
      />

      {/* Content area */}
      {mode === 'text' ? (
        <Textarea
          {...register('textContent')}
          placeholder={t('quickshare.textPlaceholder')}
          rows={6}
          className="border-border/40 bg-card font-mono"
        />
      ) : (
        <UploadZone
          onFilesChange={setSelectedFiles}
          selectedFiles={selectedFiles}
          disabled={isPending}
        />
      )}

      {/* Options row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Expiration */}
        <SidebarFormField label={t('quickshare.expiresLabel')} className="flex-1">
          <Controller
            name="expiration"
            control={control}
            render={({ field }) => (
              <div className="flex gap-1">
                {expirationOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => field.onChange(opt.key)}
                    className={cn(
                      CHIP_BASE, 'flex-1 py-1.5 px-2 text-xs justify-center',
                      field.value === opt.key ? CHIP_ACTIVE : CHIP_INACTIVE
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
        </SidebarFormField>

        {/* Max downloads */}
        <SidebarFormField label={t('quickshare.maxDownloadsLabel')} className="w-full sm:w-32">
          <Controller
            name="maxDownloads"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                placeholder="∞"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                className="bg-card border-border/40 h-8 text-xs"
              />
            )}
          />
        </SidebarFormField>
      </div>

      {/* Recipient contact picker */}
      <Controller
        name="recipientEmail"
        control={control}
        render={({ field }) => (
          <div ref={contactPickerRef}>
            <SidebarFormField label={t('quickshare.recipientLabel')}>
            <div className="relative">
              {field.value ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card text-sm">
                  <Users className="w-4 h-4 text-[var(--module-accent)]" />
                  <span className="flex-1 truncate">{field.value}</span>
                  <button
                    type="button"
                    onClick={() => field.onChange('')}
                    className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    <Input
                      placeholder={t('quickshare.recipientPlaceholder')}
                      value={contactSearch}
                      onChange={(e) => {
                        setContactSearch(e.target.value);
                        setShowContactPicker(true);
                      }}
                      onFocus={() => setShowContactPicker(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && contactSearch.includes('@')) {
                          e.preventDefault();
                          field.onChange(contactSearch.trim());
                          setContactSearch('');
                          setShowContactPicker(false);
                        }
                      }}
                      className="bg-card border-border/40 pl-9"
                    />
                  </div>

                  {/* Manual email hint */}
                  {contactSearch.includes('@') && userResults.length === 0 && (
                    <p className="text-[11px] text-muted-foreground/60 mt-1 px-1">
                      {t('quickshare.recipientHint')}
                    </p>
                  )}

                  {/* User search dropdown */}
                  <AnimatePresence>
                    {showContactPicker && userResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-30 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                      >
                        {userResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              field.onChange(user.email);
                              setContactSearch('');
                              setShowContactPicker(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
                          >
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                              {(user.firstName?.[0] || user.lastName?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">
                                {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                              </p>
                              {(user.firstName || user.lastName) && (
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
            </SidebarFormField>
          </div>
        )}
      />
      </SidebarFormBody>

      <SidebarFormActions>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
          {t('quickshare.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit(onSubmit)}
          disabled={!canSubmit || isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isPending ? t('common.loading') : t('quickshare.share')}
        </Button>
      </SidebarFormActions>
    </motion.div>
  );
}
