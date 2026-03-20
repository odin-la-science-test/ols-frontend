import { motion } from 'framer-motion';
import { Logo } from './logo';
import { QuickSettings } from './quick-settings';
import { Sparkles } from '@/components/ui/sparkles';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: React.ReactNode;
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
  subtitle 
}: { 
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const { t } = useTranslation();
  
  return (
    <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {showLogo && <Logo size={100} className="mx-auto mb-6" />}
        <h1 className="text-3xl sm:text-4xl font-bold brand-title tracking-tight">
          {title || t('common.appName')}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {subtitle}
          </p>
        )}
      </motion.div>
  );
}
