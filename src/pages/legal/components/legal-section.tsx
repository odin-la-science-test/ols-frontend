import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface LegalSectionProps {
  titleKey: string;
  children: React.ReactNode;
  delay?: number;
}

export function LegalSection({ titleKey, children, delay = 0 }: LegalSectionProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-2"
    >
      <h2 className="text-sm font-semibold">{t(titleKey)}</h2>
      <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </motion.div>
  );
}
