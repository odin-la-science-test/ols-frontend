import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { authApi } from '@/api';
import { syncOnLogin, initPreferencesSync } from '@/lib/preferences-sync';
import { Loader2 } from 'lucide-react';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const error = searchParams.get('error');
    if (error) {
      const message = searchParams.get('message') || '';
      navigate(`/login?error=${error}&message=${encodeURIComponent(message)}`, { replace: true });
      return;
    }

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true });
      return;
    }

    // Effacer les tokens de l'URL immediatement
    window.history.replaceState({}, '', '/oauth-callback');

    // Stocker temporairement le token pour que l'intercepteur Axios l'utilise
    useAuthStore.setState({ token: accessToken, refreshToken });

    authApi.me()
      .then(async (response) => {
        setAuth(response.data, accessToken, refreshToken);
        await syncOnLogin();
        initPreferencesSync();
        navigate('/', { replace: true });
      })
      .catch(() => {
        useAuthStore.getState().logout();
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
