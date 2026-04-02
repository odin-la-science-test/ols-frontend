import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Microscope, ShieldCheck, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SectionWrapper } from '../components';

const MANIFESTO_ITEMS = [
  {
    icon: GraduationCap,
    titleKey: 'landing.manifesto.who.title',
    descKey: 'landing.manifesto.who.description',
  },
  {
    icon: Microscope,
    titleKey: 'landing.manifesto.problem.title',
    descKey: 'landing.manifesto.problem.description',
  },
  {
    icon: ShieldCheck,
    titleKey: 'landing.manifesto.why.title',
    descKey: 'landing.manifesto.why.description',
  },
];

export function ManifestoSection() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SectionWrapper id="manifesto" className="bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {t('landing.manifesto.title')}
          </h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {MANIFESTO_ITEMS.map((item, i) => (
            <motion.div
              key={item.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground whitespace-nowrap">
                {t(item.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(item.descKey)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Origin Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border border-border/50 rounded-3xl overflow-hidden bg-background/50 backdrop-blur-sm shadow-sm"
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-muted/30 transition-colors group"
          >
            <span className="text-lg sm:text-xl font-bold text-foreground">
              {t('landing.manifesto.origin.title')}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors"
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className="px-6 sm:px-8 pb-8 sm:pb-10">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {t('landing.manifesto.origin.fullText')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
