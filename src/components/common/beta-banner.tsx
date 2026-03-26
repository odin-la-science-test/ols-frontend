'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { IS_BETA } from '@/lib/app-version';

const STORAGE_KEY = 'ols-beta-banner-dismissed';

export function BetaBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (!IS_BETA || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage indisponible
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
          <div className="flex items-start gap-3 max-w-5xl mx-auto">
            <FlaskConical className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-500">
                {t('beta.bannerTitle')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('beta.bannerDescription')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="shrink-0 text-xs text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 h-7 px-2"
            >
              {t('beta.bannerDismiss')}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
