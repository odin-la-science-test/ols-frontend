import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface UseOptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: QueryKey;
  /** Optimistically updates the cached data before the server responds. */
  updateCache: (oldData: TData[] | undefined, variables: TVariables) => TData[];
  /** Optional i18n key for the error toast (defaults to 'common.error'). */
  errorMessageKey?: string;
}

export function useOptimisticMutation<TData, TVariables>(
  options: UseOptimisticMutationOptions<TData, TVariables>,
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { mutationFn, queryKey, updateCache, errorMessageKey } = options;

  return useMutation<TData, Error, TVariables, { snapshot: TData[] | undefined }>({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const snapshot = queryClient.getQueryData<TData[]>(queryKey);
      queryClient.setQueryData<TData[]>(queryKey, (old) => updateCache(old, variables));
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData<TData[]>(queryKey, context.snapshot);
      }
      logger.warn('Optimistic mutation failed, rolled back', _error);
      toast({ title: t(errorMessageKey ?? 'common.error'), variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
