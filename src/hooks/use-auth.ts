import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi, type LoginCredentials, type RegisterData, type AuthResponse } from '@/api';
import { useAuthStore } from '@/stores';
import { syncOnLogin, initPreferencesSync, stopPreferencesSync } from '@/lib/preferences-sync';
import type { AxiosResponse } from 'axios';

const useLoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  return async (response: AxiosResponse<AuthResponse>) => {
    const { user } = response.data;
    setAuth(user);
    queryClient.invalidateQueries({ queryKey: ['modules'] });
    await syncOnLogin();
    initPreferencesSync();
    navigate(from, { replace: true });
  };
};

export const useLogin = () => {
  const handleSuccess = useLoginSuccess();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: handleSuccess,
  });
};

export const useGuestLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  return useMutation({
    mutationFn: authApi.guest,
    onSuccess: async (response) => {
      const { user } = response.data;
      setAuth(user);
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      await syncOnLogin();
      initPreferencesSync();
      navigate(from, { replace: true });
    },
  });
};

export const useRegister = () => {
  const handleSuccess = useLoginSuccess();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: handleSuccess,
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    stopPreferencesSync();
    try {
      await authApi.logout();
    } catch {
      // Ignorer les erreurs de logout serveur
    }
    logout();
    navigate('/login');
  };

  return { logout: handleLogout };
};
