import { useTranslation } from 'react-i18next';
import { Laptop, Smartphone, Tablet, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { FormSection, Badge } from '@/components/modules/shared';
import { useSessions, useRevokeSession, useRevokeAllOtherSessions } from '@/hooks/use-sessions';
import { formatRelativeTime } from '@/lib/format-time';
import type { SessionDTO } from '@/api/endpoints/auth';

function DeviceIcon({ deviceInfo }: { deviceInfo: string }) {
  const lower = deviceInfo.toLowerCase();
  const cls = "w-4.5 h-4.5 text-muted-foreground";
  if (lower.includes('android') || lower.includes('iphone'))
    return <Smartphone className={cls} strokeWidth={1.5} />;
  if (lower.includes('ipad') || lower.includes('tablet'))
    return <Tablet className={cls} strokeWidth={1.5} />;
  return <Laptop className={cls} strokeWidth={1.5} />;
}

function SessionCard({ session, onRevoke, isRevoking }: {
  session: SessionDTO;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/50">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
        <DeviceIcon deviceInfo={session.deviceInfo} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{session.deviceInfo}</span>
          {session.current && (
            <Badge variant="success" size="sm">
              {t('profile.currentSession')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{session.ipAddress}</span>
          <span className="text-border">·</span>
          <span>{t('profile.lastActive')} {formatRelativeTime(session.lastActiveAt, t)}</span>
        </div>
      </div>

      {!session.current && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className="text-xs text-muted-foreground hover:text-destructive flex-shrink-0"
        >
          {isRevoking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
          <span className="ml-1">{t('profile.revokeSession')}</span>
        </Button>
      )}
    </div>
  );
}

export function SessionsSection() {
  const { t } = useTranslation();
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllOtherSessions();

  const otherSessionsCount = sessions?.filter((s) => !s.current).length ?? 0;

  return (
    <FormSection
      id="sessions"
      title={t('profile.sessions')}
      description={t('profile.sessionsDesc')}
      delay={3}
      headerAction={
        otherSessionsCount > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => revokeAll.mutate()}
            disabled={revokeAll.isPending}
            className="text-xs"
          >
            {revokeAll.isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
            {t('profile.revokeAllOther')}
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={(id) => revokeSession.mutate(id)}
              isRevoking={revokeSession.isPending}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">{t('profile.noSessions')}</p>
      )}
    </FormSection>
  );
}
