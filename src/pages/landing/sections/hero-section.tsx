import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Dna, Microscope, TestTube, Bug, FlaskConical } from 'lucide-react';
import { FlipIcons } from '@/components/ui';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import { AnimatedCounter, AppMockup, LogoPattern } from '../components';

const FLIP_ICONS = [
  <Dna className="w-full h-full" style={{ color: MUNIN_PRIMARY }} strokeWidth={1.5} />,
  <Microscope className="w-full h-full" style={{ color: MUNIN_PRIMARY }} strokeWidth={1.5} />,
  <TestTube className="w-full h-full" style={{ color: HUGIN_PRIMARY }} strokeWidth={1.5} />,
  <Bug className="w-full h-full" style={{ color: MUNIN_PRIMARY }} strokeWidth={1.5} />,
  <FlaskConical className="w-full h-full" style={{ color: HUGIN_PRIMARY }} strokeWidth={1.5} />,
];

interface StatItem {
  target: number;
  suffix: string;
  labelKey: string;
  border: string;
}

const STATS: StatItem[] = [
  { target: 10, suffix: '+', labelKey: 'landing.hero.stats.modules', border: 'border-primary' },
  { target: 6, suffix: '', labelKey: 'landing.hero.stats.security', border: 'border-primary/60' },
  { target: 100, suffix: '%', labelKey: 'landing.hero.stats.european', border: 'border-primary/30' },
];

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Logo pattern background */}
      <LogoPattern />

      {/* Decorative gradient blob */}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16 sm:pt-40 sm:pb-24">
        {/* Two-column hero: left content, right stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* Left: title, description, CTAs */}
          <div className="lg:col-span-7">
            {/* Tagline + FlipIcons */}
            <motion.span
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('landing.hero.tagline')}
              <FlipIcons icons={FLIP_ICONS} duration={2000} className="w-4 h-4" />
            </motion.span>

            {/* Title */}
            <motion.h1
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              {t('landing.hero.titleStart')}
              <br />
              <span className="gradient-animated">{t('landing.hero.flip.hand')}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t('landing.hero.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <button
                onClick={() => navigate('/register')}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                {t('landing.hero.cta')}
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-muted text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-muted/80 transition-colors"
              >
                {t('landing.nav.login')}
              </button>
            </motion.div>
          </div>

          {/* Right: stat cards */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-6">
            {STATS.map(({ target, suffix, labelKey, border }, i) => (
              <motion.div
                key={labelKey}
                className={`bg-muted/30 p-6 rounded-xl border-l-4 ${border}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
              >
                <div className="text-3xl font-bold text-foreground">
                  <AnimatedCounter target={target} suffix={suffix} duration={2} />
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {t(labelKey)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated app mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <AppMockup />
        </motion.div>
      </div>
    </section>
  );
}
