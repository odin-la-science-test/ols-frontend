import { motion } from 'framer-motion';
import { AlertCircle, WifiOff, ServerCrash, Clock, RefreshCw } from 'lucide-react';
import { useApiError } from '@/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface ApiErrorAlertProps {
  error: unknown;
  fallbackMessageKey?: string;
  className?: string;
  onRetry?: () => void;
}

/**
 * Composant pour afficher les erreurs API avec style différencié
 * selon le type d'erreur (réseau, serveur, validation, etc.)
 */
export function ApiErrorAlert({ error, fallbackMessageKey, className, onRetry }: ApiErrorAlertProps) {
  const { t } = useTranslation();
  const { getErrorInfo } = useApiError();

  if (!error) return null;

  const { message, isNetwork, isTimeout, isServerError, isRetryable } = getErrorInfo(error, fallbackMessageKey);

  // Déterminer l'icône et le style selon le type d'erreur
  const getErrorStyle = () => {
    if (isTimeout) {
      return {
        icon: Clock,
        className: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
      };
    }
    if (isNetwork) {
      return {
        icon: WifiOff,
        className: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
      };
    }
    if (isServerError) {
      return {
        icon: ServerCrash,
        className: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      };
    }
    return {
      icon: AlertCircle,
      className: 'bg-[color-mix(in_srgb,var(--color-destructive)_10%,transparent)] border-[color-mix(in_srgb,var(--color-destructive)_20%,transparent)] text-destructive',
    };
  };

  const { icon: Icon, className: styleClassName } = getErrorStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border text-sm',
        styleClassName,
        className
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {isRetryable && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 px-2 hover:bg-current/10"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          {t('common.retry')}
        </Button>
      )}
    </motion.div>
  );
}
