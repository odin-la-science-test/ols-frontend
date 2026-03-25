import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCommandPaletteStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE PAGE - Empty state affiché dans le shell quand aucun onglet
// ═══════════════════════════════════════════════════════════════════════════

export function WorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { open: openCommandPalette } = useCommandPaletteStore();

  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted text-muted-foreground">
          <LayoutGrid className="h-8 w-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t('workspacePage.title')}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('workspacePage.description')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => openCommandPalette()}>
            <Search className="h-4 w-4 mr-2" />
            {t('workspacePage.openPalette')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            {t('workspacePage.goHome')}
          </Button>
        </div>

        {/* Shortcut hint */}
        <p className="text-xs text-muted-foreground/60">
          {t('workspacePage.hint')}
        </p>
      </div>
    </div>
  );
}
