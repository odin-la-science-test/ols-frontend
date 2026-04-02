'use client';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ArrowRight } from 'lucide-react';
import { useTabsStore } from '@/stores';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

// ═══════════════════════════════════════════════════════════════════════════
// RESUME WORKSPACE BUTTON
// Shown on landing pages (/, /atlas, /lab) when the user has open tabs.
// Navigates back to the last active tab.
// ═══════════════════════════════════════════════════════════════════════════

interface ResumeWorkspaceButtonProps {
  className?: string;
}

export function ResumeWorkspaceButton({ className }: ResumeWorkspaceButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tabs, activeTabId } = useTabsStore();

  const hasOpenTabs = tabs.length > 0;

  const handleResume = () => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[tabs.length - 1];
    if (activeTab) {
      navigate(activeTab.path);
    }
  };

  // Show only up to 3 tab icons as preview
  const previewTabs = tabs.slice(0, 3);
  const extraCount = tabs.length - 3;

  return (
    <AnimatePresence>
      {hasOpenTabs && (
        <motion.button
          onClick={handleResume}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/40 glass-overlay hover:border-border/70 transition-all duration-200 ${className ?? ''}`}
        >
          {/* Mobile: icon + tab count badge only */}
          <div className="flex sm:hidden items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
            {tabs.length > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-semibold">
                {tabs.length}
              </span>
            )}
          </div>

          {/* Desktop: full preview */}
          <div className="hidden sm:flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
            <div className="flex items-center -space-x-1">
              {previewTabs.map((tab) => (
                <div
                  key={tab.id}
                  className="w-5 h-5 rounded-md bg-muted/80 border border-border/50 flex items-center justify-center ring-1 ring-background"
                >
                  <DynamicIcon name={tab.icon} className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
              {extraCount > 0 && (
                <div className="w-5 h-5 rounded-md bg-muted/80 border border-border/50 flex items-center justify-center ring-1 ring-background">
                  <span className="text-[9px] text-muted-foreground font-medium">+{extraCount}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {t('workspace.resume')}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
