import { useTranslation } from 'react-i18next';
import { Sun, Moon, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { useThemeStore, useLanguageStore, LANGUAGES } from '@/stores';

export function QuickSettings() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
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

  const getLanguageShortLabel = (code: string) => {
    switch (code) {
      case 'fr':
        return t('settings.languages.short.french');
      case 'en':
        return t('settings.languages.short.english');
      default:
        return code.toUpperCase();
    }
  };

  return (
    <motion.div
      className="absolute top-4 right-4 z-50 flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      {/* Theme Toggle */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full bg-card border-border shadow-md hover:bg-muted"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('settings.toggleTheme')}</TooltipContent>
      </Tooltip>

      {/* Language Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-card border-border shadow-md hover:bg-muted font-medium text-xs"
          >
            {getLanguageShortLabel(language)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] backdrop-blur-xl border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] shadow-2xl">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="cursor-pointer"
            >
              <span className="mr-2">{lang.flag}</span>
              {getLanguageLabel(lang.code)}
              {language === lang.code && <Check className="ml-auto h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
