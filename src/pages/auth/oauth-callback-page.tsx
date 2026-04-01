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

    // Les cookies httpOnly sont deja set par le backend lors du redirect
    // On recupere le profil utilisateur via /auth/me
    authApi.me()
      .then(async (response) => {
        setAuth(response.data);
        await syncOnLogin();
        initPreferencesSync();
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
