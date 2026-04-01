import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '@/lib/app-version';

interface PageFooterProps {
  showVersion?: boolean;
  className?: string;
}

export function PageFooter({ showVersion = false, className }: PageFooterProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className={`text-center py-6 text-xs text-muted-foreground/40 ${className ?? ''}`}>
      <div>
        &copy; {year} {t('common.appName')}
        {showVersion && <> &middot; v{APP_VERSION}</>}
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
        <Link to="/mentions-legales" className="hover:text-muted-foreground transition-colors">
          {t('legal.footerMentions')}
        </Link>
        <span>&middot;</span>
        <Link to="/terms" className="hover:text-muted-foreground transition-colors">
          {t('legal.footerTerms')}
        </Link>
        <span>&middot;</span>
        <Link to="/privacy" className="hover:text-muted-foreground transition-colors">
          {t('legal.footerPrivacy')}
        </Link>
      </div>
    </footer>
  );
}
