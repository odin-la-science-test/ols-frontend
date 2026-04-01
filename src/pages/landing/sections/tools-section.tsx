import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, BarChart3, Database } from 'lucide-react';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import { SectionWrapper, SectionHeader } from '../components';

interface ToolItem {
  titleKey: string;
  descKey: string;
  icon: typeof BookOpen;
  color: string;
}

const TOOLS: ToolItem[] = [
  { titleKey: 'landing.tools.muninAtlas.title', descKey: 'landing.tools.muninAtlas.description', icon: BookOpen, color: MUNIN_PRIMARY },
  { titleKey: 'landing.tools.huginLab.title', descKey: 'landing.tools.huginLab.description', icon: FlaskConical, color: HUGIN_PRIMARY },
  { titleKey: 'landing.tools.analysis.title', descKey: 'landing.tools.analysis.description', icon: BarChart3, color: HUGIN_PRIMARY },
  { titleKey: 'landing.tools.dataManagement.title', descKey: 'landing.tools.dataManagement.description', icon: Database, color: HUGIN_PRIMARY },
];

export function ToolsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="tools" className="bg-muted/30">
      <SectionHeader title={t('landing.tools.title')} subtitle={t('landing.tools.subtitle')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS.map(({ titleKey, descKey, icon: Icon, color }, i) => (
          <motion.div
            key={titleKey}
            className="bg-background p-8 rounded-xl flex gap-6 hover:shadow-md transition-shadow border border-border/20"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-7 h-7" style={{ color }} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
