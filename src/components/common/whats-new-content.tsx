import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// WHATS NEW CONTENT — Structured feature list for the WhatsNew modal
// ═══════════════════════════════════════════════════════════════════════════

const FEATURE_KEYS = [
  'whatsNew.features.pagination',
  'whatsNew.features.annotations',
  'whatsNew.features.studyCollections',
  'whatsNew.features.batchDelete',
  'whatsNew.features.offlineMode',
  'whatsNew.features.comparison',
  'whatsNew.features.tips',
  'whatsNew.features.favorites',
] as const;

export function WhatsNewContent() {
  const { t } = useTranslation();

  return (
    <ul className="space-y-2">
      {FEATURE_KEYS.map((key) => (
        <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 mt-0.5 shrink-0 text-foreground/60" strokeWidth={2} />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  );
}
