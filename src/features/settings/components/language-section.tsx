import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { useLanguageStore, LANGUAGES } from '@/stores';

// ─── Language Section ───

export function LanguageSection() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguageStore();

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'fr':
        return t('settings.languages.french');
      case 'en':
        return t('settings.languages.english');
      default:
        return code.toUpperCase();
    }
  };

  const getLanguageFlag = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang?.flag || '\uD83C\uDF10';
  };

  return (
    <FormSection
      id="language"
      title={t('settingsPage.language')}
      description={t('settingsPage.languageDesc')}
      icon={Globe}
      delay={1}
    >
      <div className="space-y-1.5">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150',
              'text-left',
              language === lang.code
                ? 'bg-muted/40 text-foreground'
                : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getLanguageFlag(lang.code)}</span>
              <span className="text-sm font-medium">{getLanguageLabel(lang.code)}</span>
            </div>
            {language === lang.code && (
              <Check className={'w-4 h-4 text-[var(--module-accent)]'} />
            )}
          </button>
        ))}
      </div>
    </FormSection>
  );
}
