import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { toast } from '@/hooks';
import { useTranslation } from 'react-i18next';

export const useSessions = () =>
  useQuery({
    queryKey: ['sessions'],
    queryFn: () => authApi.getSessions().then((r) => r.data),
  });

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: t('profile.sessionRevoked') });
    },
  });
};

export const useRevokeAllOtherSessions = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => authApi.revokeAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: t('profile.allSessionsRevoked') });
    },
  });
};
