import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus } from 'lucide-react';
import { useGuestGuard } from '@/hooks';

const DISMISS_KEY = 'ols-guest-banner-dismissed';

export function GuestBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isGuest } = useGuestGuard();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  if (!isGuest || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="shrink-0 flex items-center justify-center gap-3 px-4 py-1.5 bg-primary/10 border-b border-primary/20 text-sm">
      <span className="text-muted-foreground">{t('guest.banner.message')}</span>
      <button
        onClick={() => navigate('/register')}
        className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <UserPlus className="w-3 h-3" />
        {t('guest.banner.cta')}
      </button>
      <button
        onClick={handleDismiss}
        className="p-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label={t('guest.banner.dismiss')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
