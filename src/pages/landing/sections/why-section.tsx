import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SectionWrapper } from '../components';

interface WhyItem {
  titleKey: string;
  descKey: string;
}

const WHY_ITEMS: WhyItem[] = [
  { titleKey: 'landing.why.time.title', descKey: 'landing.why.time.description' },
  { titleKey: 'landing.why.security.title', descKey: 'landing.why.security.description' },
  { titleKey: 'landing.why.collaboration.title', descKey: 'landing.why.collaboration.description' },
  { titleKey: 'landing.why.flexibility.title', descKey: 'landing.why.flexibility.description' },
];

export function WhySection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left: title */}
        <div className="md:col-span-4 border-l-2 border-primary pl-6">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('landing.why.title')}
          </motion.h2>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t('landing.why.subtitle')}
          </motion.p>
        </div>

        {/* Right: grid of reasons */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-10">
          {WHY_ITEMS.map(({ titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <h4 className="font-bold text-lg text-foreground mb-3">{t(titleKey)}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
