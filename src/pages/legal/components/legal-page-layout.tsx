import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { PageFooter, QuickSettings } from '@/components/common';

interface LegalPageLayoutProps {
  titleKey: string;
  icon: LucideIcon;
  lastUpdateKey: string;
  draftNotice?: boolean;
  children: React.ReactNode;
}

export function LegalPageLayout({
  titleKey,
  icon: Icon,
  lastUpdateKey,
  draftNotice,
  children,
}: LegalPageLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative">
      <QuickSettings />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('common.back')}
          </Button>

          <div className="flex items-center gap-3 mb-3">
            <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="text-xl font-bold">{t(titleKey)}</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            {t(lastUpdateKey)}
          </p>
          {draftNotice && (
            <p className="text-xs text-amber-500/80 mt-1 italic">
              {t('legal.terms.draftNotice')}
            </p>
          )}
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {children}
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
