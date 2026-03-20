import { Sparkles, DotBackground, GridBackground } from '@/components/ui';

interface SparklesBackgroundProps {
  /** Sparkles density */
  density?: 'subtle' | 'normal' | 'dense';
}

/**
 * Sparkles Background - Aceternity UI
 * For "wow" pages: Home, 404, Error
 * 
 * @example
 * <SparklesBackground />                    // Default subtle density
 * <SparklesBackground density="normal" />   // More particles
 */
export function SparklesBackground({ 
  density = 'subtle'
}: SparklesBackgroundProps) {
  return <Sparkles density={density} />;
}

/**
 * Dot Background - Aceternity UI
 * For Munin Atlas and associated modules
 * 
 * @example
 * <DotsBackground />
 */
export function DotsBackground() {
  return <DotBackground />;
}

/**
 * Grid Background - Aceternity UI (small grid)
 * For Hugin Lab and associated modules
 * 
 * @example
 * <GridsBackground />
 */
export function GridsBackground() {
  return <GridBackground />;
}
