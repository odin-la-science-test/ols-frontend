'use client';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical, Package, Rocket, AlertTriangle,
  Shield, MessageSquare, Server, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { APP_VERSION } from '@/lib/app-version';

// ═══════════════════════════════════════════════════════════════════════════
// BETA CONDITIONS PAGE — Accessible at /beta-conditions
// Explains the beta scope, limitations, SLA, and data policies
// ═══════════════════════════════════════════════════════════════════════════

interface ConditionSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function ConditionSection({ icon, title, description, delay }: ConditionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex gap-4 p-4 rounded-lg bg-card/50 border border-border/30"
    >
      <div className="shrink-0 mt-0.5 text-amber-500">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function BetaConditionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sections = [
    { icon: <Package className="h-5 w-5" />, titleKey: 'beta.conditionsIncluded', descKey: 'beta.conditionsIncludedDesc' },
    { icon: <Rocket className="h-5 w-5" />, titleKey: 'beta.conditionsInProgress', descKey: 'beta.conditionsInProgressDesc' },
    { icon: <AlertTriangle className="h-5 w-5" />, titleKey: 'beta.conditionsLimitations', descKey: 'beta.conditionsLimitationsDesc' },
    { icon: <Shield className="h-5 w-5" />, titleKey: 'beta.conditionsData', descKey: 'beta.conditionsDataDesc' },
    { icon: <MessageSquare className="h-5 w-5" />, titleKey: 'beta.conditionsFeedback', descKey: 'beta.conditionsFeedbackDesc' },
    { icon: <Server className="h-5 w-5" />, titleKey: 'beta.conditionsSla', descKey: 'beta.conditionsSlaDesc' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t('common.back')}
          </Button>

          <div className="flex items-center gap-3 mb-3">
            <FlaskConical className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold">{t('beta.conditionsTitle')}</h1>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase leading-none tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/20">
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('beta.bannerDescription')}
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <ConditionSection
              key={section.titleKey}
              icon={section.icon}
              title={t(section.titleKey)}
              description={t(section.descKey)}
              delay={0.1 + i * 0.08}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground/40">
        © {new Date().getFullYear()} {t('common.appName')} · v{APP_VERSION}
      </footer>
    </div>
  );
}
