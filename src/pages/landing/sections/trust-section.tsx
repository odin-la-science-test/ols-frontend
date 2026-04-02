import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function TrustSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground/60 mb-10">
          {t('landing.trust.title')}
        </p>
        <motion.div
          className="flex flex-wrap justify-center items-center gap-12 md:gap-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="group relative flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <img 
              src="/images/partners/bioecoagro.png" 
              alt={t('landing.trust.partners.bioEcoAgro')}
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          <div className="group relative flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <img 
              src="/images/partners/univ-lille.jpg" 
              alt={t('landing.trust.partners.univLille')}
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
