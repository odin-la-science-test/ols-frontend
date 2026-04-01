import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { LegalPageLayout } from './components/legal-page-layout';
import { LegalSection } from './components/legal-section';

// ═══════════════════════════════════════════════════════════════════════════
// TERMS PAGE — Accessible at /terms
// Conditions Generales d'Utilisation (CGU)
// ═══════════════════════════════════════════════════════════════════════════

export function TermsPage() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      titleKey="legal.terms.title"
      icon={FileText}
      lastUpdateKey="legal.terms.lastUpdate"
      draftNotice
    >
      {/* 1. Objet */}
      <LegalSection titleKey="legal.terms.purposeTitle" delay={0.1}>
        <p>{t('legal.terms.purposeContent1')}</p>
        <p>{t('legal.terms.purposeContent2')}</p>
        <p>{t('legal.terms.purposeContent3')}</p>
      </LegalSection>

      {/* 2. Acceptation */}
      <LegalSection titleKey="legal.terms.acceptanceTitle" delay={0.15}>
        <p>{t('legal.terms.acceptanceContent1')}</p>
        <p>{t('legal.terms.acceptanceContent2')}</p>
      </LegalSection>

      {/* 3. Acces au service */}
      <LegalSection titleKey="legal.terms.accessTitle" delay={0.20}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.registrationTitle')}</h3>
        <p>{t('legal.terms.registrationContent1')}</p>
        <p>{t('legal.terms.registrationContent2')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.authMethodsTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.authMethods.local')}</li>
          <li>{t('legal.terms.authMethods.google')}</li>
          <li>{t('legal.terms.authMethods.cas')}</li>
        </ul>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.emailVerificationTitle')}</h3>
        <p>{t('legal.terms.emailVerificationContent')}</p>
      </LegalSection>

      {/* 4. Compte utilisateur */}
      <LegalSection titleKey="legal.terms.accountTitle" delay={0.25}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.passwordTitle')}</h3>
        <p>{t('legal.terms.passwordContent1')}</p>
        <p>{t('legal.terms.passwordContent2')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.sessionsTitle')}</h3>
        <p>{t('legal.terms.sessionsContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.accuracyTitle')}</h3>
        <p>{t('legal.terms.accuracyContent')}</p>
      </LegalSection>

      {/* 5. Utilisation du service */}
      <LegalSection titleKey="legal.terms.usageTitle" delay={0.30}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.authorizedTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.authorized.educational')}</li>
          <li>{t('legal.terms.authorized.research')}</li>
          <li>{t('legal.terms.authorized.professional')}</li>
        </ul>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.prohibitedTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.prohibited.illegal')}</li>
          <li>{t('legal.terms.prohibited.unauthorized')}</li>
          <li>{t('legal.terms.prohibited.scraping')}</li>
          <li>{t('legal.terms.prohibited.harmful')}</li>
          <li>{t('legal.terms.prohibited.disrupt')}</li>
          <li>{t('legal.terms.prohibited.shareCredentials')}</li>
          <li>{t('legal.terms.prohibited.commercial')}</li>
          <li>{t('legal.terms.prohibited.bypass')}</li>
        </ul>
      </LegalSection>

      {/* 6. Contenu utilisateur */}
      <LegalSection titleKey="legal.terms.userContentTitle" delay={0.35}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.ownershipTitle')}</h3>
        <p>{t('legal.terms.ownershipContent')}</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.ownership.contacts')}</li>
          <li>{t('legal.terms.ownership.notes')}</li>
          <li>{t('legal.terms.ownership.progress')}</li>
          <li>{t('legal.terms.ownership.other')}</li>
        </ul>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.licenseTitle')}</h3>
        <p>{t('legal.terms.licenseContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.contentResponsibilityTitle')}</h3>
        <p>{t('legal.terms.contentResponsibilityContent')}</p>
      </LegalSection>

      {/* 7. Propriete intellectuelle */}
      <LegalSection titleKey="legal.terms.ipTitle" delay={0.40}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.ipPedagogicalTitle')}</h3>
        <p>{t('legal.terms.ipPedagogicalContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.ipSoftwareTitle')}</h3>
        <p>{t('legal.terms.ipSoftwareContent')}</p>
      </LegalSection>

      {/* 8. Disponibilite */}
      <LegalSection titleKey="legal.terms.availabilityTitle" delay={0.45}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.bestEffortTitle')}</h3>
        <p>{t('legal.terms.bestEffortContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.maintenanceTitle')}</h3>
        <p>{t('legal.terms.maintenanceContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.betaStatusTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.betaStatus.bugs')}</li>
          <li>{t('legal.terms.betaStatus.stability')}</li>
          <li>{t('legal.terms.betaStatus.conditions')}</li>
          <li>{t('legal.terms.betaStatus.changes')}</li>
        </ul>
      </LegalSection>

      {/* 9. Protection des donnees */}
      <LegalSection titleKey="legal.terms.dataProtectionTitle" delay={0.50}>
        <p>{t('legal.terms.dataProtectionContent1')}</p>
        <p>{t('legal.terms.dataProtectionContent2')}</p>
      </LegalSection>

      {/* 10. Responsabilite */}
      <LegalSection titleKey="legal.terms.liabilityTitle" delay={0.55}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.editorLiabilityTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.editorLiability.interruptions')}</li>
          <li>{t('legal.terms.editorLiability.damages')}</li>
          <li>{t('legal.terms.editorLiability.dataLoss')}</li>
          <li>{t('legal.terms.editorLiability.scientific')}</li>
          <li>{t('legal.terms.editorLiability.userContent')}</li>
          <li>{t('legal.terms.editorLiability.technical')}</li>
        </ul>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.userLiabilityTitle')}</h3>
        <p>{t('legal.terms.userLiabilityContent')}</p>
      </LegalSection>

      {/* 11. Resiliation */}
      <LegalSection titleKey="legal.terms.terminationTitle" delay={0.60}>
        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.userTerminationTitle')}</h3>
        <p>{t('legal.terms.userTerminationContent')}</p>

        <h3 className="text-xs font-semibold text-foreground mt-2">{t('legal.terms.editorTerminationTitle')}</h3>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.editorTermination.violation')}</li>
          <li>{t('legal.terms.editorTermination.abuse')}</li>
          <li>{t('legal.terms.editorTermination.inactivity')}</li>
          <li>{t('legal.terms.editorTermination.authority')}</li>
        </ul>
        <p>{t('legal.terms.editorTerminationNote')}</p>
      </LegalSection>

      {/* 12. Modifications */}
      <LegalSection titleKey="legal.terms.changesTitle" delay={0.65}>
        <p>{t('legal.terms.changesContent1')}</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.changes.notification')}</li>
          <li>{t('legal.terms.changes.email')}</li>
        </ul>
        <p>{t('legal.terms.changesContent2')}</p>
      </LegalSection>

      {/* 13. Droit applicable */}
      <LegalSection titleKey="legal.terms.jurisdictionTitle" delay={0.70}>
        <p>{t('legal.terms.jurisdictionContent1')}</p>
        <p>{t('legal.terms.jurisdictionContent2')}</p>
        <p>{t('legal.terms.jurisdictionContent3')}</p>
      </LegalSection>

      {/* 14. Contact */}
      <LegalSection titleKey="legal.terms.contactTitle" delay={0.75}>
        <p>{t('legal.terms.contactIntro')}</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('legal.terms.contact.companyName')}</li>
          <li>{t('legal.terms.contact.address')}</li>
          <li>{t('legal.terms.contact.email')}</li>
          <li>{t('legal.terms.contact.representative')}</li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}
