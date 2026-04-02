import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useGuestLogin } from '@/hooks';
import { AnimatedCounter, DeviceShowcase, LogoPattern, DnaIllustration, InteractiveParticles } from '../components';
import { useThemeStore } from '@/stores';
import { AnimatePresence } from 'framer-motion';

const STATS = [
  { target: 6, suffix: '', labelKey: 'landing.hero.stats.security' },
  { target: 10, suffix: '+', labelKey: 'landing.hero.stats.modules' },
  { target: 100, suffix: '%', labelKey: 'landing.hero.stats.european' },
];

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: loginAsGuest, isPending: isGuestPending } = useGuestLogin();
  const { isDesignEnabled, isParticlesEnabled } = useThemeStore();

  return (
    <section className="relative overflow-hidden min-h-[100dvh] flex flex-col">
      <LogoPattern />

      {/* Independent Design & Particles Rendering */}
      <AnimatePresence>
        {isDesignEnabled && (
          <motion.div
            key="dna-design"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 pointer-events-none z-0"
          >
            {/* DNA Background element - Hand-adjusted 10px lower as requested */}
            <div className="absolute top-[6%] mt-[12px] inset-x-0 bottom-0">
              <DnaIllustration />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isParticlesEnabled && (
          <motion.div
            key="particles-design"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 pointer-events-none z-0"
          >
            {/* Interactive Particles like Active Theory - Large, Static, Magnetic */}
            <InteractiveParticles className="opacity-50" count={1000} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pt-36 sm:pb-20 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
          {/* Left: text content */}
          <div className="lg:col-span-5 relative">

            {/* Tagline */}
            <motion.span
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('landing.hero.tagline')}
            </motion.span>

            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
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
              className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t('landing.hero.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col gap-3 mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  {t('landing.hero.cta')}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-muted text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors"
                >
                  {t('landing.nav.login')}
                </button>
              </div>
              <button
                onClick={() => loginAsGuest()}
                disabled={isGuestPending}
                className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors w-fit pl-3"
              >
                {t('landing.hero.tryGuest')}
                <ArrowRight className="w-3 h-3 inline ml-1" strokeWidth={1.5} />
              </button>
            </motion.div>

            {/* Inline stats */}
            <motion.div
              className="flex flex-wrap items-center justify-center sm:justify-start gap-5 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {STATS.map(({ target, suffix, labelKey }) => (
                <div key={labelKey} className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-primary">
                    <AnimatedCounter target={target} suffix={suffix} duration={2} />
                  </span>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    {t(labelKey)}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: device showcase */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <DeviceShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
