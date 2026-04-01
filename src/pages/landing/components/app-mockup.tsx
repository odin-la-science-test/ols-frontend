import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/**
 * Animated browser-window mockup of the Odin app interface.
 * Elements appear progressively for a "living product" feel.
 */
export function AppMockup() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Glow */}
      <div className="absolute -inset-4 bg-muted/30 rounded-3xl blur-2xl pointer-events-none" />

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/40">
        {/* Browser chrome */}
        <div className="bg-slate-800 dark:bg-slate-900 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-slate-700/60 rounded-md px-6 py-1 text-xs text-slate-400 font-mono">
              app.odinlascience.com
            </div>
          </div>
        </div>

        {/* App content - animated */}
        <motion.div
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 aspect-[16/9] p-4 sm:p-6 flex gap-3 sm:gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Sidebar */}
          <motion.div
            variants={fadeUp}
            className="w-12 sm:w-16 bg-white/5 rounded-lg flex flex-col items-center gap-3 p-2 pt-4 shrink-0"
          >
            <motion.div
              className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-violet-500/40"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
            <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-white/10" />
            <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-white/10" />
            <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-white/5" />
            <div className="mt-auto w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-white/5" />
          </motion.div>

          {/* Main area */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Toolbar */}
            <motion.div
              variants={fadeUp}
              className="h-8 sm:h-10 bg-white/5 rounded-lg flex items-center px-3 sm:px-4 gap-3 shrink-0"
            >
              <motion.div
                className="h-2.5 sm:h-3 bg-white/20 rounded"
                initial={{ width: 0 }}
                whileInView={{ width: '7rem' }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              />
              <div className="w-12 sm:w-16 h-2.5 sm:h-3 bg-white/10 rounded" />
              <div className="ml-auto w-6 sm:w-8 h-2.5 sm:h-3 bg-violet-500/30 rounded" />
            </motion.div>

            {/* Content cards */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { accent: 'bg-violet-500/20', delay: 0.4 },
                { accent: 'bg-emerald-500/20', delay: 0.6 },
                { accent: 'bg-amber-500/20', delay: 0.8, hideOnMobile: true },
              ].map(({ accent, delay, hideOnMobile }, i) => (
                <motion.div
                  key={i}
                  className={`bg-white/5 rounded-lg p-2.5 sm:p-3 flex flex-col gap-2 ${hideOnMobile ? 'hidden sm:flex' : ''}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay, duration: 0.5 }}
                >
                  <motion.div
                    className={`h-2 sm:h-2.5 ${accent} rounded`}
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
                  />
                  <div className="w-3/4 h-1.5 sm:h-2 bg-white/10 rounded" />
                  <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded" />
                  <div className="mt-auto w-1/2 h-1.5 sm:h-2 bg-white/5 rounded" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
