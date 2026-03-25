import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { toast } from '@/hooks';
import { ToggleRow } from './toggle-row';

// ─── Notifications Section ───

export function NotificationsSection() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);

  return (
    <FormSection
      id="notifications"
      title={t('settingsPage.notifications')}
      description={t('settingsPage.notificationsDesc')}
      icon={Bell}
      delay={3}
    >
      <ToggleRow
        icon={notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        label={t('settingsPage.enableNotifications')}
        description={t('settingsPage.enableNotificationsDesc')}
        checked={notifications}
        onChange={() => {
          setNotifications(!notifications);
          toast({
            title: !notifications
              ? t('settingsPage.notificationsEnabled')
              : t('settingsPage.notificationsDisabled'),
          });
        }}
      />
    </FormSection>
  );
}
