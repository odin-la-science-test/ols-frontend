'use client';

import { useState, useRef, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, Button } from '@/components/ui';
import { useTextCorrection, toast } from '@/hooks';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { CorrectionDto } from '@/api/ai-api';

// ═══════════════════════════════════════════════════════════════════════════
// AI CORRECTION BUTTON - Spell & grammar check with preview popover
// Supports full text or selection-only correction
// ═══════════════════════════════════════════════════════════════════════════

interface AiCorrectionButtonProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onApply: (text: string, selectionStart?: number, selectionEnd?: number) => void;
  disabled?: boolean;
  className?: string;
}

interface PendingCorrection {
  originalText: string;
  correctedText: string;
  corrections: CorrectionDto[];
  isSelection: boolean;
  selectionStart: number;
  selectionEnd: number;
}

export function AiCorrectionButton({ textareaRef, onApply, disabled, className }: AiCorrectionButtonProps) {
  const { t } = useTranslation();
  const correction = useTextCorrection();
  const [pending, setPending] = useState<PendingCorrection | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fermer le popover au clic exterieur ou Escape
  useEffect(() => {
    if (!pending) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPending(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPending(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [pending]);

  const handleCorrect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const fullText = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    const textToCorrect = hasSelection ? fullText.substring(start, end) : fullText;

    if (!textToCorrect || textToCorrect.trim().split(/\s+/).length < 2) {
      toast({ title: t('ai.tooShort') });
      return;
    }

    correction.mutate(textToCorrect, {
      onSuccess: (data) => {
        if (data.correctionCount === 0) {
          toast({ title: t('ai.noCorrection') });
        } else {
          setPending({
            originalText: textToCorrect,
            correctedText: data.correctedText,
            corrections: data.corrections,
            isSelection: hasSelection,
            selectionStart: start,
            selectionEnd: end,
          });
        }
      },
      onError: () => {
        toast({ title: t('ai.error'), variant: 'destructive' });
      },
    });
  };

  const handleApply = () => {
    if (!pending) return;
    if (pending.isSelection) {
      onApply(pending.correctedText, pending.selectionStart, pending.selectionEnd);
    } else {
      onApply(pending.correctedText);
    }
    toast({ title: t('ai.success', { count: pending.corrections.length }) });
    setPending(null);
  };

  const handleCancel = () => {
    setPending(null);
  };

  // Detecter si du texte est selectionne (pour le tooltip)
  const hasSelection = textareaRef.current
    ? textareaRef.current.selectionStart !== textareaRef.current.selectionEnd
    : false;

  return (
    <div ref={popoverRef} className={cn('relative', className)}>
      {/* Bouton sparkle */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCorrect}
            disabled={disabled || correction.isPending}
            className={cn(
              'h-7 w-7 rounded-md',
              'text-muted-foreground/60 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)]',
              'transition-colors',
            )}
          >
            {correction.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {hasSelection ? t('ai.selectionButton') : t('ai.button')}
        </TooltipContent>
      </Tooltip>

      {/* Popover de preview */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute bottom-full right-0 mb-2',
              'w-72 max-h-48 overflow-y-auto',
              'rounded-lg border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]',
              'bg-[color-mix(in_srgb,var(--color-popover)_95%,transparent)] backdrop-blur-xl shadow-xl',
              'p-3 z-50',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t('ai.preview', { count: pending.corrections.length })}
              </span>
            </div>

            {/* Diff inline */}
            <div className="text-sm leading-relaxed mb-3">
              <CorrectionDiff
                originalText={pending.originalText}
                corrections={pending.corrections}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-7 px-2.5 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                {t('ai.cancel')}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                className="h-7 px-2.5 text-xs bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                {t('ai.apply')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Diff inline : montre les corrections dans le texte ───

function CorrectionDiff({ originalText, corrections }: { originalText: string; corrections: CorrectionDto[] }) {
  if (corrections.length === 0) return <span>{originalText}</span>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Les corrections sont deja triees par offset
  for (const c of corrections) {
    // Texte avant la correction
    if (c.offset > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{originalText.substring(lastIndex, c.offset)}</span>);
    }

    // La correction : barre + remplacement
    const replacement = c.replacements[0];
    parts.push(
      <span key={`corr-${c.offset}`}>
        <span className="line-through text-[color-mix(in_srgb,var(--color-destructive)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-destructive)_10%,transparent)] rounded-sm px-0.5">{c.original}</span>
        {replacement && (
          <span className="text-emerald-400 bg-emerald-400/10 rounded-sm px-0.5 font-medium">{replacement}</span>
        )}
      </span>
    );

    lastIndex = c.offset + c.length;
  }

  // Texte restant apres la derniere correction
  if (lastIndex < originalText.length) {
    parts.push(<span key={`text-${lastIndex}`}>{originalText.substring(lastIndex)}</span>);
  }

  return <>{parts}</>;
}
