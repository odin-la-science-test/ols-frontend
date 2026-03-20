import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { ErrorShell } from '@/components/common';

export function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  
  let errorMessage: string;
  let errorDetail: string;

  if (isRouteErrorResponse(error)) {
    // page x not found or similar
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetail = error.data?.message || t('errors.generic');
  } else if (error instanceof Error) {
    errorMessage = t('errors.unexpected');
    errorDetail = error.message;
  } else if (typeof error === 'string') {
    errorMessage = t('errors.unexpected');
    errorDetail = error;
  } else {
    errorMessage = t('errors.unexpected');
    errorDetail = t('errors.unknown');
  }

  return (
    <ErrorShell>
      <motion.div
        className="text-center relative z-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="text-6xl sm:text-8xl font-bold gradient-text leading-none mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
        >
          {t('errors.oops')}
        </motion.div>
        
        <motion.h2 
          className="text-xl sm:text-2xl font-semibold mb-3 text-destructive"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {errorMessage}
        </motion.h2>
        
        <motion.p 
          className="text-muted-foreground mb-8 text-sm sm:text-base font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto break-all"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {errorDetail}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button asChild variant="default" size="lg">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              {t('common.home')}
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.retry')}
          </Button>
        </motion.div>
      </motion.div>
    </ErrorShell>
  );
}
