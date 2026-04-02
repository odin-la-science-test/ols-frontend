import { useEffect, useRef, useMemo } from 'react';
import { useThemeStore } from '@/stores';
import { cn } from '@/lib/utils';

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  aspectRatio: number;
  highlightIntensity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  active: boolean;
}

interface InteractiveParticlesProps {
  className?: string;
  count?: number;
  particleSize?: number;
}

export function InteractiveParticles({ 
  className, 
  count = 200,
  particleSize = 3 
}: InteractiveParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const ripplesRef = useRef<Ripple[]>([]);
  const { theme } = useThemeStore();
  
  // Theme aware base color
  const baseColor = useMemo(() => {
    return theme === 'light' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(167, 139, 250, 0.2)';
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Get primary color from CSS variable
    const getPrimaryColor = () => {
      const hex = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
      // Handle hex to rgba if needed, but Canvas can use hex
      return hex || (theme === 'light' ? '#7C3AED' : '#A78BFA');
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const aspectRatio = canvas.width / canvas.height;
      const columns = Math.sqrt(count * aspectRatio);
      const rows = count / columns;
      
      const spacingX = canvas.width / columns;
      const spacingY = canvas.height / rows;

      for (let x = spacingX / 2; x < canvas.width; x += spacingX) {
        for (let y = spacingY / 2; y < canvas.height; y += spacingY) {
          const jitterX = (Math.random() - 0.5) * 40;
          const jitterY = (Math.random() - 0.5) * 40;
          
          particles.push({
            x: x + jitterX,
            y: y + jitterY,
            homeX: x + jitterX,
            homeY: y + jitterY,
            vx: 0,
            vy: 0,
            size: Math.random() * particleSize + 1,
            rotation: Math.random() * Math.PI,
            aspectRatio: 0.6 + Math.random() * 0.4, // Grain shape elongation
            highlightIntensity: 0,
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const interactionRadius = 220;
      const primaryColor = getPrimaryColor();
      
      // Update Ripples
      ripplesRef.current = ripplesRef.current.filter(r => r.active);
      ripplesRef.current.forEach(ripple => {
        ripple.radius += ripple.speed;
        if (ripple.radius > ripple.maxRadius) {
          ripple.active = false;
        }
      });

      particles.forEach((p) => {
        // Physics logic (Spring-back to home)
        const dxHome = p.homeX - p.x;
        const dyHome = p.homeY - p.y;
        p.vx += dxHome * 0.035;
        p.vy += dyHome * 0.035;
        
        // Mouse Repulsion
        const dxMouse = p.x - mouseX;
        const dyMouse = p.y - mouseY;
        const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;
        
        if (distSqMouse < interactionRadius * interactionRadius) {
          const distMouse = Math.sqrt(distSqMouse);
          const force = (interactionRadius - distMouse) / interactionRadius;
          const angle = Math.atan2(dyMouse, dxMouse);
          const pushForce = force * 1.8;
          p.vx += Math.cos(angle) * pushForce;
          p.vy += Math.sin(angle) * pushForce;
        }

        // Ripple Interaction (Aura Propagation)
        p.highlightIntensity *= 0.94; // Decay highlight
        ripplesRef.current.forEach(ripple => {
          const dxRipple = p.x - ripple.x;
          const dyRipple = p.y - ripple.y;
          const distRipple = Math.sqrt(dxRipple * dxRipple + dyRipple * dyRipple);
          const waveWidth = 80;
          
          if (distRipple > ripple.radius - waveWidth && distRipple < ripple.radius) {
            const intensity = (distRipple - (ripple.radius - waveWidth)) / waveWidth;
            p.highlightIntensity = Math.max(p.highlightIntensity, intensity);
            
            // Subtle push from the ripple wave
            const angle = Math.atan2(dyRipple, dxRipple);
            p.vx += Math.cos(angle) * intensity * 0.5;
            p.vy += Math.sin(angle) * intensity * 0.5;
          }
        });

        // Apply friction and update position
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        // Render Grain Shape (Ellipse)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        // Highlight logic
        if (p.highlightIntensity > 0.05) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * (1 + p.highlightIntensity * 0.5), p.size * p.aspectRatio * (1 + p.highlightIntensity * 0.5), 0, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = p.highlightIntensity * 0.8;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * p.aspectRatio, 0, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = 1;
        ctx.fill();
        
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(canvas.width, canvas.height) * 1.5,
        speed: 16,
        active: true
      });
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);
    
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, particleSize, baseColor, theme]);

  return (
    <canvas 
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ zIndex: 1 }}
    />
  );
}
