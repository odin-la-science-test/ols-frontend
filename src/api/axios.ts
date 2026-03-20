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
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: DEFAULT_TIMEOUT,
});

/**
 * Délai avant retry (avec backoff exponentiel)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
 * Response interceptor - Gestion centralisée des erreurs
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
        
        // Backoff exponentiel
        await delay(RETRY_DELAY * Math.pow(2, retryCount));
        
        return api(config);
      }
    }
    
    // Gestion de l'authentification
    const shouldRedirect = !config?.skipAuthRedirect;
    if (apiError.type === 'UNAUTHORIZED' && shouldRedirect) {
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
