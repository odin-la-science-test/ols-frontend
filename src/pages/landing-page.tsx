import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import {
  HeroSection,
  TrustSection,
  FeaturesSection,
  SecuritySection,
  PlatformsSection,
  ToolsSection,
  WhySection,
  ModulesSection,
  PricingSection,
  CtaSection,
} from './landing/sections';
import { LandingNav, LandingFooter } from './landing/components';

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE - Public showcase / vitrine page
// Editorial design, supports dark/light themes via semantic tokens.
// Accessible without authentication at /welcome
// ═══════════════════════════════════════════════════════════════════════════

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 flex items-center justify-center shadow-lg"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col relative text-foreground">
      <LandingNav />

      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <SecuritySection />
        <PlatformsSection />
        <ToolsSection />
        <WhySection />
        <ModulesSection />
        <PricingSection />
        <CtaSection />
      </main>

      <LandingFooter />
      <ScrollToTop />
    </div>
  );
}
