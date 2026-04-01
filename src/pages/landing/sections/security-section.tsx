import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Shield, KeyRound, FileCode, ShieldCheck, Flag } from 'lucide-react';
import { SectionWrapper, SectionHeader } from '../components';

interface SecurityItem {
  titleKey: string;
  descKey: string;
  icon: typeof Lock;
}

const SECURITY_ITEMS: SecurityItem[] = [
  { titleKey: 'landing.security.https.title', descKey: 'landing.security.https.description', icon: Lock },
  { titleKey: 'landing.security.rgpd.title', descKey: 'landing.security.rgpd.description', icon: Shield },
  { titleKey: 'landing.security.jwt.title', descKey: 'landing.security.jwt.description', icon: KeyRound },
  { titleKey: 'landing.security.sanitization.title', descKey: 'landing.security.sanitization.description', icon: FileCode },
  { titleKey: 'landing.security.headers.title', descKey: 'landing.security.headers.description', icon: ShieldCheck },
  { titleKey: 'landing.security.european.title', descKey: 'landing.security.european.description', icon: Flag },
];

export function SecuritySection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="security">
      <SectionHeader
        title={t('landing.security.title')}
        subtitle={t('landing.security.description')}
        centered={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECURITY_ITEMS.map(({ titleKey, descKey, icon: Icon }, i) => (
          <motion.div
            key={titleKey}
            className="bg-muted/30 p-6 rounded-xl hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Icon className="w-6 h-6 text-primary mb-4" strokeWidth={1.5} />
            <h4 className="font-bold text-foreground mb-2">{t(titleKey)}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{t(descKey)}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
