'use client';

import { type ReactNode, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { FeatureCard, AppTopBar } from '@/components/common';
import { Button } from '@/components/ui';
import { LoadingState } from '@/components/modules/shared';
import { useHubModules, type HubModule } from '@/hooks';
import { useAuthStore } from '@/stores';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE TEMPLATE - Generic dashboard for module categories (Atlas, Lab)
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleCardProps {
  module: HubModule;
  accentColor: string;
  delay?: number;
  onLockedClick?: () => void;
}

function DashboardModuleCard({ module, accentColor, delay = 0, onLockedClick }: ModuleCardProps) {
  const isGuest = useAuthStore((state) => state.user?.role === 'GUEST');
  const isLocked = module.locked || isGuest;

  const handleClick = (e: MouseEvent) => {
    if (isLocked && onLockedClick) {
      e.preventDefault();
      onLockedClick();
    }
  };

  return (
    <FeatureCard
      title={module.title}
      description={module.description}
      icon={<DynamicIcon name={module.icon} className="w-full h-full" strokeWidth={1.5} />}
      accentColor={accentColor}
      to={module.routePath}
      onClick={isLocked ? handleClick : undefined}
      isLocked={isLocked}
      delay={delay}
    />
  );
}

interface DashboardErrorStateProps {
  icon: LucideIcon;
  onRetry: () => void;
  errorText: string;
}

function DashboardErrorState({ icon: Icon, onRetry, errorText }: DashboardErrorStateProps) {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <Icon className="w-10 h-10 text-destructive" />
      </div>
      <p className="text-foreground font-medium mb-2">{errorText}</p>
      <p className="text-muted-foreground text-sm mb-4">{t('errors.networkError')}</p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        {t('common.retry')}
      </Button>
    </motion.div>
  );
}

interface DashboardEmptyStateProps {
  icon: LucideIcon;
  emptyText: string;
}

function DashboardEmptyState({ icon: Icon, emptyText }: DashboardEmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Icon className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{emptyText}</p>
    </motion.div>
  );
}

interface DashboardPageTemplateProps {
  /** Module Category (MUNIN_ATLAS, HUGIN_LAB) */
  category: 'MUNIN_ATLAS' | 'HUGIN_LAB';
  /** Pre-translated texts and a formatter for modules count */
  translations: {
    titleText: string;
    subtitleText: string;
    loadingText: string;
    errorText: string;
    emptyText: string;
    getModulesCountText: (count: number) => string;
  };
  /** Accent color for cards */
  accentColor: string;
  /** Background component */
  background: ReactNode;
  /** Icon for empty/error states */
  icon: LucideIcon;
  /** Cross-navigation to the other platform */
  crossNav?: {
    labelKey: string;
    to: string;
  };
}

export function DashboardPageTemplate({
  category,
  translations,
  accentColor,
  background,
  icon,
  crossNav,
}: DashboardPageTemplateProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: modules, isLoading, isError, refetch } = useHubModules(category);

  const handleLockedClick = () => {
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Background */}
      {background}

      {/* ─── Top Bar (shared with home page) ─── */}
      <AppTopBar />

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
        <div>
          {/* Page Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold brand-title tracking-tight mb-2">
              {translations.titleText}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {translations.subtitleText}
            </p>
            {modules && modules.length > 0 && (
              <motion.p
                className="text-sm text-muted-foreground/70 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {translations.getModulesCountText(modules.length)}
              </motion.p>
            )}
            {crossNav && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-1.5"
                  onClick={() => navigate(crossNav.to)}
                >
                  {t(crossNav.labelKey)}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <LoadingState 
              theme={category === 'MUNIN_ATLAS' ? 'munin' : 'hugin'} 
              size="lg" 
              message={translations.loadingText}
              className="py-20"
            />
          ) : isError ? (
            <DashboardErrorState 
              icon={icon} 
              onRetry={() => refetch()} 
              errorText={translations.errorText}
            />
          ) : !modules || modules.length === 0 ? (
            <DashboardEmptyState 
              icon={icon} 
              emptyText={translations.emptyText}
            />
          ) : (
            <motion.div
              data-tour="hub-modules-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {modules.map((module, index) => (
                <DashboardModuleCard 
                  key={module.moduleKey}
                  module={module}
                  accentColor={accentColor}
                  delay={0.1 + index * 0.05}
                  onLockedClick={handleLockedClick}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
