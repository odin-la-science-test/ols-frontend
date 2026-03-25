'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bell, Search, Layers, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAccentForPath } from '@/lib/accent-colors';
import { useTabsStore, type Tab, useCommandPaletteStore } from '@/stores';
import { useUnreadCount } from '@/features/notifications';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import { registry } from '@/lib/module-registry';
import { UserMenu } from '@/components/common/user-menu';

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE BOTTOM BAR - Navigation mobile fixe en bas
// Visible uniquement sur mobile (< lg / 1024px)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Tab Sheet (panneau slide-up des onglets) ───
interface TabSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function TabSheet({ isOpen, onClose }: TabSheetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tabs, activeTabId, setActiveTab, removeTab } = useTabsStore();

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
    onClose();
  };

  const handleCloseTab = (e: MouseEvent, tabId: string) => {
    e.stopPropagation();
    const wasActive = activeTabId === tabId;
    removeTab(tabId);
    if (wasActive) {
      const newActive = useTabsStore.getState().activeTabId;
      const newTab = useTabsStore.getState().tabs.find((t) => t.id === newActive);
      if (newTab) {
        navigate(newTab.path);
      } else {
        navigate('/workspace');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[95] bg-card border-t border-border rounded-t-2xl max-h-[60vh] flex flex-col"
          >
            {/* Handle + Header */}
            <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-border/50">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-3" />
              <div className="flex items-center justify-between w-full">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('tabs.openTabs', 'Onglets ouverts')}
                </h3>
                <span className="text-xs text-muted-foreground">{tabs.length}</span>
              </div>
            </div>

            {/* Tab list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {tabs.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  {t('tabs.noTabs', 'Aucun onglet ouvert')}
                </div>
              ) : (
                tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  const accentColor = getAccentForPath(tab.path);

                  return (
                    <div
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                        isActive
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50 border border-transparent'
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                          !accentColor && 'bg-muted text-foreground'
                        )}
                        style={accentColor ? {
                          backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                          color: accentColor,
                        } : undefined}
                      >
                        {getIconComponent(tab.icon, 'h-4 w-4')}
                      </div>

                      {/* Title */}
                      <span className={cn(
                        'flex-1 text-sm truncate',
                        isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      )}>
                        {tab.title}
                      </span>

                      {/* Active indicator */}
                      {isActive && (
                        <div
                          className={cn('w-2 h-2 rounded-full shrink-0', !accentColor && 'bg-foreground/40')}
                          style={accentColor ? { backgroundColor: accentColor } : undefined}
                        />
                      )}

                      {/* Close button */}
                      <button
                        onClick={(e) => handleCloseTab(e, tab.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Bottom Bar Button ───
interface BottomBarButtonProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  badge?: number;
  onClick: () => void;
}

function BottomBarButton({ icon, label, isActive, badge, onClick }: BottomBarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors relative',
        isActive ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      <div className="relative">
        {icon}
        {badge != null && badge > 0 && (
          <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium leading-tight">{label}</span>
    </button>
  );
}

// ─── Main Component ───
export function MobileBottomBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { tabs } = useTabsStore();
  const openCommandPalette = useCommandPaletteStore((s) => s.open);
  const { data: unreadData } = useUnreadCount();

  const [tabSheetOpen, setTabSheetOpen] = useState(false);

  const unreadCount = unreadData?.count ?? 0;

  // Determine which button is active based on current path
  const isHome = location.pathname === '/' || location.pathname === '/lab' || location.pathname === '/atlas';
  const notificationsPath = registry.getRoutePath('notifications') ?? '/lab/notifications';
  const isNotifications = location.pathname === notificationsPath;

  return (
    <>
      {/* Tab sheet overlay */}
      <TabSheet isOpen={tabSheetOpen} onClose={() => setTabSheetOpen(false)} />

      {/* Bottom bar - mobile only, fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-border bg-background px-2 pb-[env(safe-area-inset-bottom)]">
        <BottomBarButton
          icon={<Home className="h-5 w-5" />}
          label={t('common.home', 'Accueil')}
          isActive={isHome}
          onClick={() => navigate('/')}
        />

        <BottomBarButton
          icon={<Bell className="h-5 w-5" />}
          label={t('notifications.title', 'Notifs')}
          isActive={isNotifications}
          badge={unreadCount}
          onClick={() => navigate(notificationsPath)}
        />

        <BottomBarButton
          icon={<Search className="h-5 w-5" />}
          label={t('common.search', 'Rechercher')}
          onClick={() => openCommandPalette()}
        />

        <BottomBarButton
          icon={<Layers className="h-5 w-5" />}
          label={t('tabs.title', 'Onglets')}
          isActive={tabSheetOpen}
          badge={tabs.length > 0 ? tabs.length : undefined}
          onClick={() => setTabSheetOpen(!tabSheetOpen)}
        />

        <UserMenu variant="bottomBar" />
      </div>
    </>
  );
}
