import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, Check, Menu, X, Wand2, Sparkles as SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo, BetaBadge } from '@/components/common';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useThemeStore, useLanguageStore, LANGUAGES } from '@/stores';

interface NavLink {
  labelKey: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { labelKey: 'landing.nav.features', href: '#features' },
  { labelKey: 'landing.nav.security', href: '#security' },
  { labelKey: 'landing.nav.tools', href: '#tools' },
  { labelKey: 'landing.nav.pricing', href: '#pricing' },
];

export function LandingNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme, isDesignEnabled, setDesignEnabled, isParticlesEnabled, setParticlesEnabled } = useThemeStore();
  const { language, changeLanguage } = useLanguageStore();

  return (
    <nav 
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-500",
        (isDesignEnabled || isParticlesEnabled)
          ? "top-[30px] mx-4 sm:mx-6 lg:mx-8 bg-background/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-sm" 
          : "top-0 bg-background/95 backdrop-blur-md border-b border-border/50"
      )}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Logo size={28} animate={false} />
          <span className="text-base font-bold tracking-tight text-foreground hidden sm:inline">
            {t('common.appName')}
          </span>
          <BetaBadge className="text-[8px]" />
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ labelKey, href }) => (
            <a
              key={labelKey}
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {t(labelKey)}
            </a>
          ))}
        </div>

        {/* Right side: settings + auth */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setDesignEnabled(!isDesignEnabled)} 
            className={cn(
              "rounded-full h-8 w-8 transition-colors",
              isDesignEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
            title={isDesignEnabled ? "Désactiver le design" : "Activer le design"}
          >
            <Wand2 className="h-3.5 w-3.5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setParticlesEnabled(!isParticlesEnabled)} 
            className={cn(
              "rounded-full h-8 w-8 transition-colors",
              isParticlesEnabled ? "text-[#7C3AED] bg-[#7C3AED]/10" : "text-muted-foreground"
            )}
            title={isParticlesEnabled ? "Désactiver les particules" : "Activer les particules"}
          >
            <SparklesIcon className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-xs font-semibold">
                {language === 'fr' ? t('settings.languages.short.french') : t('settings.languages.short.english')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.code === 'fr' ? t('settings.languages.french') : t('settings.languages.english')}
                  {language === lang.code && <Check className="ml-auto h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-5 bg-border/30 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-muted-foreground hover:text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              {t('landing.nav.login')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-primary-foreground font-semibold bg-primary hover:opacity-90 px-5 py-2 rounded-lg transition-all"
            >
              {t('landing.nav.register')}
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden ml-1 p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t(menuOpen ? 'landing.nav.menuClose' : 'landing.nav.menuOpen')}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-background border-b border-border/30"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ labelKey, href }) => (
                <a
                  key={labelKey}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-muted-foreground py-2.5 px-3 rounded-lg hover:bg-muted font-medium"
                >
                  {t(labelKey)}
                </a>
              ))}
              <div className="border-t border-border/30 mt-2 pt-3 flex flex-col gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-foreground font-medium py-2.5 px-3 rounded-lg hover:bg-muted text-left"
                >
                  {t('landing.nav.login')}
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm text-primary-foreground font-semibold bg-primary py-2.5 px-3 rounded-lg text-center"
                >
                  {t('landing.nav.register')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
