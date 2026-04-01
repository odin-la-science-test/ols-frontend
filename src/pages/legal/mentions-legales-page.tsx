import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { LegalPageLayout } from './components/legal-page-layout';
import { LegalSection } from './components/legal-section';
import { LegalInfoTable } from './components/legal-info-table';

// ═══════════════════════════════════════════════════════════════════════════
// MENTIONS LEGALES PAGE — Accessible at /mentions-legales
// Legal notices required by French law
// ═══════════════════════════════════════════════════════════════════════════

const EDITOR_ROWS = [
  { labelKey: 'legal.mentions.editor.companyName', valueKey: 'legal.mentions.editor.companyNameValue' },
  { labelKey: 'legal.mentions.editor.legalForm', valueKey: 'legal.mentions.editor.legalFormValue' },
  { labelKey: 'legal.mentions.editor.capital', valueKey: 'legal.mentions.editor.capitalValue' },
  { labelKey: 'legal.mentions.editor.siret', valueKey: 'legal.mentions.editor.siretValue' },
  { labelKey: 'legal.mentions.editor.rcs', valueKey: 'legal.mentions.editor.rcsValue' },
  { labelKey: 'legal.mentions.editor.address', valueKey: 'legal.mentions.editor.addressValue' },
  { labelKey: 'legal.mentions.editor.vat', valueKey: 'legal.mentions.editor.vatValue' },
  { labelKey: 'legal.mentions.editor.director', valueKey: 'legal.mentions.editor.directorValue' },
  { labelKey: 'legal.mentions.editor.email', valueKey: 'legal.mentions.editor.emailValue' },
  { labelKey: 'legal.mentions.editor.phone', valueKey: 'legal.mentions.editor.phoneValue' },
];

const HOST_ROWS = [
  { labelKey: 'legal.mentions.host.name', valueKey: 'legal.mentions.host.nameValue' },
  { labelKey: 'legal.mentions.host.companyName', valueKey: 'legal.mentions.host.companyNameValue' },
  { labelKey: 'legal.mentions.host.address', valueKey: 'legal.mentions.host.addressValue' },
  { labelKey: 'legal.mentions.host.phone', valueKey: 'legal.mentions.host.phoneValue' },
  { labelKey: 'legal.mentions.host.website', valueKey: 'legal.mentions.host.websiteValue' },
];

export function MentionsLegalesPage() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      titleKey="legal.mentions.title"
      icon={Scale}
      lastUpdateKey="legal.mentions.lastUpdate"
    >
      <LegalSection titleKey="legal.mentions.editorTitle" delay={0.1}>
        <p>{t('legal.mentions.editorIntro')}</p>
        <LegalInfoTable rows={EDITOR_ROWS} />
      </LegalSection>

      <LegalSection titleKey="legal.mentions.hostTitle" delay={0.18}>
        <LegalInfoTable rows={HOST_ROWS} />
      </LegalSection>

      <LegalSection titleKey="legal.mentions.ipTitle" delay={0.26}>
        <p>{t('legal.mentions.ipContent1')}</p>
        <p>{t('legal.mentions.ipContent2')}</p>
        <p>{t('legal.mentions.ipContent3')}</p>
      </LegalSection>

      <LegalSection titleKey="legal.mentions.liabilityTitle" delay={0.34}>
        <p>{t('legal.mentions.liabilityIntro')}</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.mentions.liabilityItem1')}</li>
          <li>{t('legal.mentions.liabilityItem2')}</li>
          <li>{t('legal.mentions.liabilityItem3')}</li>
          <li>{t('legal.mentions.liabilityItem4')}</li>
        </ul>
        <p>{t('legal.mentions.liabilityCookieNote')}</p>
      </LegalSection>

      <LegalSection titleKey="legal.mentions.cookiesTitle" delay={0.42}>
        <p>{t('legal.mentions.cookiesContent1')}</p>
        <p>{t('legal.mentions.cookiesContent2')}</p>
        <p>{t('legal.mentions.cookiesContent3')}</p>
      </LegalSection>

      <LegalSection titleKey="legal.mentions.dataTitle" delay={0.50}>
        <p>{t('legal.mentions.dataContent1')}</p>
        <p>{t('legal.mentions.dataContent2')}</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.mentions.dataContactEmail')}</li>
          <li>{t('legal.mentions.dataContactMail')}</li>
        </ul>
        <p>{t('legal.mentions.dataCnil')}</p>
      </LegalSection>

      <LegalSection titleKey="legal.mentions.jurisdictionTitle" delay={0.58}>
        <p>{t('legal.mentions.jurisdictionContent')}</p>
      </LegalSection>

      <LegalSection titleKey="legal.mentions.creditsTitle" delay={0.66}>
        <p>{t('legal.mentions.creditsContent')}</p>
      </LegalSection>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.74, duration: 0.4 }}
        className="text-xs text-muted-foreground/60 italic"
      >
        {t('legal.mentions.updateNotice')}
      </motion.p>
    </LegalPageLayout>
  );
}
