import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // Add import
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores';

interface LogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function Logo({ size = 100, className, animate = true }: LogoProps) {
  const { t } = useTranslation(); // Use hook
  const theme = useThemeStore((state) => state.theme);
  const logoSrc = theme === 'dark' ? '/logo_no_padding.png' : '/logo2_no_padding.png';

  const Component = animate ? motion.img : 'img';

  return (
    <Component
      src={logoSrc}
      alt={`${t('common.appName')} Logo`} // Translate alt text
      width={size}
      height={size}
      className={cn('drop-shadow-2xl object-contain', className)}
      {...(animate && {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5, ease: 'easeOut' },
      })}
    />
  );
}
