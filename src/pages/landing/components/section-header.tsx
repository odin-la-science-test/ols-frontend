import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

/**
 * Reusable section header for the landing page.
 * Uses semantic color tokens for dark/light theme support.
 */
export function SectionHeader({ title, subtitle, centered = true }: SectionHeaderProps) {
  return (
    <div className={`mb-12 sm:mb-16 ${centered ? 'text-center' : ''}`}>
      <motion.h2
        className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          className={`text-muted-foreground text-base sm:text-lg ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
