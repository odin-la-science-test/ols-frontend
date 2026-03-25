import { useState, type MouseEvent, type ReactNode } from 'react';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  accentColor: string;
  to?: string;
  onClick?: (e: MouseEvent) => void;
  isLocked?: boolean;
  delay?: number;
  className?: string;
  /** Enable 3D rotation hover effect */
  hover3D?: boolean;
  /** Direction for 3D effect: 'left' rotates toward right, 'right' rotates toward left */
  hover3DDirection?: 'left' | 'right';
  /** Enable colored background on hover */
  hoverColoredBg?: boolean;
  /** Compact horizontal layout (icon + title + description on one row) */
  compact?: boolean;
}

export function FeatureCard({
  title,
  description,
  icon,
  accentColor,
  to,
  onClick,
  isLocked = false,
  delay = 0,
  className,
  hover3D = false,
  hover3DDirection = 'left',
  hoverColoredBg = false,
  compact = false,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 3D rotation: left card rotates toward right (positive Y), right card rotates toward left (negative Y)
  const rotateY = hover3DDirection === 'left' ? 8 : -8;
  
  // Should we show the colored background?
  const showColoredBg = hoverColoredBg && isHovered && !isLocked;

  // For 3D effect, we need to track hover state
  const needsHoverTracking = hover3D || hoverColoredBg;

  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("relative h-full", className)}
      style={hover3D ? ({ 
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      } as any) : undefined}
      onMouseEnter={needsHoverTracking ? () => !isLocked && setIsHovered(true) : undefined}
      onMouseLeave={needsHoverTracking ? () => setIsHovered(false) : undefined}
    >
      <motion.div 
        className={cn(
          "relative h-full rounded-2xl overflow-hidden bg-card/90 backdrop-blur-md border border-border/70 transition-all duration-300 ease-out",
          isLocked 
            ? "grayscale-[30%]" 
            : !showColoredBg && "group-hover:border-border group-hover:bg-card"
        )}
        animate={hover3D ? {
          rotateY: isHovered ? rotateY : 0,
          rotateX: isHovered ? -2 : 0,
          scale: isHovered ? 1.02 : 1,
        } : undefined}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ 
          transformStyle: hover3D ? 'preserve-3d' : undefined,
          ...(showColoredBg && {
            background: accentColor,
            borderColor: 'transparent',
          }),
        } as any}
      >
        {/* Content */}
        <div className={cn(
          "relative z-10 flex h-full",
          compact ? "p-3.5 sm:p-4 flex-row items-center gap-3" : "p-6 flex-col"
        )}>
          {compact ? (
            /* ── Compact: horizontal icon + text ── */
            <>
              <div
                className="shrink-0 transition-colors duration-300"
                  style={{
                    color: isLocked
                      ? 'var(--color-muted-foreground)'
                      : showColoredBg
                        ? 'white'
                        : accentColor,
                  }}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {icon}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    !showColoredBg && "text-foreground"
                  )}
                  style={showColoredBg ? { color: 'white' } : undefined}
                >
                  {title}
                </span>
                {description && (
                  <span
                    className={cn(
                      "text-xs ml-2",
                      !showColoredBg && "text-muted-foreground"
                    )}
                    style={showColoredBg ? { color: 'rgba(255, 255, 255, 0.75)' } : undefined}
                  >
                    {description}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "shrink-0 transition-all duration-300",
                  isLocked ? "opacity-100" : showColoredBg ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ArrowUpRight
                    className="w-3.5 h-3.5"
                    style={{ color: showColoredBg ? 'white' : accentColor }}
                  />
                )}
              </div>
            </>
          ) : (
            /* ── Default: vertical layout ── */
            <>
          <div className="flex items-start justify-between mb-5">
            {/* Icon container */}
            <motion.div 
              className={cn(
                "transition-all duration-300 ease-out shrink-0",
                !isLocked && !showColoredBg && "group-hover:scale-105"
              )}
              animate={hover3D ? {
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? (hover3DDirection === 'left' ? 5 : -5) : 0,
              } : undefined}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ 
                color: isLocked 
                  ? 'var(--color-muted-foreground)' 
                  : showColoredBg 
                    ? 'white' 
                    : accentColor,
              } as any}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {icon}
              </div>
            </motion.div>
            
            {/* Arrow or Lock */}
            <div 
              className={cn(
                "transition-all duration-300 ease-out shrink-0",
                isLocked 
                  ? "opacity-100" 
                  : showColoredBg
                    ? "opacity-100"
                    : "opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0"
              )}
            >
              {isLocked ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ArrowUpRight 
                  className="w-4 h-4" 
                  style={{ color: showColoredBg ? 'white' : accentColor }} 
                />
              )}
            </div>
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <h3 
              className={cn(
                "text-lg font-semibold mb-2 transition-colors truncate",
                !showColoredBg && "text-foreground group-hover:text-foreground/90"
              )}
              style={showColoredBg ? { color: 'white' } : undefined}
            >
              {title}
            </h3>
            {description && (
              <p 
                className={cn(
                  "text-sm leading-relaxed line-clamp-2",
                  !showColoredBg && "text-muted-foreground"
                )}
                style={showColoredBg ? { color: 'rgba(255, 255, 255, 0.85)' } : undefined}
              >
                {description}
              </p>
            )}
          </div>
          
          {/* Bottom accent line */}
          <div 
            className={cn(
              "absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300",
              isLocked || showColoredBg ? "opacity-0" : "opacity-0 group-hover:opacity-100"
            )}
            style={{ 
              background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
            }}
          />
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const wrapperClass = "group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl text-left";

  if (isLocked || !to) {
    return (
      <div 
        onClick={onClick} 
        className={cn(wrapperClass, onClick ? "cursor-pointer" : "cursor-default")} 
        role={onClick ? "button" : undefined}
      >
        {CardContent}
      </div>
    );
  }

  return (
    <Link to={to} className={wrapperClass}>
      {CardContent}
    </Link>
  );
}
