import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui';
import { GoogleIcon } from '@/components/ui/icons/google-icon';

export function OAuthProviders() {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        className="w-full opacity-50 cursor-not-allowed"
        disabled
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        {t('auth.continueWithGoogle')}
        <span className="ml-auto text-xs text-muted-foreground">{t('auth.comingSoon')}</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full opacity-50 cursor-not-allowed"
        disabled
      >
        <GraduationCap className="w-5 h-5 mr-2" />
        {t('auth.continueWithUniversity')}
        <span className="ml-auto text-xs text-muted-foreground">{t('auth.comingSoon')}</span>
      </Button>
    </div>
  );
}
