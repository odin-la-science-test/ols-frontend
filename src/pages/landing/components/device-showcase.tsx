import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Layout } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE SHOWCASE
//
// Animated 3D device mockups cycling between the 3 app layouts:
//   0 — IDE (desktop)      : title bar, activity bar, sidebars, tabs, status bar
//   1 — Classic (desktop)  : wide sidebar, nav bar, content card
//   2 — Mobile (phone)     : full-width content, bottom nav bar
// ═══════════════════════════════════════════════════════════════════════════

const CYCLE_MS = 5000;
const LAYOUTS = ['ide', 'classic', 'mobile'] as const;
type LayoutMode = (typeof LAYOUTS)[number];

const LAYOUT_META: Record<LayoutMode, { icon: typeof Monitor; label: string }> = {
  ide: { icon: Monitor, label: 'IDE' },
  classic: { icon: Layout, label: 'Classique' },
  mobile: { icon: Smartphone, label: 'Mobile' },
};

// ─── Theme tokens (Odin Dim) ───
const T = {
  bg: '#353438',
  surface: '#3a393d',
  chrome: '#434247',
  card: '#3c3b3f',
  border: '#53525a',
  fg: '#e5e1e6',
  fgDim: '#9e9da3',
  accent: '#c3c0ff',
  accentDim: 'rgba(195,192,255,0.25)',
  accentGhost: 'rgba(195,192,255,0.10)',
  emerald: '#3eba8a',
  emeraldDim: 'rgba(62,186,138,0.25)',
  amber: '#d4a04a',
  amberDim: 'rgba(212,160,74,0.25)',
  white5: 'rgba(255,255,255,0.05)',
  white8: 'rgba(255,255,255,0.08)',
  white12: 'rgba(255,255,255,0.12)',
  white20: 'rgba(255,255,255,0.20)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// IDE LAYOUT — flex-based, fills all available space
// ═══════════════════════════════════════════════════════════════════════════
function IdeContent() {
  const cols = [0.06, 0.24, 0.22, 0.2, 0.14, 0.14];
  const highlights: Record<number, string> = { 2: T.accentGhost, 5: T.emeraldDim, 8: T.amberDim };

  return (
    <div className="flex flex-col w-full h-full" style={{ background: T.bg }}>
      {/* Title bar */}
      <div className="flex items-center px-[3%] shrink-0 h-[7%]" style={{ background: T.chrome, borderBottom: `1px solid ${T.border}` }}>
        {['Home', 'Atlas', 'Lab', 'View'].map((m) => (
          <div key={m} className="px-[1%] text-[clamp(5px,1vw,8px)]" style={{ color: T.fgDim }}>{m}</div>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1 px-[2%] py-[0.5%] rounded" style={{ background: T.white8 }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.accentDim }} />
          <div className="h-1 w-10 rounded" style={{ background: T.white12 }} />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Activity bar */}
        <div className="w-[5%] shrink-0 flex flex-col items-center py-[2%] gap-[4%]" style={{ background: T.surface, borderRight: `1px solid ${T.border}` }}>
          {[T.accent, T.white20, T.white12, T.white8].map((c, i) => (
            <div key={i} className="w-[50%] aspect-square rounded" style={{ background: c }} />
          ))}
          <div className="mt-auto w-[50%] aspect-square rounded" style={{ background: T.white8 }} />
        </div>

        {/* Primary sidebar */}
        <motion.div
          className="w-[15%] shrink-0 flex flex-col py-[2%] px-[1.5%] overflow-hidden"
          style={{ background: T.surface, borderRight: `1px solid ${T.border}` }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '15%', opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="text-[clamp(5px,0.8vw,7px)] font-semibold mb-[4%]" style={{ color: T.fgDim }}>EXPLORER</div>
          <div className="flex-1 flex flex-col gap-[3%]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[5%] rounded" style={{ width: `${[90, 70, 55, 80, 45, 65, 85, 50, 75, 60, 40, 70][i]}%`, background: i === 0 ? T.accentDim : T.white8 }} />
            ))}
          </div>
        </motion.div>

        {/* Center */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center shrink-0 h-[6%]" style={{ borderBottom: `1px solid ${T.border}` }}>
            {[
              { label: 'Bacteriologie', color: T.accentDim, active: true },
              { label: 'Mycologie', color: T.emeraldDim, active: false },
              { label: 'Virologie', color: T.amberDim, active: false },
            ].map(({ label, color, active }) => (
              <div key={label} className="flex items-center gap-1 px-[2%] h-full" style={{ background: active ? T.bg : T.chrome, borderRight: `1px solid ${T.border}`, borderBottom: active ? `2px solid ${T.accent}` : 'none' }}>
                <div className="w-1.5 h-1.5 rounded" style={{ background: color }} />
                <div className="text-[clamp(5px,0.7vw,7px)] whitespace-nowrap" style={{ color: active ? T.fg : T.fgDim }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Data table — fills all space */}
          <div className="flex-1 flex flex-col p-[2.5%]" style={{ background: T.bg }}>
            {/* Toolbar */}
            <div className="flex items-center gap-[2%] h-[6%] mb-[2%] shrink-0">
              <div className="h-[70%] w-[25%] rounded" style={{ background: T.white8 }} />
              <div className="flex-1" />
              <div className="h-[70%] w-[12%] rounded" style={{ background: T.accentDim }} />
              <div className="h-[70%] w-[8%] rounded" style={{ background: T.white8 }} />
            </div>
            {/* Header */}
            <div className="flex gap-[0.8%] h-[5%] mb-[1%] shrink-0">
              {cols.map((w, i) => (
                <div key={i} className="rounded h-full" style={{ flex: w, background: T.white12 }} />
              ))}
            </div>
            {/* Rows — flex-1 fills remaining space */}
            <div className="flex-1 flex flex-col gap-[1%]">
              {Array.from({ length: 14 }).map((_, row) => (
                <div key={row} className="flex gap-[0.8%] flex-1">
                  {cols.map((w, i) => (
                    <div key={i} className="rounded h-full" style={{ flex: w, background: highlights[row] ?? T.white5 }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary sidebar */}
        <motion.div
          className="w-[14%] shrink-0 flex flex-col py-[2%] px-[1.5%] overflow-hidden"
          style={{ background: T.surface, borderLeft: `1px solid ${T.border}` }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '14%', opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-[clamp(5px,0.8vw,7px)] font-semibold mb-[3%]" style={{ color: T.fgDim }}>DETAILS</div>
          <div className="w-full h-[22%] rounded-sm mb-[4%]" style={{ background: T.white8 }} />
          <div className="flex-1 flex flex-col gap-[2.5%]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[4%] rounded" style={{ width: `${[90, 70, 50, 85, 60, 75, 40, 80, 55, 65][i]}%`, background: i % 3 === 0 ? T.white12 : T.white5 }} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Status bar */}
      <div className="flex items-center px-[3%] shrink-0 h-[4.5%]" style={{ background: T.chrome, borderTop: `1px solid ${T.border}` }}>
        <div className="w-2 h-1 rounded" style={{ background: T.accentDim }} />
        <div className="ml-[2%] w-12 h-1 rounded" style={{ background: T.white8 }} />
        <div className="flex-1" />
        <div className="w-8 h-1 rounded" style={{ background: T.white8 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIC LAYOUT — flex-based
// ═══════════════════════════════════════════════════════════════════════════
function ClassicContent() {
  return (
    <div className="flex w-full h-full" style={{ background: T.bg }}>
      {/* Sidebar */}
      <motion.div
        className="w-[18%] shrink-0 flex flex-col py-[2.5%] px-[1.5%]"
        style={{ background: T.surface, borderRight: `1px solid ${T.border}` }}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-[8%] mb-[8%]">
          <div className="w-[20%] aspect-square rounded-sm" style={{ background: T.accent }} />
          <div className="w-[50%] h-1.5 rounded" style={{ background: T.fg, opacity: 0.7 }} />
        </div>
        {/* Search */}
        <div className="h-[4.5%] rounded mb-[6%]" style={{ background: T.white8 }} />
        {/* Atlas */}
        <div className="text-[clamp(4px,0.7vw,6px)] font-bold uppercase mb-[3%]" style={{ color: T.accent }}>Atlas</div>
        <div className="flex flex-col gap-[2%] mb-[5%]">
          {[85, 65, 75, 55, 70, 60].map((w, i) => (
            <div key={i} className="h-[4%] rounded" style={{ width: `${w}%`, background: i === 0 ? T.accentDim : T.white5 }} />
          ))}
        </div>
        {/* Lab */}
        <div className="text-[clamp(4px,0.7vw,6px)] font-bold uppercase mb-[3%]" style={{ color: T.emerald }}>Lab</div>
        <div className="flex flex-col gap-[2%]">
          {[70, 60, 80, 50].map((w, i) => (
            <div key={i} className="h-[4%] rounded" style={{ width: `${w}%`, background: i === 0 ? T.emeraldDim : T.white5 }} />
          ))}
        </div>
        {/* User */}
        <div className="mt-auto flex items-center gap-[6%]">
          <div className="w-[18%] aspect-square rounded-full" style={{ background: T.white12 }} />
          <div className="w-[45%] h-1 rounded" style={{ background: T.white8 }} />
        </div>
      </motion.div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 p-[2%]">
        {/* Nav bar */}
        <motion.div
          className="flex items-center gap-[2%] mb-[1.5%] px-[2.5%] rounded-lg shrink-0 h-[7%]"
          style={{ background: T.chrome, border: `1px solid ${T.border}` }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: T.white12 }} />
            <div className="w-2 h-2 rounded-sm" style={{ background: T.white8 }} />
          </div>
          <div className="w-[30%] h-1 rounded" style={{ background: T.white12 }} />
        </motion.div>

        {/* Content card */}
        <motion.div
          className="flex-1 rounded-xl overflow-hidden flex flex-col"
          style={{ background: T.card, border: `1px solid ${T.border}` }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex-1 p-[2.5%] flex flex-col">
            {/* Header */}
            <div className="flex items-center mb-[2%] shrink-0">
              <div className="w-[18%] h-1.5 rounded" style={{ background: T.fg, opacity: 0.6 }} />
              <div className="flex-1" />
              <div className="w-[10%] h-2 rounded" style={{ background: T.accentDim }} />
            </div>
            {/* Cards grid — fills all remaining space */}
            <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-[2%]">
              {[T.accentDim, T.emeraldDim, T.amberDim, T.white8, T.accentGhost, T.emeraldDim, T.white5, T.amberDim, T.accentDim].map((accent, i) => (
                <div key={i} className="rounded-md p-[6%] flex flex-col" style={{ background: T.white5 }}>
                  <div className="h-[12%] w-[45%] rounded mb-auto" style={{ background: accent }} />
                  <div className="h-[8%] w-[80%] rounded mb-[4%]" style={{ background: T.white8 }} />
                  <div className="h-[8%] w-[60%] rounded" style={{ background: T.white5 }} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE LAYOUT — flex-based
// ═══════════════════════════════════════════════════════════════════════════
function MobileContent() {
  return (
    <div className="flex flex-col w-full h-full" style={{ background: T.bg }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-[6%] shrink-0 h-[3.5%]">
        <div className="text-[clamp(4px,0.6vw,6px)]" style={{ color: T.fgDim }}>9:41</div>
        <div className="flex gap-1">
          {[5, 3, 8].map((w, i) => (
            <div key={i} className="h-1 rounded-sm" style={{ width: w, background: T.white20 }} />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-[3%] px-[6%] shrink-0 h-[6%]">
        <div className="h-[70%] aspect-square rounded-sm" style={{ background: T.accent }} />
        <div className="w-[30%] h-1.5 rounded" style={{ background: T.fg, opacity: 0.7 }} />
        <div className="flex-1" />
        <div className="h-[65%] aspect-square rounded-full" style={{ background: T.white12 }} />
      </div>

      {/* Search */}
      <div className="px-[6%] shrink-0 h-[5%] py-[1%]">
        <div className="h-full rounded-lg" style={{ background: T.white8 }} />
      </div>

      {/* Cards — flex-1 fills all space, each card grows equally */}
      <div className="flex-1 flex flex-col gap-[1.5%] px-[6%] py-[2%] overflow-hidden">
        {[
          { accent: T.accentDim, title: '65%', sub: '85%' },
          { accent: T.emeraldDim, title: '50%', sub: '78%' },
          { accent: T.amberDim, title: '58%', sub: '72%' },
          { accent: T.white12, title: '55%', sub: '80%' },
          { accent: T.accentGhost, title: '45%', sub: '88%' },
          { accent: T.emeraldDim, title: '62%', sub: '70%' },
        ].map(({ accent, title, sub }, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-lg p-[3.5%] flex flex-col"
            style={{ background: T.white5 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.06, duration: 0.3 }}
          >
            <div className="flex items-center gap-[3%] mb-auto">
              <div className="w-[7%] aspect-square rounded" style={{ background: accent }} />
              <div className="h-1.5 rounded" style={{ width: title, background: T.white12 }} />
            </div>
            <div className="h-1 rounded" style={{ width: sub, background: T.white5 }} />
          </motion.div>
        ))}
      </div>

      {/* Bottom nav */}
      <motion.div
        className="flex items-center justify-around shrink-0 h-[6.5%]"
        style={{ background: T.chrome, borderTop: `1px solid ${T.border}` }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {[T.accent, T.white20, T.white20, T.white12].map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="w-2.5 h-2.5 rounded" style={{ background: c }} />
            <div className="w-3 h-0.5 rounded" style={{ background: i === 0 ? T.accentDim : T.white5 }} />
          </div>
        ))}
      </motion.div>

      {/* Home indicator */}
      <div className="flex justify-center py-[1%] shrink-0">
        <div className="w-[28%] h-[2px] rounded-full" style={{ background: T.white20 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE FRAMES
// ═══════════════════════════════════════════════════════════════════════════
function DesktopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ border: `1.5px solid ${T.border}` }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-[2%] py-1.5" style={{ background: '#1e1e22', borderBottom: `1px solid ${T.border}` }}>
        <div className="flex gap-1">
          <div className="rounded-sm" style={{ width: 7, height: 7, background: T.white12 }} />
          <div className="rounded-sm" style={{ width: 7, height: 7, background: T.white8 }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 rounded px-3 py-0.5" style={{ background: T.white8 }}>
            <div className="rounded-full" style={{ width: 5, height: 5, background: T.accentDim }} />
            <span className="text-[clamp(5px,0.8vw,8px)] font-mono" style={{ color: T.fgDim }}>odinlascience.fr</span>
          </div>
        </div>
      </div>
      <div className="aspect-[16/9]">
        {children}
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[20px] overflow-hidden shadow-2xl" style={{ width: '100%', border: `2px solid ${T.border}`, background: '#0a0a0c' }}>
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10 rounded-full" style={{ width: 32, height: 6, background: '#0a0a0c' }} />
      <div className="aspect-[9/18] overflow-hidden rounded-[18px]">
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT INDICATOR
// ═══════════════════════════════════════════════════════════════════════════
function LayoutIndicator({ active, onSelect }: { active: LayoutMode; onSelect: (m: LayoutMode) => void }) {
  return (
    <div className="flex items-center justify-center gap-1 mt-3">
      {LAYOUTS.map((mode) => {
        const { icon: Icon, label } = LAYOUT_META[mode];
        const isActive = mode === active;
        return (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors duration-300"
            style={{
              color: isActive ? T.accent : T.fgDim,
            }}
          >
            <Icon size={12} strokeWidth={1.5} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════
function CycleProgress({ active, duration }: { active: LayoutMode; duration: number }) {
  return (
    <div className="flex gap-1.5 mt-2 px-6">
      {LAYOUTS.map((mode) => (
        <div key={mode} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: T.white8 }}>
          {mode === active && (
            <motion.div
              className="h-full rounded-full"
              style={{ background: T.accent }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              key={`${mode}-${active}`}
            />
          )}
          {mode !== active && LAYOUTS.indexOf(mode) < LAYOUTS.indexOf(active) && (
            <div className="h-full w-full rounded-full" style={{ background: T.accent, opacity: 0.4 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const CONTENT_MAP: Record<LayoutMode, () => React.ReactNode> = {
  ide: () => <IdeContent />,
  classic: () => <ClassicContent />,
  mobile: () => <MobileContent />,
};

export function DeviceShowcase() {
  const [active, setActive] = useState<LayoutMode>('ide');
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => LAYOUTS[(LAYOUTS.indexOf(prev) + 1) % LAYOUTS.length]);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, CYCLE_MS);
    return () => clearInterval(timer);
  }, [paused, next, active]);

  const handleSelect = (mode: LayoutMode) => {
    setActive(mode);
    setPaused(true);
    setTimeout(() => setPaused(false), 10000);
  };

  const isPhone = active === 'mobile';

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fixed-height wrapper prevents layout shift between desktop/phone */}
      <div className="w-full aspect-[16/9] relative" style={{ perspective: 900 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, rotateY: isPhone ? 4 : -3, scale: 0.92, filter: 'blur(4px)' }}
            animate={{ opacity: 1, rotateY: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, rotateY: isPhone ? -4 : 3, scale: 0.92, filter: 'blur(4px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {isPhone ? (
              <div className="h-full py-[2%]">
                <div className="h-full" style={{ aspectRatio: '9/18' }}>
                  <PhoneFrame>{CONTENT_MAP[active]()}</PhoneFrame>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center">
                <DesktopFrame>{CONTENT_MAP[active]()}</DesktopFrame>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CycleProgress active={active} duration={paused ? 99999 : CYCLE_MS} />
      <LayoutIndicator active={active} onSelect={handleSelect} />
    </div>
  );
}
