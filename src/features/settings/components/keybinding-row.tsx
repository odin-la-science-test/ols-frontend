import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CornerDownLeft, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatKeyCombo,
  type KeybindingEntry,
  type KeyCombo,
} from '@/stores/keybindings-store';

// ─── Keybinding Row ───

export interface KeybindingRowProps {
  binding: KeybindingEntry;
  effectiveCombo: KeyCombo;
  customized: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSetKeybinding: (combo: KeyCombo) => void;
  onReset: () => void;
  hasConflict: boolean;
}

export function KeybindingRow({
  binding,
  effectiveCombo,
  customized,
  isRecording,
  onStartRecording,
  onStopRecording,
  onSetKeybinding,
  onReset,
  hasConflict,
}: KeybindingRowProps) {
  const { t } = useTranslation();

  // Get the label — for goToTab actions, append the tab number
  const getLabel = () => {
    if (binding.id.startsWith('goToTab')) {
      const num = binding.id.replace('goToTab', '');
      return `${t(binding.labelKey)} ${num}`;
    }
    return t(binding.labelKey);
  };

  // Handle key recording
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Escape cancels recording
      if (event.key === 'Escape') {
        onStopRecording();
        return;
      }

      // Ignore standalone modifier presses
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
        return;
      }

      const combo: KeyCombo = {
        key: event.key.toLowerCase(),
        ctrlKey: event.ctrlKey || event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      };

      // Require at least one modifier
      if (!combo.ctrlKey && !combo.altKey) {
        return;
      }

      onSetKeybinding(combo);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isRecording, onStopRecording, onSetKeybinding]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
        isRecording
          ? 'border-[var(--module-accent)]/40 bg-[var(--module-accent-subtle)] ring-1 ring-[var(--module-accent)]/20'
          : hasConflict
            ? 'border-[color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_5%,transparent)]'
            : 'border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card hover:border-[color-mix(in_srgb,var(--color-border)_60%,transparent)]'
      )}
    >
      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{getLabel()}</p>
      </div>

      {/* Conflict indicator */}
      {hasConflict && !isRecording && (
        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
      )}

      {/* Customized indicator */}
      {customized && !isRecording && !hasConflict && (
        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--module-accent)]/60" />
      )}

      {/* Keybinding button / recorder */}
      {isRecording ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[color-mix(in_srgb,var(--color-foreground)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-foreground)_5%,transparent)] animate-pulse">
            <CornerDownLeft className="w-3 h-3 text-[color-mix(in_srgb,var(--color-foreground)_70%,transparent)]" />
            <span className="text-xs text-[color-mix(in_srgb,var(--color-foreground)_70%,transparent)] font-medium whitespace-nowrap">
              {t('settingsPage.keybindingsRecording')}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onStopRecording(); }}
            className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            onClick={onStartRecording}
            className={cn(
              'px-2.5 py-1 rounded-md border text-xs font-mono transition-all',
              'hover:border-[color-mix(in_srgb,var(--color-foreground)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-foreground)_5%,transparent)]',
              customized
                ? 'border-[var(--module-accent)]/40 bg-[var(--module-accent-subtle)] text-[var(--module-accent)]'
                : 'border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] text-muted-foreground'
            )}
            title={t('settingsPage.keybindingsClickToRecord')}
          >
            {formatKeyCombo(effectiveCombo)}
          </button>
          {customized && (
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] transition-colors"
              title={t('settingsPage.resetDefaults')}
            >
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
