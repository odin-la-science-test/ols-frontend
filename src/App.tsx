import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider, Toaster } from '@/components/ui';
import { router } from './router';
import { useThemeStore, useLanguageStore } from './stores';
import './i18n';
import { useTranslation } from 'react-i18next';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { t } = useTranslation();
  const initTheme = useThemeStore((state) => state.initTheme);
  const initLanguage = useLanguageStore((state) => state.initLanguage);

  // Initialiser le thème et la langue au montage
  useEffect(() => {
    initTheme();
    initLanguage();
  }, [initTheme, initLanguage]);

  // Update document title based on language
  useEffect(() => {
    document.title = `${t('common.appName')} - ${t('common.tagline')}`;
  }, [t]);

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </TooltipProvider>
  );
}

export default App;
