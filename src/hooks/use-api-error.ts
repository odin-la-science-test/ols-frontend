import { useTranslation } from 'react-i18next';
import { ApiErrorType, isApiError } from '@/api/errors';

export interface ApiErrorInfo {
  message: string;
  isNetwork: boolean;
  isTimeout: boolean;
  isServerError: boolean;
  isRetryable: boolean;
  status?: number;
}

/**
 * Hook pour extraire et formater les messages d'erreur API
 * Utilise la classe ApiError pour une gestion typée des erreurs
 */
export function useApiError() {
  const { t } = useTranslation();

  // Explicit mapping keeps i18n extraction and TS safety without a long switch
  const errorTranslators: Record<ApiErrorType, () => string> = {
    NETWORK_ERROR: () => t('errors.networkError'),
    TIMEOUT: () => t('errors.timeout'),
    SERVER_ERROR: () => t('errors.serverError'),
    VALIDATION_ERROR: () => t('errors.validationError'),
    UNAUTHORIZED: () => t('errors.unauthorized'),
    FORBIDDEN: () => t('errors.forbidden'),
    NOT_FOUND: () => t('errors.notFound'),
    RATE_LIMITED: () => t('errors.rateLimited'),
    UNKNOWN: () => t('errors.unknown'),
  };

  const translateErrorType = (type: ApiErrorType) => (errorTranslators[type] || errorTranslators.UNKNOWN)();

  const getErrorInfo = (error: unknown, fallbackKey = 'errors.unknown'): ApiErrorInfo => {
    if (!error) {
      return { 
        message: '', 
        isNetwork: false, 
        isTimeout: false, 
        isServerError: false,
        isRetryable: false,
      };
    }

    // Si c'est une ApiError (cas standard après refactoring)
    if (isApiError(error)) {
      const fromBackend = error.message && !error.message.startsWith('errors.') && error.message.length < 200
        ? error.message
        : undefined;
      const message = fromBackend || translateErrorType(error.type);
      
      return {
        message,
        isNetwork: error.type === 'NETWORK_ERROR',
        isTimeout: error.type === 'TIMEOUT',
        isServerError: error.isServerError,
        isRetryable: error.isRetryable,
        status: error.status,
      };
    }

    // Fallback pour les erreurs non-API — ne jamais exposer le message brut
    if (error instanceof Error) {
      console.error('[ApiError] Non-API error:', error.message);
    }
    return {
      message: t(fallbackKey),
      isNetwork: false,
      isTimeout: false,
      isServerError: false,
      isRetryable: false,
    };
  };

  return { getErrorInfo };
}
