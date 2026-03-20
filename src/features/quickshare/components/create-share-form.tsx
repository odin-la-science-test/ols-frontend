'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Type, FileUp, Clock, Repeat2, Users, X, Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadZone } from './upload-zone';
import { useCreateTextShare, useCreateFileShare } from '../hooks';
import { toast } from '@/hooks';
import { useMyContacts, useSearchContacts } from '@/features/contacts/hooks';
import type { SharedItem } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CREATE SHARE DIALOG - Inline form for creating text or file shares
// ═══════════════════════════════════════════════════════════════════════════

interface CreateShareFormProps {
  onCreated: (item: SharedItem) => void;
  onCancel: () => void;
}

type ShareMode = 'text' | 'file';

// Expiration presets
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

export function CreateShareForm({ onCreated, onCancel }: CreateShareFormProps) {
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<ShareMode>('text');
  const [title, setTitle] = React.useState('');
  const [textContent, setTextContent] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [expiration, setExpiration] = React.useState<ExpirationPreset>('never');
  const [maxDownloads, setMaxDownloads] = React.useState<string>('');
  const [recipientEmail, setRecipientEmail] = React.useState('');
  const [contactSearch, setContactSearch] = React.useState('');
  const [showContactPicker, setShowContactPicker] = React.useState(false);
  const contactPickerRef = React.useRef<HTMLDivElement>(null);

  const createText = useCreateTextShare();
  const createFile = useCreateFileShare();
  const isPending = createText.isPending || createFile.isPending;

  // Contacts search for picker
  const { data: searchResults = [] } = useSearchContacts(contactSearch);
  const { data: allContacts = [] } = useMyContacts();
  const contactsList = contactSearch.length >= 2 ? searchResults : allContacts.filter(c => c.email).slice(0, 5);

  // Close contact picker on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contactPickerRef.current && !contactPickerRef.current.contains(e.target as Node)) {
        setShowContactPicker(false);
      }
    };
    if (showContactPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showContactPicker]);

  const canSubmit = mode === 'text' ? textContent.trim().length > 0 : selectedFiles.length > 0;

  // Resolve the actual recipient: either picked from contacts or typed manually
  const resolvedRecipient = recipientEmail || (contactSearch.includes('@') ? contactSearch.trim() : '');

  const handleSubmit = async () => {
    try {
      const expiresAt = getExpirationDate(expiration);
      const maxDl = maxDownloads ? parseInt(maxDownloads, 10) : null;

      if (mode === 'text') {
        const result = await createText.mutateAsync({
          title: title || undefined,
          textContent,
          maxDownloads: maxDl,
          expiresAt,
          recipientEmail: resolvedRecipient || undefined,
        });
        onCreated(result);
      } else if (selectedFiles.length > 0) {
        const result = await createFile.mutateAsync({
          files: selectedFiles,
          title: title || undefined,
          maxDownloads: maxDl,
          expiresAt,
          recipientEmail: resolvedRecipient || undefined,
        });
        onCreated(result);
      }
      toast({ title: t('quickshare.created') });
    } catch {
      toast({ title: t('quickshare.createError'), variant: 'destructive' });
    }
  };

  const expirationOptions: { key: ExpirationPreset; label: string }[] = [
    { key: '1h', label: t('quickshare.expiration1h') },
    { key: '24h', label: t('quickshare.expiration24h') },
    { key: '7d', label: t('quickshare.expiration7d') },
    { key: 'never', label: t('quickshare.expirationNever') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/40">
        <button
          onClick={() => setMode('text')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all',
            mode === 'text'
              ? 'bg-card shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Type className="w-4 h-4" strokeWidth={1.5} />
          {t('quickshare.modeText')}
        </button>
        <button
          onClick={() => setMode('file')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all',
            mode === 'file'
              ? 'bg-card shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileUp className="w-4 h-4" strokeWidth={1.5} />
          {t('quickshare.modeFile')}
        </button>
      </div>

      {/* Title */}
      <Input
        placeholder={t('quickshare.titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-card border-border/40"
      />

      {/* Content area */}
      {mode === 'text' ? (
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder={t('quickshare.textPlaceholder')}
          rows={6}
          className={cn(
            'w-full rounded-lg border border-border/40 bg-card',

            'px-3 py-2 text-sm font-mono resize-y',
            'placeholder:text-muted-foreground/50',
            'focus:outline-none focus:ring-1 focus:ring-[var(--module-accent)] focus:border-[var(--module-accent)]',
            'transition-colors'
          )}
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
        <div className="flex-1 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="w-3 h-3" />
            {t('quickshare.expiresLabel')}
          </label>
          <div className="flex gap-1">
            {expirationOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setExpiration(opt.key)}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all',
                  expiration === opt.key
                    ? 'bg-[var(--module-accent)] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted/70'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max downloads */}
        <div className="w-full sm:w-32 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Repeat2 className="w-3 h-3" />
            {t('quickshare.maxDownloadsLabel')}
          </label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            placeholder="∞"
            value={maxDownloads}
            onChange={(e) => setMaxDownloads(e.target.value.replace(/[^0-9]/g, ''))}
            className="bg-card border-border/40 h-8 text-xs"
          />
        </div>
      </div>

      {/* Recipient contact picker */}
      <div className="space-y-1.5" ref={contactPickerRef}>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="w-3 h-3" />
          {t('quickshare.recipientLabel')}
        </label>
        <div className="relative">
          {recipientEmail ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card text-sm">
              <Users className="w-4 h-4 text-[var(--module-accent)]" />
              <span className="flex-1 truncate">{recipientEmail}</span>
              <button
                onClick={() => setRecipientEmail('')}
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
                      setRecipientEmail(contactSearch.trim());
                      setContactSearch('');
                      setShowContactPicker(false);
                    }
                  }}
                  className="bg-card border-border/40 pl-9"
                />
              </div>

              {/* Manual email hint */}
              {contactSearch.includes('@') && contactsList.length === 0 && (
                <p className="text-[11px] text-muted-foreground/60 mt-1 px-1">
                  {t('quickshare.recipientHint')}
                </p>
              )}

              {/* Contact dropdown */}
              <AnimatePresence>
                {showContactPicker && contactsList.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-30 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                  >
                    {contactsList.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => {
                          if (contact.email) {
                            setRecipientEmail(contact.email);
                            setContactSearch('');
                            setShowContactPicker(false);
                          }
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
                      >
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {(contact.firstName?.[0] || contact.lastName?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email}
                          </p>
                          {contact.email && (contact.firstName || contact.lastName) && (
                            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                          )}
                        </div>
                        {contact.isAppUser && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
                            OLS
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={isPending}>
          {t('quickshare.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isPending ? t('common.loading') : t('quickshare.share')}
        </Button>
      </div>
    </motion.div>
  );
}
