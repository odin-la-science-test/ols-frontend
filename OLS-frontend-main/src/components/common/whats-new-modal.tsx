'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { APP_VERSION } from '@/lib/app-version';
import { useWhatsNewStore } from '@/stores/whats-new-store';
import { WhatsNewContent } from './whats-new-content';
import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// WHATS NEW MODAL — Auto-shows once per version on app load
//
// Reads its open/close state from useWhatsNewStore (persisted).
// Render at root level (app-shell.tsx) — it self-triggers via useEffect.
// ═══════════════════════════════════════════════════════════════════════════

export function WhatsNewModal() {
  const { t } = useTranslation();
  const { isOpen, open, close, shouldShow } = useWhatsNewStore();

  useEffect(() => {
    if (shouldShow()) {
      logger.debug('[whats-new] New version detected, showing modal');
      open();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center scrim-heavy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant="glass" className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" strokeWidth={1.5} />
                  {t('whatsNew.title', { version: APP_VERSION })}
                </CardTitle>
                <CardDescription>
                  {t('whatsNew.description')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <WhatsNewContent />
              </CardContent>

              <CardFooter className="justify-end">
                <Button variant="outline" onClick={close}>
                  {t('whatsNew.dismiss')}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
