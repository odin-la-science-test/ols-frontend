import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, type LoginCredentials, type RegisterData, type AuthResponse } from '@/api';
import { useAuthStore } from '@/stores';
import type { AxiosResponse } from 'axios';

const useLoginSuccess = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return (response: AxiosResponse<AuthResponse>) => {
    const { user, token, accessToken } = response.data;
    setAuth(user, token || accessToken || '');
    // Invalider le cache pour re-fetch les données avec le nouveau user
    queryClient.invalidateQueries({ queryKey: ['modules'] });
    navigate('/');
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
  const handleSuccess = useLoginSuccess();

  return useMutation({
    mutationFn: authApi.guest,
    onSuccess: handleSuccess,
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: () => {
      navigate('/login');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return { logout: handleLogout };
};
