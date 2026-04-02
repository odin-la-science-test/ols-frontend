import { motion } from 'framer-motion';

export function DnaIllustration() {
  return (
    <motion.div 
      className="relative w-full h-full max-w-[2500px] aspect-[2/3] pointer-events-none flex items-center justify-start"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Static DNA-Tree Illustration - Reverted to centered and contained design */}
      <div
        className="w-full h-full bg-foreground/[0.4] dark:bg-foreground/[0.35] relative z-10"
        style={{
          maskImage: 'url(/images/dna-raven-sketch.png)',
          WebkitMaskImage: 'url(/images/dna-raven-sketch.png)',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center center',
          WebkitMaskPosition: 'center center',
        }}
      />
    </motion.div>
  );
}
