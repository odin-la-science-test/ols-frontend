import { useTranslation } from 'react-i18next';
import { Puzzle } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { Label, Input } from '@/components/ui';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { registry } from '@/lib/module-registry';
import { useModuleSettingsStore } from '@/stores/module-settings-store';
import type { ModuleSettingField } from '@/lib/module-registry/types';
import { cn } from '@/lib/utils';

// ─── Mini Toggle (reused pattern from notifications-section) ───

function MiniToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="shrink-0">
      <div className={cn(
        'relative w-8 h-[18px] rounded-full transition-colors duration-200',
        checked ? 'bg-foreground/60' : 'bg-border',
      )}>
        <div className={cn(
          'absolute top-[1px] w-4 h-4 rounded-full shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[14px] bg-background' : 'translate-x-[1px] bg-background border border-border',
        )} />
      </div>
    </button>
  );
}

// ─── Field Renderers ───

function ToggleField({ field }: { field: Extract<ModuleSettingField, { type: 'toggle' }> }) {
  const { t } = useTranslation();
  const { getValue, setValue } = useModuleSettingsStore();
  const checked = getValue<boolean>(field.key, field.defaultValue);

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
      <Label className="text-sm font-medium cursor-pointer">{t(field.labelKey)}</Label>
      <MiniToggle checked={checked} onChange={() => setValue(field.key, !checked)} />
    </div>
  );
}

function SelectField({ field }: { field: Extract<ModuleSettingField, { type: 'select' }> }) {
  const { t } = useTranslation();
  const { getValue, setValue } = useModuleSettingsStore();
  const value = getValue<string>(field.key, field.defaultValue);

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
      <Label className="text-sm font-medium">{t(field.labelKey)}</Label>
      <Select value={value} onValueChange={(v) => setValue(field.key, v)}>
        <SelectTrigger className="w-48 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NumberField({ field }: { field: Extract<ModuleSettingField, { type: 'number' }> }) {
  const { t } = useTranslation();
  const { getValue, setValue } = useModuleSettingsStore();
  const value = getValue<number>(field.key, field.defaultValue);

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
      <Label className="text-sm font-medium">{t(field.labelKey)}</Label>
      <Input
        type="number"
        className="w-24 h-8 text-xs"
        value={value}
        min={field.min}
        max={field.max}
        onChange={(e) => setValue(field.key, Number(e.target.value))}
      />
    </div>
  );
}

function TextField({ field }: { field: Extract<ModuleSettingField, { type: 'text' }> }) {
  const { t } = useTranslation();
  const { getValue, setValue } = useModuleSettingsStore();
  const value = getValue<string>(field.key, field.defaultValue);

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
      <Label className="text-sm font-medium">{t(field.labelKey)}</Label>
      <Input
        type="text"
        className="w-48 h-8 text-xs"
        value={value}
        onChange={(e) => setValue(field.key, e.target.value)}
      />
    </div>
  );
}

// ─── Field Dispatcher ───

function SettingFieldRow({ field }: { field: ModuleSettingField }) {
  switch (field.type) {
    case 'toggle':
      return <ToggleField field={field} />;
    case 'select':
      return <SelectField field={field} />;
    case 'number':
      return <NumberField field={field} />;
    case 'text':
      return <TextField field={field} />;
  }
}

// ─── Module Settings Section ───

export function ModuleSettingsSection() {
  const { t } = useTranslation();
  const moduleSettings = registry.getSettings();

  if (moduleSettings.length === 0) return null;

  return (
    <FormSection
      id="module-settings"
      title={t('settingsPage.moduleSettings')}
      description=""
      icon={Puzzle}
      delay={15}
    >
      <div className="space-y-6">
        {moduleSettings.map(({ module, sections }) =>
          sections.map((section) => (
            <div key={`${module.id}-${section.titleKey}`} className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground px-3">
                {t(section.titleKey)}
              </Label>
              <div className="space-y-0.5">
                {section.fields.map((field) => (
                  <SettingFieldRow key={field.key} field={field} />
                ))}
              </div>
            </div>
          )),
        )}
      </div>
    </FormSection>
  );
}
