'use client';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { X, Send } from 'lucide-react';
import { Button, Textarea } from '@/components/ui';
import {
  useEntityAnnotations,
  useCreateAnnotation,
  useDeleteAnnotation,
  annotationsKeys,
} from '@/features/annotations/hooks';
import type { AnnotationColor } from '@/features/annotations/types';
import { useQueryClient } from '@tanstack/react-query';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATION PANEL — Inline expandable panel for entity annotations
// ═══════════════════════════════════════════════════════════════════════════

const ANNOTATION_COLORS: AnnotationColor[] = ['YELLOW', 'GREEN', 'BLUE', 'PINK'];

function getColorClass(color: AnnotationColor): string {
  switch (color) {
    case 'YELLOW': return 'bg-yellow-400';
    case 'GREEN': return 'bg-green-400';
    case 'BLUE': return 'bg-blue-400';
    case 'PINK': return 'bg-pink-400';
  }
}

interface AnnotationPanelProps {
  entityType: string;
  entityId: number;
  onClose: () => void;
}

export function AnnotationPanel({ entityType, entityId, onClose }: AnnotationPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: annotations = [] } = useEntityAnnotations(entityType, entityId);
  const createMutation = useCreateAnnotation();
  const deleteMutation = useDeleteAnnotation();

  const [content, setContent] = useState('');
  const [color, setColor] = useState<AnnotationColor>('YELLOW');

  const handleSubmit = () => {
    if (!content.trim()) return;
    createMutation.mutate(
      { entityType, entityId, content: content.trim(), color },
      {
        onSuccess: () => {
          setContent('');
          queryClient.invalidateQueries({ queryKey: annotationsKeys.entity(entityType, entityId) });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: annotationsKeys.entity(entityType, entityId) });
      },
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="border-b border-border/30 bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {t('entityActions.annotations')}
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-muted/50 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* List */}
      <div className="max-h-48 overflow-y-auto px-3">
        {annotations.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">
            {t('entityActions.noAnnotations')}
          </p>
        ) : (
          <div className="space-y-1.5 pb-2">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="flex items-start gap-2 group text-xs"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${getColorClass(annotation.color)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground leading-snug break-words">
                    {annotation.content}
                  </p>
                  <p className="text-muted-foreground/70 text-[10px] mt-0.5">
                    {formatDate(annotation.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(annotation.id)}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="px-3 pb-2 space-y-1.5">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('entityActions.writeAnnotation')}
          className="min-h-[52px] max-h-20 text-xs resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground mr-1">
              {t('entityActions.annotationColor')}
            </span>
            {ANNOTATION_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full transition-all ${getColorClass(c)} ${
                  color === c ? 'ring-2 ring-offset-1 ring-offset-background ring-foreground/30 scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSubmit}
            disabled={!content.trim() || createMutation.isPending}
            className="h-6 px-2 text-xs gap-1"
          >
            <Send className="w-3 h-3" />
            {t('entityActions.addAnnotation')}
          </Button>
        </div>
      </div>
    </div>
  );
}
