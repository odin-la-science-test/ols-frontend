import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function CtaSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <motion.div
        className="relative bg-primary/10 p-12 md:p-20 rounded-[2rem] text-center border border-primary/20 overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
          {t('landing.cta.title')}
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          {t('landing.cta.subtitle')}
        </p>
        <button
          onClick={() => navigate('/register')}
          className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
        >
          {t('landing.cta.button')}
        </button>
      </motion.div>
    </section>
  );
}
