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
          <span className="text-2xl font-bold text-muted-foreground opacity-60 hover:opacity-100 transition-opacity">
            {t('landing.trust.partners.bioEcoAgro')}
          </span>
          <span className="text-2xl font-bold text-muted-foreground opacity-60 hover:opacity-100 transition-opacity">
            {t('landing.trust.partners.univLille')}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
