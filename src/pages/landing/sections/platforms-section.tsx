import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Tablet, CheckCircle } from 'lucide-react';
import { SectionWrapper, SectionHeader } from '../components';

export function PlatformsSection() {
  const { t } = useTranslation();

  const features = [
    t('landing.platforms.web.features.noInstall'),
    t('landing.platforms.web.features.autoUpdate'),
    t('landing.platforms.web.features.accessibility'),
    t('landing.platforms.web.features.responsive'),
  ];

  return (
    <SectionWrapper>
      <SectionHeader title={t('landing.platforms.title')} subtitle={t('landing.platforms.subtitle')} />

      <motion.div
        className="max-w-3xl mx-auto bg-muted/30 p-10 sm:p-12 rounded-2xl border border-border/30 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <Monitor className="w-10 h-10 text-primary" strokeWidth={1.5} />
          <Tablet className="w-8 h-8 text-primary/60" strokeWidth={1.5} />
          <Smartphone className="w-7 h-7 text-primary/40" strokeWidth={1.5} />
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-4">{t('landing.platforms.web.title')}</h3>
        <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
          {t('landing.platforms.web.description')}
        </p>

        <ul className="space-y-3 text-sm text-muted-foreground inline-block text-left">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
              {feature}
            </li>
          ))}
        </ul>
      </motion.div>
    </SectionWrapper>
  );
}
