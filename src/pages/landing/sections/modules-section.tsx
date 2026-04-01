import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sprout, Dna, Table, TestTube } from 'lucide-react';
import { MUNIN_PRIMARY } from '@/lib/accent-colors';
import { SectionWrapper, SectionHeader } from '../components';

interface ModuleItem {
  titleKey: string;
  descKey: string;
  icon: typeof Sprout;
}

const MODULES: ModuleItem[] = [
  { titleKey: 'landing.modules.cultureTracking.title', descKey: 'landing.modules.cultureTracking.description', icon: Sprout },
  { titleKey: 'landing.modules.sequenceLens.title', descKey: 'landing.modules.sequenceLens.description', icon: Dna },
  { titleKey: 'landing.modules.excelLab.title', descKey: 'landing.modules.excelLab.description', icon: Table },
  { titleKey: 'landing.modules.analyseBio.title', descKey: 'landing.modules.analyseBio.description', icon: TestTube },
];

export function ModulesSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper className="bg-muted/30">
      <SectionHeader title={t('landing.modules.title')} subtitle={t('landing.modules.subtitle')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MODULES.map(({ titleKey, descKey, icon: Icon }, i) => (
          <motion.div
            key={titleKey}
            className="bg-background p-8 rounded-xl flex flex-col items-center text-center hover:shadow-md transition-shadow border border-border/20"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Icon className="w-10 h-10 mb-4" style={{ color: MUNIN_PRIMARY }} strokeWidth={1.5} />
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-foreground">{t(titleKey)}</h4>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ color: MUNIN_PRIMARY, backgroundColor: `${MUNIN_PRIMARY}15` }}>
                {t('landing.modules.comingSoon')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t(descKey)}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
