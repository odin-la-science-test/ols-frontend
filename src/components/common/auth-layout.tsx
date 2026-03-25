import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Logo } from './logo';
import { BetaBadge } from './beta-badge';
import { QuickSettings } from './quick-settings';
import { Sparkles } from '@/components/ui/sparkles';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-background">
      <Sparkles density="subtle" />
      
      <QuickSettings />

      <div className="w-full relative z-10 flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

export function AuthHeader({
  showLogo = true,
  title,
  subtitle,
  compact = false,
}: {
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
        className={compact ? "text-center mb-4" : "text-center mb-8"}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {showLogo && <Logo size={compact ? 64 : 100} className={compact ? "mx-auto mb-3" : "mx-auto mb-6"} />}
        <h1 className={`font-bold brand-title tracking-tight flex items-center justify-center gap-2 ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}>
          {title || t('common.appName')}
          <BetaBadge className="text-[10px]" />
        </h1>
        {subtitle && (
          <p className={`text-muted-foreground ${compact ? "mt-1 text-sm" : "mt-2 text-sm sm:text-base"}`}>
            {subtitle}
          </p>
        )}
      </motion.div>
  );
}
