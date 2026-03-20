'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Share2,
  UserPlus,
  Info,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount, useMyNotifications, useMarkAsRead } from '../hooks';
import type { NotificationType } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION BELL - Compact bell icon with badge + dropdown
// Designed for placement in GlobalSidebar or AppShell
// ═══════════════════════════════════════════════════════════════════════════

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  QUICKSHARE_RECEIVED: Share2,
  CONTACT_ADDED: UserPlus,
  SYSTEM: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  QUICKSHARE_RECEIVED: 'text-blue-500',
  CONTACT_ADDED: 'text-emerald-500',
  SYSTEM: 'text-amber-500',
};

function formatShortTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '1m';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}j`;
}

interface NotificationBellProps {
  collapsed?: boolean;
}

export function NotificationBell({ collapsed }: NotificationBellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});

  const { data: unreadData } = useUnreadCount();
  const { data: notifications = [] } = useMyNotifications();
  const markAsRead = useMarkAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const recentNotifications = notifications.slice(0, 5);

  // Compute dropdown position relative to viewport when opening
  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: 320,
        zIndex: 9999,
      });
    }
    setOpen((v) => !v);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={cn(
          'relative flex items-center gap-2 w-full px-2 py-1.5 rounded-lg',
          'text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50',
          'transition-colors',
          collapsed && 'justify-center px-2'
        )}
        title={t('notifications.title')}
      >
        <Bell className="h-4 w-4" />
        {!collapsed && (
          <span className="flex-1 text-left">{t('notifications.title')}</span>
        )}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute flex items-center justify-center',
              'min-w-[18px] h-[18px] px-1 rounded-full',
              'bg-[hsl(160,84%,39%)] text-white text-[10px] font-bold',
              collapsed ? 'top-0 right-0' : 'top-0.5 right-1'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown — rendered in portal to escape overflow:hidden of sidebar */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={dropdownStyle}
              className="max-h-[420px] overflow-hidden bg-popover border border-border rounded-xl shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h4 className="text-sm font-semibold text-foreground">
                  {t('notifications.title')}
                </h4>
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {unreadCount} {t('notifications.unread')}
                  </span>
                )}
              </div>

              {/* Notification items */}
              <div className="overflow-y-auto max-h-[300px]">
                {recentNotifications.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.emptyTitle')}
                    </p>
                  </div>
                ) : (
                  recentNotifications.map((notif) => {
                    const Icon = TYPE_ICON[notif.type] || Bell;
                    const iconColor = TYPE_COLOR[notif.type] || 'text-muted-foreground';

                    return (
                      <button
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) markAsRead.mutate(notif.id);
                          if (notif.actionUrl) {
                            navigate(notif.actionUrl);
                          }
                          setOpen(false);
                        }}
                        className={cn(
                          'flex items-start gap-3 w-full px-4 py-3 text-left transition-colors',
                          'hover:bg-muted/50 border-b border-border/20 last:border-b-0',
                          !notif.read && 'bg-muted/20'
                        )}
                      >
                        <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconColor)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              'text-sm truncate',
                              notif.read ? 'text-muted-foreground' : 'text-foreground font-medium'
                            )}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(160,84%,39%)] flex-shrink-0" />
                            )}
                          </div>
                          {notif.message && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
                              {notif.message}
                            </p>
                          )}
                          <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                            {formatShortTime(notif.createdAt)}
                          </span>
                        </div>
                        {notif.actionUrl && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground/40 mt-1 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border/50">
                <button
                  onClick={() => {
                    navigate('/lab/notifications');
                    setOpen(false);
                  }}
                  className="text-xs text-[hsl(160,84%,39%)] hover:underline font-medium"
                >
                  {t('notifications.viewAll')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
