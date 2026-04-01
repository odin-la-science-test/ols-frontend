'use client';

import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAccentForPath } from '@/lib/accent-colors';

export function ItemBadge({ count }: { count: number }) {
  const { pathname } = useLocation();
  const accentColor = getAccentForPath(pathname);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={cn(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center',
            'min-w-[16px] h-4 px-1 rounded-full',
            accentColor ? 'text-white' : 'bg-primary text-primary-foreground',
            'text-[9px] font-bold leading-none'
          )}
          style={accentColor ? { backgroundColor: accentColor } : undefined}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
