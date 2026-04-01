import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo, PageFooter } from '@/components/common';
import { APP_VERSION } from '@/lib/app-version';

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <motion.footer
      className="relative z-10 border-t border-border/30 bg-muted/30"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={24} animate={false} />
              <span className="text-sm font-bold text-foreground">{t('common.appName')}</span>
            </div>
            <p className="text-xs text-muted-foreground/60">v{APP_VERSION}</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">
              {t('landing.footer.product.title')}
            </h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.product.features')}</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.product.pricing')}</a></li>
              <li><a href="#tools" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.product.modules')}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">
              {t('landing.footer.company.title')}
            </h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.company.about')}</a></li>
              <li><a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.company.contact')}</a></li>
              <li><a href="#careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.company.careers')}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">
              {t('landing.footer.legal.title')}
            </h4>
            <ul className="space-y-2">
              <li><Link to="/mentions-legales" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.legal.mentions')}</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.legal.terms')}</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.legal.privacy')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/20">
          <PageFooter showVersion className="py-0" />
        </div>
      </div>
    </motion.footer>
  );
}
