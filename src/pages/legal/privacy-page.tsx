import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { LegalPageLayout } from './components/legal-page-layout';
import { LegalSection } from './components/legal-section';
import { LegalInfoTable } from './components/legal-info-table';

// ═══════════════════════════════════════════════════════════════════════════
// PRIVACY PAGE — Accessible at /privacy
// Privacy policy (Politique de confidentialite) per RGPD
// ═══════════════════════════════════════════════════════════════════════════

const CONTROLLER_ROWS = [
  { labelKey: 'legal.privacy.controller.companyName', valueKey: 'legal.privacy.controller.companyNameValue' },
  { labelKey: 'legal.privacy.controller.siret', valueKey: 'legal.privacy.controller.siretValue' },
  { labelKey: 'legal.privacy.controller.address', valueKey: 'legal.privacy.controller.addressValue' },
  { labelKey: 'legal.privacy.controller.email', valueKey: 'legal.privacy.controller.emailValue' },
  { labelKey: 'legal.privacy.controller.dpo', valueKey: 'legal.privacy.controller.dpoValue' },
];

const ACCOUNT_DATA_ROWS = [
  { labelKey: 'legal.privacy.accountData.email', valueKey: 'legal.privacy.accountData.emailPurpose' },
  { labelKey: 'legal.privacy.accountData.name', valueKey: 'legal.privacy.accountData.namePurpose' },
  { labelKey: 'legal.privacy.accountData.password', valueKey: 'legal.privacy.accountData.passwordPurpose' },
  { labelKey: 'legal.privacy.accountData.avatar', valueKey: 'legal.privacy.accountData.avatarPurpose' },
  { labelKey: 'legal.privacy.accountData.authProvider', valueKey: 'legal.privacy.accountData.authProviderPurpose' },
];

const SESSION_DATA_ROWS = [
  { labelKey: 'legal.privacy.sessionData.ip', valueKey: 'legal.privacy.sessionData.ipPurpose' },
  { labelKey: 'legal.privacy.sessionData.device', valueKey: 'legal.privacy.sessionData.devicePurpose' },
  { labelKey: 'legal.privacy.sessionData.dates', valueKey: 'legal.privacy.sessionData.datesPurpose' },
];

const CONTACTS_DATA_ROWS = [
  { labelKey: 'legal.privacy.contactsData.nameEmail', valueKey: 'legal.privacy.contactsData.nameEmailPurpose' },
  { labelKey: 'legal.privacy.contactsData.orgPosition', valueKey: 'legal.privacy.contactsData.orgPositionPurpose' },
  { labelKey: 'legal.privacy.contactsData.notes', valueKey: 'legal.privacy.contactsData.notesPurpose' },
];

const NOTIFICATIONS_ROWS = [
  { labelKey: 'legal.privacy.notifications.titleMessage', valueKey: 'legal.privacy.notifications.titleMessagePurpose' },
  { labelKey: 'legal.privacy.notifications.metadata', valueKey: 'legal.privacy.notifications.metadataPurpose' },
];

const ORGANIZATIONS_ROWS = [
  { labelKey: 'legal.privacy.organizations.nameDesc', valueKey: 'legal.privacy.organizations.nameDescPurpose' },
  { labelKey: 'legal.privacy.organizations.website', valueKey: 'legal.privacy.organizations.websitePurpose' },
  { labelKey: 'legal.privacy.organizations.members', valueKey: 'legal.privacy.organizations.membersPurpose' },
];

const RETENTION_ROWS = [
  { labelKey: 'legal.privacy.retention.accountData', valueKey: 'legal.privacy.retention.accountDataDuration' },
  { labelKey: 'legal.privacy.retention.sessionData', valueKey: 'legal.privacy.retention.sessionDataDuration' },
  { labelKey: 'legal.privacy.retention.history', valueKey: 'legal.privacy.retention.historyDuration' },
  { labelKey: 'legal.privacy.retention.annotations', valueKey: 'legal.privacy.retention.annotationsDuration' },
  { labelKey: 'legal.privacy.retention.notifications', valueKey: 'legal.privacy.retention.notificationsDuration' },
  { labelKey: 'legal.privacy.retention.contacts', valueKey: 'legal.privacy.retention.contactsDuration' },
];

const SUBPROCESSORS_ROWS = [
  { labelKey: 'legal.privacy.subprocessors.googleLabel', valueKey: 'legal.privacy.subprocessors.google' },
  { labelKey: 'legal.privacy.subprocessors.casLabel', valueKey: 'legal.privacy.subprocessors.cas' },
  { labelKey: 'legal.privacy.subprocessors.infomaniakLabel', valueKey: 'legal.privacy.subprocessors.infomaniak' },
];

