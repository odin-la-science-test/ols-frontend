import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { SectionWrapper, SectionHeader } from '../components';

export function PricingSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const packFeatures = [
    t('landing.pricing.packComplete.features.unlimited'),
    t('landing.pricing.packComplete.features.suite'),
    t('landing.pricing.packComplete.features.mobile'),
    t('landing.pricing.packComplete.features.support'),
  ];

  const enterpriseFeatures = [
    t('landing.pricing.enterprise.features.hosting'),
    t('landing.pricing.enterprise.features.api'),
    t('landing.pricing.enterprise.features.training'),
  ];

  return (
    <SectionWrapper id="pricing">
      <SectionHeader title={t('landing.pricing.title')} subtitle={t('landing.pricing.subtitle')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Pack Complet */}
        <motion.div
          className="bg-background p-10 rounded-xl flex flex-col border-2 border-primary relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {t('landing.pricing.packComplete.popular')}
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t('landing.pricing.packComplete.title')}
          </h3>
          <div className="text-4xl font-extrabold text-foreground mb-6">
            {t('landing.pricing.packComplete.price')}&euro;{' '}
            <span className="text-sm font-normal text-muted-foreground">
              {t('landing.pricing.packComplete.period')}
            </span>
          </div>
          <ul className="space-y-3 mb-10 flex-grow">
            {packFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            {t('landing.pricing.packComplete.cta')}
          </button>
        </motion.div>

        {/* Enterprise */}
        <motion.div
          className="bg-muted/30 p-10 rounded-xl flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t('landing.pricing.enterprise.title')}
          </h3>
          <div className="text-4xl font-extrabold text-foreground mb-6">
            {t('landing.pricing.enterprise.price')}
          </div>
          <ul className="space-y-3 mb-10 flex-grow">
            {enterpriseFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-4 border-2 border-foreground text-foreground font-bold rounded-xl hover:bg-muted transition-colors">
            {t('landing.pricing.enterprise.cta')}
          </button>
        </motion.div>
      </div>

      <p className="text-center mt-10 text-muted-foreground font-medium italic">
        {t('landing.pricing.discount')}
      </p>
    </SectionWrapper>
  );
}
