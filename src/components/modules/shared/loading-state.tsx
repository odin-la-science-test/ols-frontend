'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// LOADING STATE - Wave DNA Loader (Elegant wave animation)
// ═══════════════════════════════════════════════════════════════════════════

// Couleurs thématiques — seul `primary` est utilisé par WaveLoader
const THEME_COLORS = {
  munin: { primary: MUNIN_PRIMARY },
  hugin: { primary: HUGIN_PRIMARY },
  default: { primary: 'hsl(217, 91%, 60%)' },
} as const;

export type LoaderTheme = keyof typeof THEME_COLORS;

interface WaveLoaderProps {
  /** Thème de couleur: 'munin' (violet), 'hugin' (vert), ou 'default' (bleu) */
  theme?: LoaderTheme;
  /** Taille du loader: 'sm', 'md', 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Couleur personnalisée (override le thème) */
  customColor?: string;
}

const SIZE_CONFIG = {
  sm: { barWidth: 3, barGap: 4, height: 20 },
  md: { barWidth: 4, barGap: 6, height: 32 },
  lg: { barWidth: 6, barGap: 8, height: 48 },
};

/**
 * WaveLoader - Loader élégant en forme d'onde sonore / ADN abstrait
 * 5 barres verticales qui ondulent de manière fluide et décalée
 */
export function WaveLoader({ 
  theme = 'default', 
  size = 'md',
  customColor 
}: WaveLoaderProps) {
  const colors = THEME_COLORS[theme];
  const primaryColor = customColor || colors.primary;
  const config = SIZE_CONFIG[size];
  
  // Animation décalée pour chaque barre (effet onde)
  const barVariants = {
    animate: (i: number) => ({
      scaleY: [0.3, 1, 0.3],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut' as const, // Ease-in-out pour fluidité
        delay: i * 0.12, // Décalage progressif pour l'effet d'onde
      },
    }),
  };

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        gap: `${config.barGap}px`,
        height: `${config.height}px`,
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={barVariants}
          animate="animate"
          className="rounded-full"
          style={{
            width: `${config.barWidth}px`,
            height: '100%',
            backgroundColor: primaryColor,
            transformOrigin: 'center',
            boxShadow: `0 0 ${config.barWidth * 2}px ${primaryColor}40`,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING STATE COMPONENT (avec le nouveau WaveLoader)
// ═══════════════════════════════════════════════════════════════════════════

interface LoadingStateProps {
  message?: string;
  className?: string;
  /** Thème de couleur: 'munin' (violet), 'hugin' (vert), ou 'default' (bleu) */
  theme?: LoaderTheme;
  /** Taille du loader */
  size?: 'sm' | 'md' | 'lg';
  /** Couleur personnalisée (override le thème) */
  customColor?: string;
}

export function LoadingState({
  message,
  className,
  theme = 'default',
  size = 'md',
  customColor,
}: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className
      )}
    >
      <WaveLoader theme={theme} size={size} customColor={customColor} />
      {message && (
        <motion.p 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-6 text-sm text-muted-foreground font-medium"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
