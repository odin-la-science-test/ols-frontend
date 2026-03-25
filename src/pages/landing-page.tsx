import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dna, Microscope, TestTube, Bug, FlaskConical, BookOpen, ArrowRight, LogIn } from 'lucide-react';
import { SparklesBackground, Logo, FeatureCard, BetaBadge } from '@/components/common';
import { FlipIcons } from '@/components/ui';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import { APP_VERSION } from '@/lib/app-version';

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE - Public showcase / demo page
// Animated branding, feature highlights, CTA to login/register
// Accessible without authentication at /welcome
// ═══════════════════════════════════════════════════════════════════════════

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Background */}
      <SparklesBackground />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        {/* ─── Hero Section ─── */}
        <div className="text-center mb-10 max-w-2xl">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4"
          >
            <Logo size={80} className="mx-auto" />
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl font-bold brand-title tracking-tight mb-3 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t('common.appName')}
            <BetaBadge className="text-xs" />
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-muted-foreground flex items-center justify-center gap-2 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            {t('home.subtitle')}{' '}
            <FlipIcons
              icons={[
                <Dna className="w-5 h-5" style={{ color: MUNIN_PRIMARY }} strokeWidth={1.5} />,
                <Microscope className="w-5 h-5" style={{ color: MUNIN_PRIMARY }} strokeWidth={1.5} />,
                <TestTube className="w-5 h-5" style={{ color: HUGIN_PRIMARY }} strokeWidth={1.5} />,
                <Bug className="w-5 h-5" style={{ color: MUNIN_PRIMARY }} strokeWidth={1.5} />,
                <FlaskConical className="w-5 h-5" style={{ color: HUGIN_PRIMARY }} strokeWidth={1.5} />,
              ]}
              duration={2000}
              className="w-5 h-5"
            />
          </motion.p>

          <motion.p
            className="text-sm text-muted-foreground/60 mt-2 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {t('landing.description')}
          </motion.p>
        </div>

        {/* ─── Platform Preview Cards ─── */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-stretch mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <FeatureCard
            to="/login"
            icon={<BookOpen className="w-6 h-6" strokeWidth={1.5} />}
            title={t('atlas.title')}
            description={t('home.atlasDescription')}
            accentColor={MUNIN_PRIMARY}
            delay={0.1}
            hover3D
            hover3DDirection="left"
            hoverColoredBg
            className="w-full sm:w-80 lg:w-96"
          />
          <FeatureCard
            to="/login"
            icon={<FlaskConical className="w-6 h-6" strokeWidth={1.5} />}
            title={t('home.huginLab')}
            description={t('home.labDescription')}
            accentColor={HUGIN_PRIMARY}
            delay={0.2}
            hover3D
            hover3DDirection="right"
            hoverColoredBg
            className="w-full sm:w-80 lg:w-96"
          />
        </motion.div>

        {/* ─── CTA Buttons ─── */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {t('landing.login')}
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-foreground font-medium text-sm hover:bg-card/80 hover:border-border transition-colors"
          >
            {t('landing.register')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* ─── Footer ─── */}
      <motion.footer
        className="relative z-10 text-center py-6 text-xs text-muted-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        © {new Date().getFullYear()} {t('common.appName')} · v{APP_VERSION}
      </motion.footer>
    </div>
  );
}
