import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api';

export const usersKeys = {
  search: (query: string) => ['users', 'search', query] as const,
};

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: usersKeys.search(query),
    queryFn: () => usersApi.search(query).then((res) => res.data),
    enabled: query.length >= 2,
  });
};
