'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { Upload, FileUp, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// UPLOAD ZONE - Drag & drop multi-file upload component
// ═══════════════════════════════════════════════════════════════════════════

interface UploadZoneProps {
  onFilesChange: (files: File[]) => void;
  selectedFiles: File[];
  disabled?: boolean;
}

export function UploadZone({ onFilesChange, selectedFiles, disabled }: UploadZoneProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const existing = new Set(selectedFiles.map(f => `${f.name}_${f.size}`));
    const unique = arr.filter(f => !existing.has(`${f.name}_${f.size}`));
    if (unique.length > 0) {
      onFilesChange([...selectedFiles, ...unique]);
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(selectedFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {/* File list */}
      <AnimatePresence mode="popLayout">
        {selectedFiles.map((file, index) => (
          <motion.div
            key={`${file.name}_${file.size}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] bg-card"
          >
            <FileUp className="w-4 h-4 text-[var(--module-accent)] shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--color-muted)_80%,transparent)] transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{t('common.remove')}</TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dropzone / Add more */}
      {selectedFiles.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-8',
            'rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer',
            isDragOver
              ? 'border-[var(--module-accent)] bg-[var(--module-accent-subtle)]'
              : 'border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] hover:border-border hover:bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Upload className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          <div className="text-center">
            <p className="text-sm font-medium">{t('quickshare.dropzone')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('quickshare.maxSize')}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
              'border border-dashed border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] hover:border-border hover:bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)]',
              'text-muted-foreground transition-all cursor-pointer',
              isDragOver && 'border-[var(--module-accent)] bg-[var(--module-accent-subtle)]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
            {t('quickshare.addMore')}
          </button>
          <span className="text-xs text-muted-foreground">
            {selectedFiles.length} {selectedFiles.length > 1 ? t('quickshare.files') : t('quickshare.file')} · {formatSize(totalSize)}
          </span>
        </div>
      )}
    </div>
  );
}
