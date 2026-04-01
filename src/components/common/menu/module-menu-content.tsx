'use client';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Check, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useAuthStore } from '@/stores';
import { useAdminViewStore } from '@/stores/admin-view-store';
import { registry } from '@/lib/module-registry';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { MenuItem, MenuSeparator } from './menu-primitives';
import type { OnCloseProps } from './types';

export function ModuleMenuContent({ onClose }: OnCloseProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const toolbar = useModuleToolbarStore((s) => s.registration);
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  // Resolve current module for admin view toggle
  const currentMod = registry.getByRoute(location.pathname);
  const hasAdminView = isAdmin && currentMod?.adminView;
  const isUserViewForced = useAdminViewStore((s) =>
    currentMod ? s.isUserViewForced(currentMod.id) : false
  );
  const toggleView = useAdminViewStore((s) => s.toggleView);

  const menuActions = toolbar?.actions.filter(
    (a) => a.placement === 'menu' || a.placement === 'both'
  ) ?? [];

  // Nothing to show if no actions and no admin toggle
  if (menuActions.length === 0 && !hasAdminView) return null;

  return (
    <>
      {menuActions.map((action, index) => {
        const isActive = action.isActive?.() ?? false;
        const isDisabled = action.isDisabled?.() ?? false;

        return (
          <span key={action.id}>
            {action.separator && index > 0 && <MenuSeparator />}
            <MenuItem
              onClick={() => { action.action(); onClose(); }}
              disabled={isDisabled}
            >
              <DynamicIcon name={action.icon} className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className="flex-1">{t(action.labelKey)}</span>
              {isActive && <Check className="h-3 w-3 text-primary shrink-0" />}
            </MenuItem>
          </span>
        );
      })}

      {/* Admin view toggle */}
      {hasAdminView && currentMod && (
        <>
          {menuActions.length > 0 && <MenuSeparator />}
          <MenuItem
            onClick={() => { toggleView(currentMod.id); onClose(); }}
          >
            {isUserViewForced ? (
              <>
                <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">{t('menuBar.adminView')}</span>
              </>
            ) : (
              <>
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">{t('menuBar.userView')}</span>
              </>
            )}
          </MenuItem>
        </>
      )}
    </>
  );
}
