import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// USE RETRY FEEDBACK — Wraps an async fn with retry logic + toast feedback
// ═══════════════════════════════════════════════════════════════════════════

interface UseRetryFeedbackOptions {
  maxRetries?: number;
  delayMs?: number;
}

interface UseRetryFeedbackReturn<T> {
  execute: () => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
}

export function useRetryFeedback<T>(
  fn: () => Promise<T>,
  options?: UseRetryFeedbackOptions,
): UseRetryFeedbackReturn<T> {
  const { t } = useTranslation();
  const maxRetries = options?.maxRetries ?? 3;
  const delayMs = options?.delayMs ?? 1000;
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (): Promise<T> => {
    retryCountRef.current = 0;
    setRetryCount(0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        if (attempt > 0) {
          toast({ description: t('common.reconnected') });
        }
        setIsRetrying(false);
        return result;
      } catch (err) {
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw err;
        }
        retryCountRef.current = attempt + 1;
        setRetryCount(attempt + 1);
        setIsRetrying(true);
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, err);
        toast({ description: t('common.retrying', { count: attempt + 1 }) });
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // Unreachable, but TypeScript needs it
    throw new Error('Retry exhausted');
  }, [fn, maxRetries, delayMs, t]);

  return { execute, isRetrying, retryCount };
}
