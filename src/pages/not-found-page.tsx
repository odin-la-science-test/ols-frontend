import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { ErrorShell } from '@/components/common';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <ErrorShell>
      <motion.div
        className="text-center relative z-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="text-[10rem] sm:text-[12rem] font-bold gradient-text leading-none mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
        >
          404
        </motion.div>
        
        <motion.h2 
          className="text-xl sm:text-2xl font-semibold mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t('errors.pageNotFound')}
        </motion.h2>
        
        <motion.p 
          className="text-muted-foreground mb-8 text-sm sm:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {t('errors.pageNotFoundDesc')}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button asChild variant="default" size="lg">
            <Link to="/">
              <Home className="h-4 w-4" />
              {t('errors.goHome')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
            <span className="cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </ErrorShell>
  );
}
