'use client';

import { useState, type ReactNode } from 'react';

import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Badge } from './badge';

// ─── Detail Row ───
interface DetailRowProps {
  label: string;
  value: ReactNode;
  copyable?: boolean;
  className?: string;
}

export function DetailRow({ label, value, copyable, className }: DetailRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-start justify-between gap-4 py-2', className)}>
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        {copyable && typeof value === 'string' ? (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-sm font-medium text-foreground">{value}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="text-sm font-medium text-right break-words">{value ?? '—'}</span>
        )}
      </div>
    </div>
  );
}

// ─── Detail Tags ───
interface DetailTagsProps {
  label: string;
  tags: string[];
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'molecule';
  className?: string;
}

export function DetailTags({ label, tags, variant = 'default', className }: DetailTagsProps) {
  const { t } = useTranslation();

  if (!tags || tags.length === 0) {
    return (
      <div className={cn('py-2', className)}>
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="text-sm text-muted-foreground/70 mt-1">{t('common.none')}</p>
      </div>
    );
  }

  return (
    <div className={cn('py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <Badge key={tag} variant={variant}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ─── Detail Code List ───
// Displays a list of API codes with their associated gallery
// Clicking copies only the code (not the gallery)
export interface ApiCodeItem {
  gallery: string;
  code: string;
}

interface DetailCodeListProps {
  label: string;
  codes?: ApiCodeItem[];
  className?: string;
}

export function DetailCodeList({ label, codes, className }: DetailCodeListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!codes || codes.length === 0) {
    return (
      <div className={cn('flex items-start justify-between gap-4 py-2', className)}>
        <span className="text-sm text-muted-foreground shrink-0">{label}</span>
        <span className="text-sm font-medium text-right">—</span>
      </div>
    );
  }

  return (
    <div className={cn('py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-col gap-0.5 mt-2">
        {codes.map((item, index) => (
          <div
            key={`${item.gallery}-${item.code}-${index}`}
            className="flex items-center justify-between gap-2 py-1"
          >
            <span className="text-xs text-muted-foreground">{item.gallery}</span>
            <div className="flex-1 border-b border-dotted border-border/50 mx-2" />
            <button
              onClick={() => handleCopy(item.code, index)}
              className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-sm font-mono font-medium text-foreground">{item.code}</span>
              {copiedIndex === index ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Boolean Value Row Helper ───
// Generic component for displaying boolean values (replaces BiochemicalRow/CharacteristicRow)
export interface BooleanValueRowProps {
  label: string;
  value?: boolean | null;
}

export function BooleanValueRow({ label, value }: BooleanValueRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${
        value === true ? 'text-success' :
        value === false ? 'text-muted-foreground' :
        'text-muted-foreground/50'
      }`}>
        {value === true ? '+' : value === false ? '−' : '?'}
      </span>
    </div>
  );
}
