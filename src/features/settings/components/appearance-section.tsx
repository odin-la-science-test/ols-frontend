import { useTranslation } from 'react-i18next';
import { Palette, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { useThemeStore } from '@/stores';
import { THEME_PRESETS } from '@/lib/theme-presets';
import { PresetCard } from './preset-card';

// ─── Appearance Section ───

export function AppearanceSection() {
  const { t } = useTranslation();
  const { themePreset, setThemePreset } = useThemeStore();

  return (
    <FormSection
      id="appearance"
      title={t('settingsPage.appearance')}
      description={t('settingsPage.appearanceDesc')}
      icon={Palette}
      delay={0}
    >
      <div className="space-y-5">
        {/* Theme Presets */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">{t('settingsPage.themePreset')}</Label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {THEME_PRESETS.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                active={themePreset === preset.id}
                onClick={() => setThemePreset(preset.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </FormSection>
  );
}
