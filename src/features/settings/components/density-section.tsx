import { useTranslation } from 'react-i18next';
import { Minus, Plus, Rows3 } from 'lucide-react';
import { Label } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores';
import { DensityOption } from './density-option';

// ─── Density & Sizing Section ───

export function DensitySection() {
  const { t } = useTranslation();
  const { density, setDensity, fontSize, setFontSize } = useThemeStore();

  return (
    <FormSection
      id="density"
      title={t('settingsPage.densitySizing')}
      description={t('settingsPage.densitySizingDesc')}
      icon={Rows3}
      delay={2}
    >
      <div className="space-y-5">
        {/* Density Presets */}
        <div className="space-y-2.5">
          <Label className="text-xs font-medium text-muted-foreground">{t('settingsPage.density')}</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'normal', 'comfortable'] as const).map((dOpt) => (
              <DensityOption
                key={dOpt}
                density={dOpt}
                active={density === dOpt}
                onClick={() => setDensity(dOpt)}
              />
            ))}
          </div>
        </div>

        {/* Font Size Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsPage.fontSize')}
            </Label>
            <span className="text-xs font-mono text-muted-foreground">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFontSize(fontSize - 1)}
              disabled={fontSize <= 12}
              className={cn(
                'p-1.5 rounded-md transition-all',
                fontSize <= 12 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'
              )}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="range"
                min={12}
                max={18}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer bg-muted
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-0"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground/50">12</span>
                <span className="text-[10px] text-muted-foreground/50">14</span>
                <span className="text-[10px] text-muted-foreground/50">16</span>
                <span className="text-[10px] text-muted-foreground/50">18</span>
              </div>
            </div>
            <button
              onClick={() => setFontSize(fontSize + 1)}
              disabled={fontSize >= 18}
              className={cn(
                'p-1.5 rounded-md transition-all',
                fontSize >= 18 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 rounded-lg bg-muted/20">
          <p className="text-xs text-muted-foreground mb-2">{t('settingsPage.preview')}</p>
          <div className="space-y-1" style={{ fontSize: `${fontSize}px` }}>
            <p className="font-medium">{t('settingsPage.previewTitle')}</p>
            <p className="text-muted-foreground" style={{ fontSize: `${Math.max(fontSize - 2, 10)}px` }}>
              {t('settingsPage.previewDescription')}
            </p>
          </div>
        </div>

      </div>
    </FormSection>
  );
}
