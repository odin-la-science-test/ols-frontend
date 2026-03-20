'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDensity } from '@/hooks';
import type { StatItem } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// STATS BAR - Quick statistics display
// ═══════════════════════════════════════════════════════════════════════════

interface StatsBarProps {
  stats: StatItem[];
  className?: string;
}

export function StatsBar({ stats, className }: StatsBarProps) {
  const d = useDensity();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center',
        d.statsBarGap,
        d.statsBarPadding,
        'rounded-xl',
        'bg-card border border-border',
        className
      )}
    >
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <StatCard stat={stat} index={index} />
          {index < stats.length - 1 && (
            <div className="hidden md:block h-8 w-px bg-border/50" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Single Stat Card ───
interface StatCardProps {
  stat: StatItem;
  index: number;
}

function StatCard({ stat, index }: StatCardProps) {
  const Icon = stat.icon;
  
  const getTrendIcon = () => {
    if (!stat.trend) return null;
    switch (stat.trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    if (!stat.trend) return '';
    switch (stat.trend.direction) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getValueColor = () => {
    switch (stat.color) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'destructive':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3"
    >
      {Icon && (
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
      <div>
        <div className="flex items-baseline gap-2">
          <span className={cn('text-xl font-bold', getValueColor())}>
            {stat.value}
          </span>
          {stat.trend && (
            <span className={cn('flex items-center gap-0.5 text-xs font-medium', getTrendColor())}>
              {getTrendIcon()}
              {stat.trend.value}%
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{stat.label}</span>
      </div>
    </motion.div>
  );
}
