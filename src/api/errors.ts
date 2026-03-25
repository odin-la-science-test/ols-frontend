import { AxiosError } from 'axios';

/**
 * Types d'erreurs API
 */
export type ApiErrorType =
  | 'NETWORK_ERROR'      // Serveur non disponible / pas de connexion
  | 'TIMEOUT'            // Timeout de la requête
  | 'SERVER_ERROR'       // Erreur 500+
  | 'VALIDATION_ERROR'   // Erreur 400
  | 'UNAUTHORIZED'       // Erreur 401
  | 'FORBIDDEN'          // Erreur 403
  | 'NOT_FOUND'          // Erreur 404
  | 'RATE_LIMITED'       // Erreur 429
  | 'UNKNOWN';           // Autre erreur

const RETRYABLE_TYPES: ApiErrorType[] = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'];

/**
 * Classe d'erreur personnalisée pour les erreurs API
 * Permet une gestion typée et cohérente des erreurs dans toute l'application
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly status?: number;
  public readonly originalError: AxiosError;
  public readonly isRetryable: boolean;

  constructor(
    type: ApiErrorType,
    message: string,
    originalError: AxiosError,
    status?: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.originalError = originalError;
    this.isRetryable = this.checkIfRetryable();
    
    // Maintenir la stack trace correcte
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  private checkIfRetryable(): boolean {
    // Ces erreurs peuvent être réessayées automatiquement
    return RETRYABLE_TYPES.includes(this.type);
  }

  /**
   * Vérifie si c'est une erreur réseau (serveur indisponible)
   */
  get isNetworkError(): boolean {
    return this.type === 'NETWORK_ERROR' || this.type === 'TIMEOUT';
  }

  /**
   * Vérifie si c'est une erreur serveur (500+)
   */
  get isServerError(): boolean {
    return this.type === 'SERVER_ERROR';
  }

  /**
   * Crée une ApiError à partir d'une AxiosError
   */
  static fromAxiosError(error: AxiosError): ApiError {
    const type = detectErrorType(error);
    const message = extractErrorMessage(error) || '';
    const status = error.response?.status;
    
    return new ApiError(type, message, error, status);
  }
}

/**
 * Détecte le type d'erreur à partir d'une AxiosError
 */
export function detectErrorType(error: AxiosError): ApiErrorType {
  // Pas de réponse = problème réseau ou serveur non disponible
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return 'NETWORK_ERROR';
    }
    return 'NETWORK_ERROR';
  }

  const status = error.response.status;

  switch (true) {
    case status === 401: return 'UNAUTHORIZED';
    case status === 403: return 'FORBIDDEN';
    case status === 404: return 'NOT_FOUND';
    case status === 429: return 'RATE_LIMITED';
    case status === 400: return 'VALIDATION_ERROR';
    case status >= 500: return 'SERVER_ERROR';
    default: return 'UNKNOWN';
  }
}

/**
 * Extrait le message d'erreur de la réponse API
 */
export function extractErrorMessage(error: AxiosError): string | undefined {
  const data = error.response?.data as { message?: string } | undefined;
  return data?.message;
}

/**
 * Type guard pour vérifier si une erreur est une ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard pour vérifier si c'est une erreur réseau
 */
export function isNetworkError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.isNetworkError;
  }
  return false;
}