const RIGHTS_ROWS = [
  { labelKey: 'legal.privacy.rights.access', valueKey: 'legal.privacy.rights.accessDesc' },
  { labelKey: 'legal.privacy.rights.rectification', valueKey: 'legal.privacy.rights.rectificationDesc' },
  { labelKey: 'legal.privacy.rights.erasure', valueKey: 'legal.privacy.rights.erasureDesc' },
  { labelKey: 'legal.privacy.rights.portability', valueKey: 'legal.privacy.rights.portabilityDesc' },
  { labelKey: 'legal.privacy.rights.restriction', valueKey: 'legal.privacy.rights.restrictionDesc' },
  { labelKey: 'legal.privacy.rights.objection', valueKey: 'legal.privacy.rights.objectionDesc' },
];

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      titleKey="legal.privacy.title"
      icon={ShieldCheck}
      lastUpdateKey="legal.privacy.lastUpdate"
    >
      {/* 1. Responsable du traitement */}
      <LegalSection titleKey="legal.privacy.controllerTitle" delay={0.1}>
        <LegalInfoTable rows={CONTROLLER_ROWS} />
      </LegalSection>

      {/* 2. Presentation du service */}
      <LegalSection titleKey="legal.privacy.serviceTitle" delay={0.16}>
        <p>{t('legal.privacy.serviceContent')}</p>
      </LegalSection>

      {/* 3. Donnees personnelles collectees */}
      <LegalSection titleKey="legal.privacy.dataCollectedTitle" delay={0.22}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.accountDataTitle')}</h3>
        <LegalInfoTable rows={ACCOUNT_DATA_ROWS} />
        <p>{t('legal.privacy.accountData.passwordNote')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.sessionDataTitle')}</h3>
        <LegalInfoTable rows={SESSION_DATA_ROWS} />
        <p>{t('legal.privacy.sessionData.limitNote')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.contactsDataTitle')}</h3>
        <LegalInfoTable rows={CONTACTS_DATA_ROWS} />

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.historyTitle')}</h3>
        <p>{t('legal.privacy.historyContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.annotationsTitle')}</h3>
        <p>{t('legal.privacy.annotationsContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.notificationsTitle')}</h3>
        <LegalInfoTable rows={NOTIFICATIONS_ROWS} />

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.organizationsTitle')}</h3>
        <LegalInfoTable rows={ORGANIZATIONS_ROWS} />
      </LegalSection>

      {/* 4. Authentification et gestion des sessions */}
      <LegalSection titleKey="legal.privacy.authTitle" delay={0.28}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.authMechanismTitle')}</h3>
        <p>{t('legal.privacy.authMechanismContent')}</p>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.noCookiesTitle')}</h3>
        <p>{t('legal.privacy.noCookiesContent')}</p>
      </LegalSection>

      {/* 5. Durees de conservation */}
      <LegalSection titleKey="legal.privacy.retentionTitle" delay={0.34}>
        <LegalInfoTable rows={RETENTION_ROWS} />
        <p>{t('legal.privacy.retentionNote')}</p>
      </LegalSection>

      {/* 6. Sous-traitants */}
      <LegalSection titleKey="legal.privacy.subprocessorsTitle" delay={0.40}>
        <LegalInfoTable rows={SUBPROCESSORS_ROWS} />
        <p>{t('legal.privacy.subprocessorsNote')}</p>
      </LegalSection>

      {/* 7. Securite */}
      <LegalSection titleKey="legal.privacy.securityTitle" delay={0.46}>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.privacy.security.https')}</li>
          <li>{t('legal.privacy.security.hash')}</li>
          <li>{t('legal.privacy.security.sessionLimit')}</li>
          <li>{t('legal.privacy.security.tokenLifetime')}</li>
          <li>{t('legal.privacy.security.logging')}</li>
          <li>{t('legal.privacy.security.rbac')}</li>
        </ul>
      </LegalSection>

      {/* 8. Droits des utilisateurs */}
      <LegalSection titleKey="legal.privacy.rightsTitle" delay={0.52}>
        <p>{t('legal.privacy.rightsIntro')}</p>
        <LegalInfoTable rows={RIGHTS_ROWS} />

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.rightsExerciseTitle')}</h3>
        <p>{t('legal.privacy.rightsExerciseContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.privacy.rightsFeaturesTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.privacy.rightsFeatures.sessions')}</li>
          <li>{t('legal.privacy.rightsFeatures.export')}</li>
          <li>{t('legal.privacy.rightsFeatures.deletion')}</li>
        </ul>
      </LegalSection>

      {/* 9. Reclamation */}
      <LegalSection titleKey="legal.privacy.complaintTitle" delay={0.58}>
        <p>{t('legal.privacy.complaintContent')}</p>
      </LegalSection>

      {/* 10. Modifications */}
      <LegalSection titleKey="legal.privacy.changesTitle" delay={0.64}>
        <p>{t('legal.privacy.changesContent')}</p>
      </LegalSection>

      {/* 11. Contact */}
      <LegalSection titleKey="legal.privacy.contactTitle" delay={0.70}>
        <p>{t('legal.privacy.contactContent')}</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.privacy.contactEmail')}</li>
          <li>{t('legal.privacy.contactDpo')}</li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}
