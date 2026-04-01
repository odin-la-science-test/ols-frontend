"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";

interface PatternBackgroundProps {
  children?: ReactNode;
  className?: string;
  /** Pattern variant: 'grid' for lines, 'grid-small' for smaller lines, 'dots' for dot pattern */
  variant?: "grid" | "grid-small" | "dots";
}

/**
 * Pattern Background Effect - Aceternity UI
 * Clean, minimal background for professional pages
 * 
 * @example
 * <PatternBackground variant="dots">
 *   <div>Your content here</div>
 * </PatternBackground>
 */
export function PatternBackground({
  children,
  className,
  variant = "dots",
}: PatternBackgroundProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Couleurs subtiles selon le thème
  const dotColor = isDark ? 'rgba(255,255,255,0.04)' : '#DDD6FE';
  const gridColor = isDark ? 'rgba(255,255,255,0.03)' : '#EEEBFF';

  // Styles par variante avec inline styles pour éviter l'override
  const patternStyle: CSSProperties =
    variant === 'grid'
      ? {
          backgroundSize: '40px 40px',
          backgroundImage:
            `linear-gradient(to right, ${gridColor} 1px, transparent 1px),` +
            `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
        }
      : variant === 'grid-small'
      ? {
          backgroundSize: '20px 20px',
          backgroundImage:
            `linear-gradient(to right, ${gridColor} 1px, transparent 1px),` +
            `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
        }
      : {
          backgroundSize: '20px 20px',
          backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        };

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
      style={{ zIndex: 0 }}
    >
      {/* Pattern avec inline styles */}
      <div 
        className="absolute inset-0" 
        style={patternStyle}
      />
      
      {/* Radial gradient for faded look on edges */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {children && (
        <div className="relative z-10 pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Simple Dot Background - Aceternity UI style
 * For dashboard/main app pages
 */
export function DotBackground({ className }: { className?: string }) {
  return <PatternBackground variant="dots" className={className} />;
}

/**
 * Grid Background - Aceternity UI style
 * For dashboard/main app pages
 */
export function GridBackground({ className }: { className?: string }) {
  return <PatternBackground variant="grid-small" className={className} />;
}
