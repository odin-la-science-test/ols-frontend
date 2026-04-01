import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/api/ai-api';

export function useTextCorrection() {
  return useMutation({
    mutationFn: (text: string) =>
      aiApi.correctText({ text }).then((r) => r.data),
  });
}
