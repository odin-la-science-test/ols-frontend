import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, Share2, RefreshCw } from 'lucide-react';
import { SectionWrapper } from '../components';

interface FeatureItem {
  titleKey: string;
  descKey: string;
  icon: typeof Globe;
}

const FEATURES: FeatureItem[] = [
  { titleKey: 'landing.features.browser.title', descKey: 'landing.features.browser.description', icon: Globe },
  { titleKey: 'landing.features.share.title', descKey: 'landing.features.share.description', icon: Share2 },
  { titleKey: 'landing.features.updates.title', descKey: 'landing.features.updates.description', icon: RefreshCw },
];

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="features">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-10">
        {t('landing.features.title')}
      </h2>

      <ul className="space-y-8 max-w-3xl">
        {FEATURES.map(({ titleKey, descKey, icon: Icon }, i) => (
          <motion.li
            key={titleKey}
            className="flex gap-4 items-start"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Icon className="w-6 h-6 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <h4 className="font-bold text-foreground mb-1">{t(titleKey)}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
