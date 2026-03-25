'use client';

// ═══════════════════════════════════════════════════════════════════════════
// ModeHints — badges indicateurs de préfixe (> @ #) dans la command palette
// ═══════════════════════════════════════════════════════════════════════════

export interface ModeHintsProps {
  t: (key: string) => string;
}

export function ModeHints({ t }: ModeHintsProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[color-mix(in_srgb,var(--color-border)_30%,transparent)]">
      <span className="text-[10px] text-muted-foreground/60">{t('commandPalette.hints.label')}</span>
      <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] rounded font-mono">
        {t('commandPalette.hints.commands')}
      </span>
      <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] rounded font-mono">
        {t('commandPalette.hints.entities')}
      </span>
      <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] rounded font-mono">
        {t('commandPalette.hints.tags')}
      </span>
    </div>
  );
}
