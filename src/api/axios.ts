import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores';
import { ApiError } from './errors';

// Extension de la config Axios pour les options personnalisées
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
    skipErrorTransform?: boolean;
  }
}

// Configuration par défaut
const DEFAULT_TIMEOUT = 15000; // 15 secondes
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 seconde

/**
 * Instance Axios configurée pour l'API
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: DEFAULT_TIMEOUT,
});

/**
 * Délai avant retry (avec backoff exponentiel)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mutex pour eviter les refresh concurrents
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const response = await axios.post('/api/auth/refresh', { refreshToken }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: DEFAULT_TIMEOUT,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    useAuthStore.getState().setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

/**
 * Request interceptor - Ajoute le token JWT à chaque requête
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response interceptor - Gestion centralisée des erreurs avec refresh automatique
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    // Transformer en ApiError
    const apiError = ApiError.fromAxiosError(error);

    // Retry automatique pour les erreurs réseau (sauf si désactivé)
    if (apiError.isRetryable && config && !config.skipErrorTransform) {
      const retryCount = (config as { __retryCount?: number }).__retryCount || 0;

      if (retryCount < MAX_RETRIES) {
        (config as { __retryCount?: number }).__retryCount = retryCount + 1;
        await delay(RETRY_DELAY * Math.pow(2, retryCount));
        return api(config);
      }
    }

    // Tentative de refresh automatique sur 401
    const shouldRedirect = !config?.skipAuthRedirect;
    if (apiError.type === 'UNAUTHORIZED' && shouldRedirect && config) {
      const alreadyRetried = (config as { __authRetry?: boolean }).__authRetry;
      if (!alreadyRetried) {
        // Mutex : un seul refresh a la fois
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = tryRefreshToken().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }

        const newToken = await (refreshPromise ?? tryRefreshToken());
        if (newToken) {
          (config as { __authRetry?: boolean }).__authRetry = true;
          config.headers.Authorization = `Bearer ${newToken}`;
          return api(config);
        }
      }

      // Refresh echoue ou deja retente -> logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Toujours rejeter avec notre ApiError typée
    return Promise.reject(apiError);
  }
);

export default api;

// Ré-exporter les utilitaires d'erreur pour faciliter l'import
export * from './errors';
