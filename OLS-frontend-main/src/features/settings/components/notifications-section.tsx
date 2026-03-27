import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Mail, MessageSquare, Users, Shield, Ticket } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { Label } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Mini Toggle ───

function MiniToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="shrink-0">
      <div className={cn(
        'relative w-8 h-[18px] rounded-full transition-colors duration-200',
        checked ? 'bg-foreground/60' : 'bg-border'
      )}>
        <div className={cn(
          'absolute top-[1px] w-4 h-4 rounded-full shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[14px] bg-background' : 'translate-x-[1px] bg-background border border-border'
        )} />
      </div>
    </button>
  );
}

// ─── Notification Category Row ───

interface NotifCategoryProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  inApp: boolean;
  email: boolean;
  onToggleInApp: () => void;
  onToggleEmail: () => void;
}

function NotifCategory({ icon, label, description, inApp, email, onToggleInApp, onToggleEmail }: NotifCategoryProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
      <div className="shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3 h-3 text-muted-foreground" />
          <MiniToggle checked={inApp} onChange={onToggleInApp} />
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-muted-foreground" />
          <MiniToggle checked={email} onChange={onToggleEmail} />
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Section ───

export function NotificationsSection() {
  const { t } = useTranslation();

  const [prefs, setPrefs] = useState({
    supportInApp: true, supportEmail: true,
    orgInApp: true, orgEmail: true,
    loginInApp: true, loginEmail: false,
    shareInApp: true, shareEmail: false,
    moduleInApp: true, moduleEmail: false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <FormSection
      id="notifications"
      title={t('settingsPage.notifications')}
      description={t('settingsPage.notificationsDesc')}
      icon={Bell}
      delay={3}
    >
      {/* Column headers */}
      <div className="flex items-center justify-end gap-3 px-3 pb-1">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3 h-3 text-muted-foreground" />
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('settingsPage.notifInApp')}</Label>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-muted-foreground" />
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('settingsPage.notifEmail')}</Label>
        </div>
      </div>

      <div className="space-y-0.5">
        <NotifCategory
          icon={<Ticket className="w-4 h-4" />}
          label={t('settingsPage.notifSupport')}
          description={t('settingsPage.notifSupportDesc')}
          inApp={prefs.supportInApp} email={prefs.supportEmail}
          onToggleInApp={() => toggle('supportInApp')} onToggleEmail={() => toggle('supportEmail')}
        />
        <NotifCategory
          icon={<Users className="w-4 h-4" />}
          label={t('settingsPage.notifOrganization')}
          description={t('settingsPage.notifOrganizationDesc')}
          inApp={prefs.orgInApp} email={prefs.orgEmail}
          onToggleInApp={() => toggle('orgInApp')} onToggleEmail={() => toggle('orgEmail')}
        />
        <NotifCategory
          icon={<Shield className="w-4 h-4" />}
          label={t('settingsPage.notifLogin')}
          description={t('settingsPage.notifLoginDesc')}
          inApp={prefs.loginInApp} email={prefs.loginEmail}
          onToggleInApp={() => toggle('loginInApp')} onToggleEmail={() => toggle('loginEmail')}
        />
        <NotifCategory
          icon={<MessageSquare className="w-4 h-4" />}
          label={t('settingsPage.notifShare')}
          description={t('settingsPage.notifShareDesc')}
          inApp={prefs.shareInApp} email={prefs.shareEmail}
          onToggleInApp={() => toggle('shareInApp')} onToggleEmail={() => toggle('shareEmail')}
        />
      </div>

      <p className="text-[10px] text-muted-foreground/60 px-3 pt-2">
        {t('settingsPage.notifSecurityNote')}
      </p>
    </FormSection>
  );
}
