'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileUp, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card"
          >
            <FileUp className="w-4 h-4 text-[var(--module-accent)] shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={() => removeFile(index)}
              className="p-1 rounded hover:bg-muted/80 transition-colors"
              title={t('common.remove')}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
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
              : 'border-border/50 hover:border-border hover:bg-muted/30',
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
              'border border-dashed border-border/50 hover:border-border hover:bg-muted/30',
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
