import { useTranslation } from 'react-i18next';
import { Palette, Sparkles, Layout, Monitor, Moon, MoonStar, SunMoon, Sun, Blend, CircleDot, Droplets } from 'lucide-react';
import { Label } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { useThemeStore, useWorkspaceStore } from '@/stores';
import { getFamilies, getCurrentFamily } from '@/lib/theme-presets';
import { FamilyCard } from './family-card';
import { cn } from '@/lib/utils';
import type { LayoutMode } from '@/stores/workspace-store';

// ─── Appearance Section ───

const LAYOUT_MODES: { id: LayoutMode; labelKey: string; descKey: string; icon: typeof Layout }[] = [
  { id: 'classic', labelKey: 'settingsPage.layoutClassic', descKey: 'settingsPage.layoutClassicDesc', icon: Layout },
  { id: 'ide', labelKey: 'settingsPage.layoutIde', descKey: 'settingsPage.layoutIdeDesc', icon: Monitor },
];

export function AppearanceSection() {
  const { t } = useTranslation();
  const { themePreset, theme, setMode, setFamily, intensity, setIntensity } = useThemeStore();
  const { layoutMode, setLayoutMode } = useWorkspaceStore();

  const activeFamilyId = getCurrentFamily(themePreset).id;

  return (
    <FormSection
      id="appearance"
      title={t('settingsPage.appearance')}
      description={t('settingsPage.appearanceDesc')}
      icon={Palette}
      delay={0}
    >
      <div className="space-y-5">
        {/* Layout Mode */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Layout className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">{t('settingsPage.layoutMode')}</Label>
          </div>
          <p className="text-xs text-muted-foreground/70">{t('settingsPage.layoutModeDesc')}</p>
          <div className="grid grid-cols-2 gap-2">
            {LAYOUT_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = layoutMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setLayoutMode(mode.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    isActive
                      ? 'border-primary bg-primary/8 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{t(mode.labelKey)}</div>
                    <div className="text-xs text-muted-foreground/70 truncate">{t(mode.descKey)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brightness Mode */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">{t('settingsPage.brightnessMode')}</Label>
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50 w-fit">
            {(['dark', 'dim', 'light', 'onyx'] as const).map((m) => {
              const isActive = theme === m;
              const Icon = m === 'dark' ? Moon : m === 'dim' ? SunMoon : m === 'light' ? Sun : MoonStar;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    isActive
                      ? 'bg-primary/15 shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(`settingsPage.mode${m.charAt(0).toUpperCase() + m.slice(1)}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Intensity */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Blend className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">{t('settingsPage.colorIntensity')}</Label>
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50 w-fit">
            {([
              { id: 'vivid' as const, labelKey: 'settingsPage.intensityVivid', Icon: Palette },
              { id: 'subtle' as const, labelKey: 'settingsPage.intensitySubtle', Icon: Droplets },
              { id: 'neutral' as const, labelKey: 'settingsPage.intensityNeutral', Icon: CircleDot },
            ]).map(({ id, labelKey, Icon }) => {
              const isActive = intensity === id;
              return (
                <button
                  key={id}
                  onClick={() => setIntensity(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    isActive
                      ? 'bg-primary/15 shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Color Families */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsPage.colorFamily')}
            </Label>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {getFamilies().map((family) => (
              <FamilyCard
                key={family.id}
                family={family}
                active={activeFamilyId === family.id}
                onClick={() => setFamily(family.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </FormSection>
  );
}
